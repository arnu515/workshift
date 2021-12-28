<script lang="ts">
  import { navigate, Link } from "svelte-navigator";

  export let title = "404 Page Not Found";
  export let message = "The page you were looking for does not exist.";
</script>

<div class="fixed w-full h-full top-0 left-0 grid place-items-center">
  <div class="text-center">
    <h1 class="my-4 text-5xl font-bold">{title}</h1>
    <p class="my-4 text-3xl">{message}</p>
    <div class="flex gap-4 items-center my-4 justify-center">
      <button
        on:click={() => navigate(-1)}
        class="bg-gray-500 px-4 py-2 text-white rounded"
        title="Go back"
        aria-label="Go back"
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
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg></button
      >
      <Link to="/" class="bg-blue-500 px-4 py-2 text-white rounded">Homepage</Link>
    </div>
  </div>
</div>
