<script lang="ts">
  import { Route } from "svelte-navigator";
  import OrgIndex from "./Index.svelte";
  import OrgInvite from "./Invite.svelte";
  import { organisation } from "$lib/stores/organisation";
  import Loading from "$lib/components/Loading.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { onMount } from "svelte";
  import NotFound from "$routes/NotFound.svelte";

  export let orgId: string;
  export let path: string;
  let loading = false;
  let orgFound = false;

  onMount(async () => {
    await organisation.refresh(orgId);
    orgFound = !!$organisation?.id;
    loading = false;
  });
</script>

{#if loading}
  <Loading />
{:else if !orgFound}
  <NotFound
    title="404 Organisation not found"
    message="This organisation doesn't exist."
  />
{:else}
  <Sidebar activePath={path} />
  <main class="ml-16">
    <Route path="">
      <OrgIndex {orgId} />
    </Route>

    <Route path="chat">
      <h1>chat</h1>
    </Route>

    <Route path="invite" component={OrgInvite} />
  </main>
{/if}
