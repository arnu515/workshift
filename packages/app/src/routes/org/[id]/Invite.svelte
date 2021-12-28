<script lang="ts">
  import type { Organisation } from "@prisma/client";
  import { onMount } from "svelte";
  import user from "$lib/stores/user";
  import { organisation } from "$lib/stores/organisation";
  import { navigate } from "svelte-navigator";
  import axios from "$lib/axios";
  import { toast } from "@zerodevx/svelte-toast";
  import { getMessage } from "$lib/util";
  import type { User } from "@prisma/client";
  import Loader from "$lib/components/Loader.svelte";
  import { isMongoId } from "class-validator";
  import qs from "qs";

  let pendingInvites: ({ invitedUser: User } & { [key: string]: string })[] | null =
    null;
  let searchedUsers: User[] | null = null;
  let searchLoading = false;

  async function getPendingInvites() {
    const res = await axios.get(`/organisations/${$organisation.id}/invites`);
    if (res.status.toString().startsWith("2")) pendingInvites = res.data.invites;
    else toast.push(getMessage(res));
  }

  onMount(async () => {
    if ($organisation.owner_id !== $user.id)
      return navigate(`/org/${$organisation.id}/chats`);
    await getPendingInvites();
  });

  async function cancelInvite(invite: typeof pendingInvites[number]) {
    const res = await axios.delete(
      `/organisations/${$organisation.id}/invites/${invite.id}`
    );
    if (res.status.toString().startsWith("2")) {
      pendingInvites = pendingInvites.filter(i => i.id !== invite.id);
    } else toast.push(getMessage(res));
  }

  async function searchUser() {
    if (searchLoading) return;
    const searchString = (
      document.getElementById("searchString") as HTMLInputElement
    ).value?.trim();
    if (!searchString) return;
    searchLoading = true;
    if (isMongoId(searchString)) {
      const res = await axios.post(`/organisations/${$organisation.id}/invites`, {
        userId: searchString
      });
      searchLoading = false;
      if (res.status.toString().startsWith("2")) {
        await getPendingInvites();
      } else toast.push(getMessage(res));
    } else {
      const res = await axios.post(
        `${import.meta.env.VITE_MONGODB_ENDPOINT}/search/user?${qs.stringify({
          secret: import.meta.env.VITE_MONGODB_SEARCH_SECRET
        })}`,
        {
          searchString
        }
      );
      searchLoading = false;
      if (res.status.toString().startsWith("2")) {
        searchedUsers = res.data.data;
      } else {
        toast.push(getMessage(res));
      }
    }
    (document.getElementById("searchString") as HTMLInputElement).value = "";
  }

  async function inviteUser(user: any) {
    const res = await axios.post(`/organisations/${$organisation.id}/invites`, {
      userId: user._id["$oid"]
    });
    if (res.status.toString().startsWith("2")) {
      pendingInvites = [
        ...pendingInvites,
        {
          invitedUser: user,
          ...res.data.invite
        }
      ];
    } else toast.push(getMessage(res));
  }
</script>

<div class="p-4">
  <h1 class="text-5xl font-bold my-4">Invite a user</h1>
  <form class="my-2" on:submit|preventDefault={searchUser}>
    <label for="searchString">Enter a username, email, or ID to search for a user</label
    >
    <input
      class:loading={searchLoading}
      disabled={searchLoading}
      type="search"
      id="searchString"
      placeholder="Enter a username, email, or ID and press enter"
    />
  </form>
  <h3 class="text-2xl">Search results</h3>
  <ul class="flex flex-col gap-2">
    {#if searchedUsers?.length}
      {#each searchedUsers as u}
        <li class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img class="h-8 w-8 rounded-full mr-2" src={u.avatarUrl} alt="avatar" />
            <div>
              <div class="text-xl font-bold">{u.username}</div>
              <div class="text-sm">{u.email}</div>
            </div>
          </div>
          <button
            type="button"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            on:click={() => inviteUser(u)}
          >
            Invite
          </button>
        </li>
      {/each}
    {:else}
      <p>No results found.</p>
    {/if}
  </ul>

  <h2 class="text-3xl font-bold my-4">Pending invites</h2>
  {#if pendingInvites === null}
    <Loader />
  {:else if pendingInvites.length === 0}
    <p>No pending invites</p>
  {:else}
    <ul>
      {#each pendingInvites as invite}
        <li class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img
              src={invite.invitedUser.avatarUrl}
              alt="Avatar of {invite.invitedUser.username}"
              class="w-12 h-12 rounded-full mr-2"
            />
            <div>
              <p class="text-xl font-bold">{invite.invitedUser.username}</p>
              <p class="text-sm">{invite.invitedUser.email}</p>
            </div>
          </div>
          <button
            class="p-2 rounded-full cursor-pointer transition-colors duration-100 text-red-500 hover:bg-red-100"
            on:click={() => cancelInvite(invite)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
