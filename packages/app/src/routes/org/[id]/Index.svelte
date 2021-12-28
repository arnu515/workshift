<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "svelte-navigator";

  export let orgId: string;

  onMount(() => {
    navigate(`/org/${orgId}/chat`);
  });
</script>
