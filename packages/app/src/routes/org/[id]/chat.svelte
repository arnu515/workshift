<script lang="ts">
  import {organisation, channels, messages} from "$lib/stores/organisation"
  import { onMount } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  import type {ChatChannels} from "@prisma/client"
import { toast } from "@zerodevx/svelte-toast";

  let currentChannel: ChatChannels | null = null;
  let timeRefreshed = Date.now() - (1000 * 60);

  function refreshMessages(channelId: ChatChannels["id"]) {
    if ((Date.now() - timeRefreshed) > 1000 * 60) {
      timeRefreshed = Date.now();
      messages.refresh($organisation.id, channelId, true);
    } else toast.push(`Please wait ${Math.floor(
          (1000 * 60 - (Date.now() - timeRefreshed)) / 1000
    )} seconds before refreshing messages. Messages are updated realtime, so only refesh if you feel you've been disconnected.`);
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
    <h1 class="text-3xl font-bold m-2 py-2">{$organisation.name}</h1>
    {#if !$channels}
    <div class="m-2">
      <Loader />
    </div>
    {:else}
      {#if !$channels.length}
        <p class="m-2 text-xl">There are no channels</p>
      {:else}
      <div class="flex flex-col">
        {#each $channels as channel}
          <button on:click={() => currentChannel = {...channel}} class="block w-full px-2 py-1 text-left hover:bg-gray-300 transition-colors duration-100 cursor-pointer {(currentChannel && currentChannel.id === channel.id) ? "italic bg-gray-300" : ""}">{channel.name}</button>
        {/each}
      </div>
    {/if}
    {/if}
  </div>
  <div class="bg-white">
    {#if currentChannel}
    <header class="bg-white border-b border-gray-400 text-3xl font-bold flex items-center justify-between px-4 py-2">
      {currentChannel.name}
      <button
        title="Refresh"
        aria-label="Refresh messages"
        class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        on:click={() => refreshMessages(currentChannel.id)}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      </button>
    </header>
    {:else}
    <div class="flex flex-col items-center justify-center h-full">
      <p class="text-xl">Pick a channel in the sidebar</p>
    </div>
    {/if}
  </div>
</div>
