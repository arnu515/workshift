<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = ({ page: { query } }) => {
    const status = query.get("status");
    const message = query.get("message");
    return {
      props: {
        status,
        message
      }
    };
  };
</script>

<script lang="ts">
  import LoginScreen from "$lib/components/LoginScreen.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import { user } from "$lib/stores/user";
  import { toast, SvelteToast, SvelteToastOptions } from "@zerodevx/svelte-toast";
  import { onMount } from "svelte";
  import axios from "$lib/axios";
  import { stringify, parse } from "qs";
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";

  export let status: string;
  export let message: string;
  let loading = true;

  onMount(async () => {
    if (message) {
      toast.push(message, {
        theme: {
          "--toastBarBackground": status?.startsWith("2") ? "green" : "red"
        }
      });
    }

    // get the user from backend and save it in the store
    const res = await axios.get("/auth/me");
    if (res.status.toString().startsWith("2")) {
      user.set(res.data);
    }
    loading = false;

    // remove "status" and "message" from the query string
    const q = parse(window.location.search.slice(1));
    delete q.status;
    delete q.message;
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}?${stringify(q)}`
    );

    const Pusher = (await import("pusher-js")).default;
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY.toString(), {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER.toString()
    });
    const channel = pusher.subscribe("my-channel");
    channel.bind("my-event", data => {
      console.log(data);
    });
  });

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
</script>

<SvelteToast options={opts} />

{#if loading}
  <Loading />
{:else if !$user}
  <LoginScreen />
{:else}
  <Navbar />
  <slot />
{/if}
