<script lang="ts">
  import { SvelteToast, SvelteToastOptions, toast } from "@zerodevx/svelte-toast";
  import LoginScreen from "$lib/components/LoginScreen.svelte";
  import Loading from "$lib/components/Loading.svelte";
  import user from "$lib/stores/user";
  import { onMount } from "svelte";
  import axios from "$lib/axios";
  import { invites, organisations } from "$lib/stores/organisation";
  import { Router, Route } from "svelte-navigator";
  import Index from "$routes/Index.svelte";
  import NotFound from "$routes/NotFound.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Logout from "$routes/logout.svelte";
  import qs from "qs";
  import OrgLayout from "$routes/org/[id]/__layout.svelte";

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
    const query = qs.parse(window.location.search.slice(1));
    if (query.message) {
      // escape any *evil* characters
      const t = document.createElement("textarea");
      t.textContent = query.message.toString();
      const message = t.innerHTML;
      toast.push(message, {
        theme: {
          "--toastBarBackground": query.status
            ? query.status.toString().startsWith("2")
              ? "green"
              : "red"
            : "red"
        }
      });
    }
    delete query.message;
    delete query.status;
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}?${qs.stringify(query)}`
    );

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
    <Route path="/logout" component={Logout} />
    <Route path="/org/:orgId/*orgRoute" let:params>
      <OrgLayout orgId={params.orgId} path={params.orgRoute} />
    </Route>
    <Route component={NotFound} />
  {/if}
</Router>
