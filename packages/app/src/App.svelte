<script lang="ts">
  import { SvelteToast, SvelteToastOptions } from "@zerodevx/svelte-toast";
  import LoginScreen from "./lib/components/LoginScreen.svelte";
  import Loading from "./lib/components/Loading.svelte";
  import user from "./lib/stores/user";
  import { onMount } from "svelte";
  import axios from "./lib/axios";
  import { invites, organisations } from "./lib/stores/organisation";
  import { Router, Link, Route } from "svelte-navigator";
  import Index from "./routes/Index.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Navbar from "./lib/components/Navbar.svelte";

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

  user.subscribe(async user => {
    if (user) {
      await organisations.refresh();
      await invites.refresh();
    }
  });
</script>

<SvelteToast options={opts} />

<Router>
  {#if loading}
    <Loading />
  {:else if !$user}
    <div class="fixed w-full h-full top-0 left-0 grid place-items-center">
      <LoginScreen />
    </div>
  {:else}
    <Navbar />
    <Route path="/" component={Index} />
    <Route component={NotFound} />
  {/if}
</Router>
