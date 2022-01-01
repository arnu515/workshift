<script lang="ts">
  import { Route } from "svelte-navigator";
  import OrgIndex from "./Index.svelte";
  import OrgInvite from "./Invite.svelte";
  import OrgSettings from "./Settings.svelte";
  import { organisation } from "$lib/stores/organisation";
  import Loading from "$lib/components/Loading.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { onDestroy, onMount } from "svelte";
  import NotFound from "$routes/NotFound.svelte";
  import OrgChat from "./Chat.svelte";
  import OrgDm from "./Dm.svelte";
  import OrgShifts from "./Shifts.svelte";
  import OrgMembers from "./Members.svelte";
  import { orgConnection } from "$lib/stores/pusher";

  export let orgId: string;
  export let path: string;
  let loading = false;
  let orgFound = false;

  onMount(async () => {
    await organisation.refresh(orgId);
    orgFound = !!$organisation?.id;
    loading = false;

    if (orgFound) orgConnection.sub($organisation.id);
  });

  onDestroy(orgConnection.unsub);
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

    <Route path="chat" component={OrgChat} />
    <Route path="dm" component={OrgDm} />
    <Route path="shifts" component={OrgShifts} />
    <Route path="members" component={OrgMembers} />
    <Route path="invite" component={OrgInvite} />
    <Route path="settings" component={OrgSettings} />
  </main>
{/if}
