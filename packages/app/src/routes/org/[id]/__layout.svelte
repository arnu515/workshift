<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  import axios from "$lib/axios";
  import { getMessage } from "$lib/util";

  export const load: Load = async ({ page }) => {
    const orgId = page.params.id;

    const res = await axios.get(`/organisations/${orgId}/members`);
    if (res.status === 401) {
      return { redirect: "/logout" };
    }
    if (!res.status.toString().startsWith("2")) {
      return {
        status: res.status,
        error: new Error(getMessage(res.data))
      };
    }

    return {
      props: { organisation: res.data, path: page.path },
      stuff: { organisation: res.data }
    };
  };
</script>

<script lang="ts">
  import { user } from "$lib/stores/user";
  import { org } from "$lib/stores/org";
  import { invites } from "$lib/stores/invites";
  import { onMount } from "svelte";
  import md5 from "md5";
  import type { Organisation, User } from "@prisma/client";
  import OrgCard from "$lib/components/OrgCard.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";

  export let organisation: Organisation & { members: User[] };
  export let path: string;
  $: inv = $invites?.find(x => x.organisation_id === organisation.id);

  onMount(async () => {
    await invites.refresh();
  });

  async function acceptInvite(inviteId: string, orgId: string) {
    $invites = $invites.filter(inv => inv.id !== inviteId);
    await invites.acceptOrDeclineInvite({ id: inviteId, orgId, action: "accept" });
    window.location.reload();
  }

  async function declineInvite(inviteId: string, orgId: string) {
    $invites = $invites.filter(inv => inv.id !== inviteId);
    await invites.acceptOrDeclineInvite({ id: inviteId, orgId, action: "decline" });
    await org.refresh();
    await invites.refresh();
  }

  $: console.log($invites);
</script>

{#if organisation && $user}
  {#if organisation.member_ids?.includes($user.id)}
    <Sidebar orgId={organisation.id} activePath={path.split("/").pop()} />
    <slot />
  {:else}
    <div class="my-6 mx-auto max-w-[950px]">
      <OrgCard {organisation} />
      {#if inv}
        <div class="border border-gray-400 shadow bg-white rounded px-4 py-2 mt-6">
          <h3 class="text-3xl font-bold my-4">You have been invited</h3>
          <p class="text-gray-700">
            You have been invited to join the organisation <b>{organisation.name}</b>
          </p>
          <p class="inv-actions">
            <button
              class="b accept"
              on:click={() => acceptInvite(inv.id, inv.organisation_id)}
              title="Accept"
              aria-label="Accept"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              class="b decline"
              on:click={() => declineInvite(inv.id, inv.organisation_id)}
              title="Decline"
              aria-label="Decline"
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
          </p>
        </div>
      {/if}
      <div class="border border-gray-400 shadow bg-white rounded px-4 py-2 mt-6">
        <h3 class="text-3xl font-bold my-4">Members</h3>
        {#if organisation.members}
          {#if organisation.members.length}
            <ul class="flex flex-col gap-2">
              {#each organisation.members as member}
                <li class="flex gap-4 items-center">
                  <img
                    src="https://gravatar.com/avatar/{md5(member.email)}"
                    alt="Avatar of {member.username}"
                    class="rounded-full w-8 h-8"
                  />
                  <span class="text-gray-500">{member.username}</span>
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
    </div>
  {/if}
{/if}

<style lang="postcss">
  .inv-actions {
    @apply flex gap-2 items-center mt-4;
  }

  .inv-actions .b {
    @apply p-2 rounded-full cursor-pointer transition-colors duration-100;
  }

  .b.accept {
    @apply text-green-500 hover:bg-green-100;
  }

  .b.decline {
    @apply text-red-500 hover:bg-red-100;
  }
</style>
