<script lang="ts">
  import { Route } from "svelte-navigator";
  import OrgIndex from "./Index.svelte";

  export let orgId: string;
</script>

<Route path="">
  <OrgIndex {orgId} />
</Route>

<Route path="chat">
  <h1>chat</h1>
</Route>
