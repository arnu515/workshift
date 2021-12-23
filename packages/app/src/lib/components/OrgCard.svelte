<script lang="ts">
  import type { Organisation } from "@prisma/client";

  export let organisation: Organisation;
</script>

<div class="border border-gray-400 shadow bg-white rounded px-4 py-2">
  <div class="flex gap-6 items-center">
    <img
      src={organisation.imageUrl}
      alt="Logo of {organisation.name}"
      class="w-[128px] max-h-[128px] rounded-full"
    />
    <div>
      <h2 class="text-5xl font-bold">{organisation.name}</h2>
      <p class="text-gray-700 text-2xl">{organisation.description}</p>
    </div>
  </div>
</div>
