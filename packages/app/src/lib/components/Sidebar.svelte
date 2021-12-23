<script lang="ts">
  export let orgId: string;
  export let activePath: string;
</script>

<aside class="h-full fixed w-16 bg-gray-300 border-r border-gray-400 flex flex-col">
  <a
    href="/org/{orgId}/chat"
    class="item group"
    title="Chat"
    aria-label="Chat"
    class:active={activePath === "chats"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  </a>
  <a
    href="/org/{orgId}/dm"
    class="item group"
    title="Direct Messages"
    aria-label="Direct Messages"
    class:active={activePath === "dm"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
      />
    </svg>
  </a>
  <a
    href="/org/{orgId}/shifts"
    class="item group"
    title="Shifts"
    aria-label="Shifts"
    class:active={activePath === "shifts"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </a>
</aside>

<style lang="postcss">
  .item {
    @apply flex items-center justify-center h-12 w-12 my-2 mx-auto shadow bg-gray-200 hover:bg-gray-300 rounded-full hover:rounded-xl transition-all duration-300 cursor-pointer ease-linear;
  }
  .item.active {
    @apply bg-primary text-white hover:bg-primary-900;
  }
</style>
