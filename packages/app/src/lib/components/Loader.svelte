<script lang="ts">
  import { fly } from "svelte/transition";
</script>

<div transition:fly class="spinner" />

<style lang="postcss">
  .spinner {
    @apply border-4 border-transparent rounded-full border-dashed;
    border-top-color: gray;
    width: 32px;
    height: 32px;
    animation: spin 500ms linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
