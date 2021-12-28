<script lang="ts">
  import { SvelteToast, SvelteToastOptions } from "@zerodevx/svelte-toast";
  import LoginScreen from "./lib/components/LoginScreen.svelte";
  import Loading from "./lib/components/Loading.svelte";
  import user from "./lib/stores/user";
  import { onMount } from "svelte";
  import axios from "./lib/axios";

  let loading = true;

  const opts: SvelteToastOptions = {
    pausable: true,
    duration: 5000,
    dismissable: true,
    theme: {
      "--toastBarBackground": "red",
      "--toastBackground": "#efefef",
      "--toastColor": "black"
    }
  };

  onMount(async () => {
    const { status, data } = await axios.get("/auth/me");
    if (status === 200) {
      $user = data;
    } else {
      $user = null;
    }

    loading = false;
  });
</script>

<SvelteToast options={opts} />

{#if loading}
  <Loading />
{:else if !$user}
  <div class="fixed w-full h-full top-0 left-0 grid place-items-center">
    <LoginScreen />
  </div>
{:else}
  <p>logged in</p>
{/if}
