<script lang="ts">
  import { organisation } from "$lib/stores/organisation";
  import axios from "$lib/axios";
  import { toast } from "@zerodevx/svelte-toast";
  import { getMessage } from "$lib/util";

  let org = { ...$organisation };
  let loading = false;

  async function updateOrg() {
    loading = true;
    const res = await axios.put("/organisations/" + $organisation.id, {
      name: org.name,
      description: org.description,
      imageUrl: org.imageUrl,
      website: org.website || null,
      location: org.location || null,
      address: org.address || null,
      email: org.email || null
    });
    if (!res.status.toString().startsWith("2")) {
      toast.push(getMessage(res));
      loading = false;
      return;
    }
    loading = false;
    window.location.reload();
  }

  async function deleteOrganisation() {
    const res = await axios.delete(`/organisations/${$organisation.id}`);
    if (!res.status.toString().startsWith("2")) {
      toast.push(getMessage(res));
      return;
    }
    // do a hard reload to reset all stores
    window.location.href = "/";
  }

  $: console.log({ organisation: $organisation });
</script>

<div class="p-4">
  <h1 class="text-5xl font-bold my-4">Settings</h1>
  <form on:submit|preventDefault={updateOrg}>
    <div class="my-2">
      <label for="name">Name</label>
      <input
        type="text"
        id="name"
        bind:value={org.name}
        placeholder={$organisation.name}
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2">
      <label for="description">Description</label>
      <textarea
        rows={5}
        type="text"
        id="description"
        bind:value={org.description}
        placeholder={$organisation.description}
        style="resize: vertical"
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2">
      <label for="imageUrl">Logo URL</label>
      <input
        type="url"
        id="imageUrl"
        bind:value={org.imageUrl}
        placeholder={$organisation.imageUrl}
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2">
      <label for="website">Website</label>
      <input
        type="website"
        id="website"
        bind:value={org.website}
        placeholder={$organisation.website || "https://example.org"}
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2">
      <label for="location">Location</label>
      <input
        type="location"
        id="location"
        bind:value={org.location}
        placeholder={$organisation.location || "City, Country"}
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2">
      <label for="address">Address</label>
      <textarea
        rows={3}
        type="address"
        id="address"
        bind:value={org.address}
        placeholder={$organisation.address || "Address"}
        class:loading
        disabled={loading}
        style="resize: vertical"
      />
    </div>
    <div class="my-2">
      <label for="email">Email</label>
      <input
        type="email"
        id="email"
        bind:value={org.email}
        placeholder={$organisation.email || "hey@example.org"}
        class:loading
        disabled={loading}
      />
    </div>
    <div class="my-2 flex items-center gap-2">
      <button
        class="bg-gray-500 text-white rounded px-4 py-2 cursor-pointer"
        title="Reset"
        aria-label="Reset"
        on:click={() => (org = { ...$organisation })}
        type="button"
      >
        Reset
      </button>
      <button type="submit" class:loading disabled={loading}
        >{loading ? "..." : "Update"}</button
      >
    </div>
  </form>

  <div
    class="mt-6 p-4 border border-red-500"
    on:click={() =>
      window.confirm("Are you sure?") &&
      window.confirm("Last warning") &&
      deleteOrganisation()}
  >
    <h2 class="text-3xl font-bold text-red-500 flex items-center justify-between">
      Delete organisation
      <button class="bg-red-500 text-white px-4 py-2 rounded border border-transparent"
        >Delete</button
      >
    </h2>
    <p class="text-red-500 text-xl mt-2">
      This action is <strong>IRREVERSIBLE</strong>. All channels, messages and files
      will be lost <strong>FOREVER</strong>
    </p>
  </div>
</div>
