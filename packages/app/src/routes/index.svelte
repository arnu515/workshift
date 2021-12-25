<script lang="ts">
  import { user } from "$lib/stores/user";
  import { onMount } from "svelte";
  import { org } from "$lib/stores/org";
  import { invites } from "$lib/stores/invites";
  import Loader from "$lib/components/Loader.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import dayjs from "dayjs";

  let timeAtLastOrgRefresh = Date.now() - 1000 * 60;
  let timeAtLastInvRefresh = Date.now() - 1000 * 60;

  onMount(async () => {
    await org.refresh();
    await invites.refresh();
  });

  function refreshOrg() {
    if (Date.now() - timeAtLastOrgRefresh > 1000 * 60) {
      timeAtLastOrgRefresh = Date.now();
      org.refresh();
    } else
      toast.push(
        `Please wait ${Math.floor(
          (1000 * 60 - (Date.now() - timeAtLastOrgRefresh)) / 1000
        )} seconds before refreshing again.`
      );
  }

  function refreshInv() {
    if (Date.now() - timeAtLastInvRefresh > 1000 * 60) {
      timeAtLastInvRefresh = Date.now();
      invites.refresh();
    } else
      toast.push(
        `Please wait ${Math.floor(
          (1000 * 60 - (Date.now() - timeAtLastInvRefresh)) / 1000
        )} seconds before refreshing again.`
      );
  }

  async function acceptInvite(inviteId: string, orgId: string) {
    $invites = $invites.filter(inv => inv.id !== inviteId);
    await invites.acceptOrDeclineInvite({ id: inviteId, orgId, action: "accept" });
    await org.refresh();
    await invites.refresh();
  }

  async function declineInvite(inviteId: string, orgId: string) {
    $invites = $invites.filter(inv => inv.id !== inviteId);
    await invites.acceptOrDeclineInvite({ id: inviteId, orgId, action: "decline" });
    await org.refresh();
    await invites.refresh();
  }
</script>

<main class="m-4">
  <h1 class="text-5xl font-bold my-6">Welcome to WorkShift</h1>
  <p class="text-2xl">
    Signed in as <img
      src="https://gravatar.com/avatar/{$user.email}?d=mp&s=32"
      alt="Your avatar"
      class="inline rounded-full mx-1"
    /> <strong>{$user.username}</strong>. Not you?
    <a href="/logout" class="text-primary hover:underline">Logout</a>
  </p>

  <h2 class="text-3xl my-4 flex items-center justify-between font-bold">
    Organisations
    <div class="flex items-center gap-2">
      <button
        title="Refresh"
        aria-label="Refresh organisations"
        class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        on:click={refreshOrg}
        ><svg
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
        </svg></button
      >
      <a
        href="/org/new"
        title="Create"
        aria-label="Create a new organisation"
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
      </a>
    </div>
  </h2>
  {#if $org === null}
    <Loader />
  {:else}
    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#if $org.length}
        {#each $org as o}
          <a
            href="/org/{o.id}"
            class="rounded-xl p-4 md:p-0 md:flex shadow-lg cursor-pointer bg-white hover:bg-gray-50 hover:border hover:border-gray-400 transition-all duration-100 outline-none focus:border-2 focus:border-black"
          >
            <img
              src={o.imageUrl}
              alt="{o.name}'s logo"
              class="md:w-[40%] rounded-full md:rounded-none org-img mx-auto md:mx-0"
              style=""
            />
            <div class="flex flex-col text-center md:text-left m-2">
              <h3 class="text-4xl font-bold">{o.name}</h3>
              <p class="text-sm text-gray-600">
                Created on {dayjs(o.created_at).format("MMM DD, YYYY")}
              </p>
              <ul class="metadata list-none">
                <li>
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {o.location || "Not specified"}
                </li>
                <li>
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  {#if o.website}
                    <a href={o.website}>{new URL(o.website).hostname}</a>
                  {:else}
                    Not specified
                  {/if}
                </li>
              </ul>
            </div>
          </a>
        {/each}
      {:else}
        <p class="text-xl my-2">You're not part of an organisation yet.</p>
      {/if}
    </section>
  {/if}

  <h2 class="text-3xl my-4 flex items-center justify-between font-bold">
    Invites to Organisations
    <div class="flex items-center gap-2">
      <button
        title="Refresh"
        aria-label="Refresh invites"
        class="p-2 bg-transparent text-primary hover:bg-sky-50 rounded-full cursor-pointer duration-500 transition-colors"
        on:click={refreshInv}
        ><svg
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
        </svg></button
      >
    </div>
  </h2>
  {#if $invites === null}
    <Loader />
  {:else}
    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {#if $invites.length}
        {#each $invites as i}
          <article class="rounded-xl p-4 md:p-0 md:flex shadow-lg bg-white">
            <img
              src={i.organisation.imageUrl}
              alt="{i.organisation.name}'s logo"
              class="md:w-[40%] rounded-full md:rounded-none org-img mx-auto md:mx-0"
              style=""
            />
            <div class="flex flex-col text-center md:text-left m-2">
              <h3 class="text-4xl font-bold">{i.organisation.name}</h3>
              <p class="text-sm text-gray-600">
                Created on {dayjs(i.created_at).format("MMM DD, YYYY")}
              </p>
              <p class="inv-actions">
                <button
                  class="b accept"
                  on:click={() => acceptInvite(i.id, i.organisation_id)}
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
                  on:click={() => declineInvite(i.id, i.organisation_id)}
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
                <a
                  target="_blank"
                  href="/org/{i.organisation_id}"
                  class="b view"
                  title="View"
                  aria-label="View organisation"
                  ><svg
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
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg></a
                >
              </p>
            </div>
          </article>
        {/each}
      {:else}
        <p class="text-xl my-2">You don't have any pending invites.</p>
      {/if}
    </section>
  {/if}
</main>

<style lang="postcss">
  .metadata {
    @apply text-sm text-gray-400 flex flex-col items-center;
    margin: 0;
    margin-top: 1rem;
    padding: 0;
  }
  .metadata li {
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .inv-actions {
    @apply flex gap-2 items-center mt-auto;
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

  .b.view {
    @apply text-gray-500 hover:bg-gray-100;
  }

  @media screen(md) {
    img.org-img {
      border-top-left-radius: 0.75rem;
      border-bottom-left-radius: 0.75rem;
    }
    .metadata {
      align-items: baseline;
      margin-top: auto;
    }
  }
</style>
