<script lang="ts">
  import { Link } from "svelte-navigator";
  import { organisation } from "../stores/organisation";
</script>

<nav class="flex justify-between items-center bg-primary text-white">
  <div class="flex items-center gap-2">
    <Link class="px-4 py-2 font-bold text-lg cursor-pointer" to="/">WorkShift</Link>
    {#if $organisation}
      <Link class="px-4 py-2 cursor-pointer" to="/org/{$organisation.id}"
        >{$organisation.name}</Link
      >
    {/if}
  </div>
</nav>
