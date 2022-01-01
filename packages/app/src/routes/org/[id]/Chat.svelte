<script lang="ts">
  import { organisation, channels, messages } from "$lib/stores/organisation";
  import user from "$lib/stores/user";
  import { onMount } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  import type { ChatChannels } from "@prisma/client";
  import { toast } from "@zerodevx/svelte-toast";
  import axios from "$lib/axios";
  import { getMessage } from "$lib/util";
  import dayjs from "dayjs";
  import rt from "dayjs/plugin/relativeTime";
  import qs from "qs";

  dayjs.extend(rt);

  let currentChannel: ChatChannels | null = null;
  let timeRefreshed = Date.now() - 1000 * 60;

  let typedMessage = "";
  async function sendMessage() {
    if (!currentChannel) return;
    if (!typedMessage.trim()) return;
    const res = await axios.post(
      `/organisations/${$organisation.id}/channels/${currentChannel.id}/messages/text`,
      {
        text: typedMessage.trim()
      }
    );
    typedMessage = "";

    if (res.status.toString().startsWith("2")) {
      messages.update(m => {
        const i = currentChannel.id;
        if (Array.isArray(m[i])) {
          m[i].unshift(res.data);
        } else {
          m[i] = [res.data];
        }
        document
          .getElementById(`message-${res.data?.id}`)
          ?.scrollIntoView({ behavior: "smooth" });
        return m;
      });
    } else {
      toast.push(getMessage(res));
    }
  }

  function refreshMessages(channelId: ChatChannels["id"], skip = 0, take = 100) {
    if (Date.now() - timeRefreshed > 1000 * 60) {
      timeRefreshed = Date.now();
      messages.refresh($organisation.id, channelId, true, skip, take);
    } else
      toast.push(
        `Please wait ${Math.floor(
          (1000 * 60 - (Date.now() - timeRefreshed)) / 1000
        )} seconds before refreshing messages. Messages are updated realtime, so only refesh if you feel you've been disconnected.`
      );
  }

  let hasMoreMessages = true;
  async function loadMoreMessages() {
    if (!currentChannel) return;
    if (Date.now() - timeRefreshed < 1000 * 60) {
      toast.push(
        `Please wait ${Math.floor(
          (1000 * 60 - (Date.now() - timeRefreshed)) / 1000
        )} seconds before loading more messages`
      );
      return;
    }
    if (!hasMoreMessages) return;
    const page = Math.ceil($messages[currentChannel.id].length / 20);
    const { status, data } = await axios.get(
      "/organisations/" +
        $organisation.id +
        "/channels/" +
        currentChannel.id +
        "/messages?" +
        qs.stringify({
          skip: page * 100,
          take: 100
        })
    );
    if (status !== 200) {
      toast.push(getMessage({ status, data }));
      return;
    }
    if (data.messages.length < 20) {
      hasMoreMessages = false;
    }
    messages.update(x => {
      x[currentChannel.id] = [...x[currentChannel.id], ...data.messages];
      return x;
    });
  }

  function uploadFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.addEventListener("change", async e => {
      const el = e.target as HTMLInputElement;
      if (el.files.length) {
        const file = el.files[0];
        // check if file is smaller than 2mb
        if (file.size > 2097152) {
          toast.push(
            "Maximum file size is 2 MB. This file is " + file.size / 1024 / 1024 + " MB"
          );
          return;
        }

        const fd = new FormData();
        fd.append("file", file);
        toast.push("Uploading file", { theme: { "--toastBarBackground": "gray" } });
        const res = await axios.post(
          `/organisations/${$organisation.id}/channels/${currentChannel.id}/messages/file`,
          fd
        );
        if (res.status.toString().startsWith("2")) {
          toast.push("File uploaded", { theme: { "--toastBarBackground": "green" } });
          messages.update(m => {
            const i = currentChannel.id;
            if (Array.isArray(m[i])) {
              m[i].unshift(res.data);
            } else {
              m[i] = [res.data];
            }
            document
              .getElementById(`message-${res.data?.id}`)
              ?.scrollIntoView({ behavior: "smooth" });
            return m;
          });
        } else {
          toast.push(getMessage(res));
        }
      }
    });
  }

  async function deleteMessage(message: any) {
    const res = await axios.delete(
      `/organisations/${$organisation.id}/channels/${currentChannel.id}/messages/${message.type}/${message.id}`
    );
    if (res.status.toString().startsWith("2")) {
      messages.update(m => {
        const i = currentChannel.id;
        if (Array.isArray(m[i])) {
          m[i] = m[i].filter(x => x.id !== message.id);
        }
        return m;
      });
    } else {
      toast.push(getMessage(res));
    }
  }

  async function editMessage(message: any) {
    const newText = window.prompt(
      "Edit message. Use <br> for line breaks.",
      message.content
    );
    if (!newText) {
      toast.push("Message not edited");
      return;
    }
    const res = await axios.put(
      `/organisations/${$organisation.id}/channels/${currentChannel.id}/messages/${message.type}/${message.id}`,
      { text: newText }
    );
    if (res.status.toString().startsWith("2")) {
      messages.update(m => {
        const i = currentChannel.id;
        if (Array.isArray(m[i])) {
          m[i] = m[i].map(x => (x.id === message.id ? res.data : x));
        }
        return m;
      });
      toast.push("Edited message", { theme: { "--toastBarBackground": "green" } });
    } else {
      toast.push(getMessage(res));
    }
  }

  async function deleteChannel(channel: any) {
    const res = await axios.delete(
      `/organisations/${$organisation.id}/channels/${channel.id}`
    );
    if (res.status.toString().startsWith("2")) {
      channels.refresh($organisation.id);
      if (currentChannel?.id === channel.id) {
        currentChannel = undefined;
      }
      toast.push("Channel deleted", { theme: { "--toastBarBackground": "green" } });
    } else {
      toast.push(getMessage(res));
    }
  }

  async function editChannel(channel: any) {
    const newText = window.prompt("New name", channel.name);
    if (!newText) {
      toast.push("Channel not edited");
      return;
    }
    const res = await axios.put(
      `/organisations/${$organisation.id}/channels/${channel.id}`,
      { name: newText }
    );
    if (res.status.toString().startsWith("2")) {
      channels.refresh($organisation.id);
      toast.push("Channel edited", { theme: { "--toastBarBackground": "green" } });
    } else {
      toast.push(getMessage(res));
    }
  }

  async function createChannel() {
    const name = window.prompt("Channel name");
    if (!name) {
      toast.push("Channel not edited");
      return;
    }
    const res = await axios.post(`/organisations/${$organisation.id}/channels`, {
      name
    });
    if (res.status.toString().startsWith("2")) {
      channels.refresh($organisation.id);
      toast.push("Channel created", { theme: { "--toastBarBackground": "green" } });
    } else {
      toast.push(getMessage(res));
    }
  }

  onMount(async () => {
    channels.refresh($organisation.id);
  });

  $: if (currentChannel) {
    messages.refresh($organisation.id, currentChannel.id);
  }
