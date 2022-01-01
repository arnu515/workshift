<script lang="ts">
  import axios from "$lib/axios";
  import { organisation } from "$lib/stores/organisation";
  import { getMessage } from "$lib/util";
  import { toast } from "@zerodevx/svelte-toast";
  import { onMount } from "svelte";
  import type { User } from "@prisma/client";
  import user from "$lib/stores/user";

  let members: User[] | null = null;
  let doingSomething = false;

  onMount(async () => {
    const res = await axios.get(`/organisations/${$organisation.id}/members`);
    if (res.status === 200) {
      members = res.data.members;
    } else toast.push(getMessage(res));
  });

  async function removeMember(memberId: User["id"]) {
    if (doingSomething) {
      toast.push("Please wait for the previous action to complete.");
      return;
    }
    doingSomething = true;
    const res = await axios.delete(
      `/organisations/${$organisation.id}/members/${memberId}`
    );
    doingSomething = false;
    if (res.status.toString().startsWith("2")) {
      members = members?.filter(member => member.id !== memberId);
    } else toast.push(getMessage(res));
  }
</script>

<div class="p-4">
  <h1 class="text-5xl font-bold my-4">Members</h1>
  {#if members}
    {#if members.length}
      <ul class="flex flex-col gap-3">
        {#each members as member}
          <li class="flex gap-4 p-1 items-center">
            <img
              src={member.avatarUrl}
              alt="Avatar of {member.username}"
              class="rounded-full w-8 h-8"
            />
            <span>{member.username}</span>
            <span class="text-gray-500 text-sm">&lt;{member.email}&gt;</span>
            {#if $organisation.owner_id === $user.id && member.id !== $user.id}
              <button
                class="p-1 text-red-500 hover:text-red-600 cursor-pointer ml-auto"
                title="Remove from organisation"
                aria-label="Remove from organisation"
                on:click={() =>
                  window.confirm("Are you sure?") && removeMember(member.id)}
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
                    d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                  />
                </svg>
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-700 my-4 text-xl">
        There are no members in this organisation.
      </p>
    {/if}
  {:else}
    <p class="text-gray-700 my-4 text-xl">Loading members...</p>
  {/if}
</div>
