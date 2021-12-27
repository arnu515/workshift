<script lang="ts">
  import { onMount } from "svelte";
  import axios from "$lib/axios";
  import { user } from "$lib/stores/user";
  import { goto } from "$app/navigation";

  onMount(async () => {
    await axios.delete("/auth/logout");
    $user = null;
    goto("/");
  });
</script>

<p class="text-center m-6 text-2x">Please wait, logging you out...</p>
