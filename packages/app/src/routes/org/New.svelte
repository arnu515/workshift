<script lang="ts">
  import { Link, navigate } from "svelte-navigator";
  import user from "$lib/stores/user";
  import axios from "$lib/axios";
  import { toast } from "@zerodevx/svelte-toast";
  import { getMessage } from "$lib/util";
  import { organisations } from "$lib/stores/organisation";

  let newOrg = {
    name: "",
    description: ""
  };
  let loading = false;

  async function createOrg() {
    if (!$user) return;
    if (loading) return;

    loading = true;
    let res = await axios.post("/organisations", {
      ...newOrg
    });
    if (!res.status.toString().startsWith("2")) {
      loading = false;
      toast.push(getMessage(res));
      return;
    }
    await organisations.refresh();
    loading = false;
    navigate(`/org/${res.data.id}`);
  }
</script>

<div class="my-6 mx-auto max-w-[950px]">
  <div class="border border-gray-400 shadow bg-white rounded px-4 py-2 mt-6">
    <div class="flex justify-between items-center my-4">
      <h1 class="text-2xl font-bold">Create Organization</h1>
      <Link
        to="/"
        class="text-primary hover:text-primary-700 hover:underline transition-colors duration-300"
        >Home</Link
      >
    </div>
    <form on:submit|preventDefault={createOrg}>
      <div class="mt-2">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          class:loading
          disabled={loading}
          bind:value={newOrg.name}
          placeholder="Organisation name"
        />
      </div>
      <div class="mt-2">
        <label for="description">Description</label>
        <textarea
          rows={5}
          id="description"
          bind:value={newOrg.description}
          placeholder="Organisation description"
          class:loading
          disabled={loading}
          style="resize: vertical"
        />
      </div>
      <div class="mt-2">
        <span class="text-sm text-gray-600"
          >You can add an image, location, website or invite users later.</span
        >
      </div>
      <div class="mt-2 mb-4">
        <button type="submit" class:loading disabled={loading}
          >{loading ? "..." : "Create organisation"}</button
        >
      </div>
    </form>
  </div>
</div>
