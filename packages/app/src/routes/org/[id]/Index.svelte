<script lang="ts">
  import { organisation } from "$lib/stores/organisation";
  import user from "$lib/stores/user";

  import { onMount } from "svelte";
  import { Link, navigate } from "svelte-navigator";

  export let orgId: string;

  onMount(() => {
    if ($organisation.member_ids.includes($user.id)) navigate(`/org/${orgId}/chat`);
  });
</script>

<div class="w-[50%] max-w-[1000px] mx-auto my-4">
  <div class="bg-white border border-gray-400 shadow-xl rounded-lg p-4">
    <h1 class="text-4xl font-bold my-2 flex items-center gap-4">
      <img
        src={$organisation.imageUrl}
        alt="Logo of {$organisation.name}"
        class="rounded-full w-8 h-8 border border-black"
      />
      {$organisation.name}
    </h1>
    <p class="text-2xl my-2 text-gray-600">{$organisation.description}</p>
    {#if $organisation.address}
      <p class="text-gray-500">Address:<br />{$organisation.address}</p>
    {/if}
    <div class="metadata">
      <p>
        <svg
          aria-label="Location"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clip-rule="evenodd"
          />
        </svg> <span>{$organisation.location || "Not specified"}</span>
      </p>
      <p>
        <svg
          aria-label="Website"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
            clip-rule="evenodd"
          />
        </svg>
        {#if $organisation.website}
          <a class="text-primary underline" href={$organisation.website}
            >{$organisation.website}</a
          >
        {:else}
          Not Specified
        {/if}
      </p>
      <p>
        <svg
          aria-label="Email"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
          />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        {#if $organisation.email}
          <a class="text-primary underline" href="mailto:{$organisation.email}"
            >{$organisation.email}</a
          >
        {:else}
          Not Specified
        {/if}
      </p>
    </div>
  </div>
  <div class="bg-white border border-gray-400 shadow-xl rounded-lg p-4 mt-4">
    <p class="text-2xl my-4">More things will be displayed here soon.</p>
    <p class="my-4">
      <Link to="/" class="bg-primary text-white px-4 py-2 rounded">Homepage</Link>
    </p>
  </div>
</div>

<style lang="postcss">
  .metadata {
    @apply text-gray-500;
    margin-top: 1rem;
  }

  .metadata * {
    @apply flex items-center gap-2 my-1;
  }
</style>
