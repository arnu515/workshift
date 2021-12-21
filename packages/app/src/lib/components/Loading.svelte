<script lang="ts">
  import Loader from "./Loader.svelte";
</script>

<div class="fixed w-full h-full top-0 left-0 bg-gray-200 grid place-items-center">
  <div class="flex flex-col items-center">
    <Loader />
    <p class="nojs">This site requires JavaScript to work.</p>
  </div>
</div>

<style lang="postcss">
  .nojs {
    @apply text-gray-600 text-xl text-center my-4 font-bold;
    opacity: 0;
    animation-name: nojs;
    animation-duration: 500ms;
    animation-timing-function: ease;
    animation-delay: 5s;
    animation-fill-mode: forwards;
  }
  @keyframes nojs {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