</script>

<div class="grid" style="grid-template-columns: 300px auto; height: calc(100vh - 44px)">
  <div class="bg-gray-200 border-r border-gray-400">
    <h1 class="text-3xl font-bold m-2 py-2 flex items-center justify-between">
      {$organisation.name}
      <button
        title="Create channel"
        aria-label="Create a channel"
        class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        on:click={createChannel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </h1>
    {#if !$channels}
      <div class="m-2">
        <Loader />
      </div>
    {:else if !$channels.length}
      <p class="m-2 text-xl">There are no channels</p>
    {:else}
      <div class="flex flex-col">
        {#each $channels as channel}
          <button
            on:click|self={() => (currentChannel = { ...channel })}
            class="w-full px-2 py-1 text-left hover:bg-gray-300 transition-colors duration-100 cursor-pointer flex items-center gap-2 {currentChannel &&
            currentChannel.id === channel.id
              ? 'italic bg-gray-300'
              : ''}"
          >
            <span>{channel.name}</span>
            <div class="ml-auto mr-1">
              {#if channel.owner_id === $user.id}
                <button
                  class="p-1 text-gray-500 hover:text-gray-600 cursor-pointer"
                  title="Edit"
                  aria-label="Edit"
                  on:click={() => editChannel(channel)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    />
                  </svg>
                </button>
                <button
                  class="p-1 text-red-500 hover:text-red-600 cursor-pointer"
                  title="Delete"
                  aria-label="Delete"
                  on:click={() => deleteChannel(channel)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  <div class="bg-white flex flex-col justify-between overflow-hidden">
    {#if currentChannel}
      <header
        class="bg-white border-b border-gray-400 text-3xl font-bold flex items-center justify-between px-4 py-2"
      >
        {currentChannel.name}
        <button
          title="Refresh"
          aria-label="Refresh messages"
          class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
          on:click={() => refreshMessages(currentChannel.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>
      <div class="flex-grow overflow-auto">
        {#if $messages[currentChannel.id]}
          <div class="flex flex-col gap-2 m-4">
            <p class="text-gray-500 text-center my-2 text-sm">
              Messages are listed from top to bottom. The newest ones are at the top
            </p>
            {#each $messages[currentChannel.id] as message}
              <div
                id="message-{message.id}"
                class="border border-gray-400 p-1 flex flex-col gap-2"
                class:bg-blue-100={$user.id === message.user.id}
                class:bg-gray-100={$user.id !== message.user.id}
              >
                <div class="text-sm flex items-center gap-2">
                  <img
                    src={message.user.avatarUrl}
                    alt="Avatar of {message.user.username}"
                    class="w-4 h-4 rounded-full"
                  />
                  <span class="font-bold"
                    >{message.user.username}
                    <span class="font-normal text-sm text-gray-500"
                      >&lt;{message.user.email}&gt;</span
                    ></span
                  >
                  <span
                    title={dayjs(message.created_at).format(
                      "DD MMM, YYYY [at] HH:mm:ss"
                    )}
                    class="ml-auto mr-2 text-gray-500"
                    >{dayjs(message.created_at).fromNow()}</span
                  >
                  {#if message.user.id === $user.id}
                    {#if message.type === "text"}
                      <button
                        class="p-1 text-gray-500 hover:text-gray-600 cursor-pointer"
                        title="Edit"
                        aria-label="Edit"
                        on:click={() => editMessage(message)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                          />
                        </svg>
                      </button>
                    {/if}
                    <button
                      class="p-1 text-red-500 hover:text-red-600 cursor-pointer"
                      title="Delete"
                      aria-label="Delete"
                      on:click={() => deleteMessage(message)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  {/if}
                </div>
                {#if message.type === "text"}
                  <div class="mx-1">{@html message.content}</div>
                {:else}
                  <div class="mx-1 flex gap-2 items-center">
                    <strong class="text-lg">Uploaded a file:</strong>
                    <a
                      href={import.meta.env.VITE_B2_BUCKET_BASE_URL.toString() +
                        "/" +
                        message.content}
                      target="_blank"
                      class="text-primary hover:underline"
                      >{message.content.split("/").pop()}</a
                    >
                    <div class="ml-auto">
                      <a
                        href={import.meta.env.VITE_B2_BUCKET_BASE_URL.toString() +
                          "/" +
                          message.content}
                        target="_blank"
                        title="Download"
                        aria-label="Download file"
                        class="p-2 block bg-primary text-white hover:bg-primary-700 rounded-full cursor-pointer duration-500 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          <p class="text-center my-4">
            You've reached the bottom. {#if hasMoreMessages}<button
                class="text-primary cursor-pointer hover:underline"
                on:click={loadMoreMessages}>Load more</button
              >{/if}
          </p>
        {:else}
          <div class="my-4 flex justify-center items-center">
            <Loader />
          </div>
        {/if}
      </div>
      <form on:submit|preventDefault={sendMessage} class="mb-1 flex items-center gap-1">
        <button
          title="Upload"
          aria-label="Upload file"
          type="button"
          on:click={uploadFile}
          class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <textarea
          on:keydown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={2}
          type="text"
          placeholder="Type your message here. Press Shift+Enter to add a new line"
          aria-label="Message"
          bind:value={typedMessage}
        />
        <button
          title="Send"
          aria-label="Send message"
          class="p-2 bg-transparent {typedMessage.trim()
            ? 'text-primary'
            : 'text-gray-500'} hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        >
          {#if !typedMessage.trim()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style="transform: rotate(90deg)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="transform: rotate(90deg)"
            >
              <path
                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
              />
            </svg>
          {/if}
        </button>
      </form>
    {:else}
      <div class="flex flex-col items-center justify-center h-full">
        <p class="text-xl">Pick a channel in the sidebar</p>
      </div>
    {/if}
  </div>
</div>
