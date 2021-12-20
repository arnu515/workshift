<script lang="ts">
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import { user } from '$lib/stores/user';
	import { SvelteToast, SvelteToastOptions } from '@zerodevx/svelte-toast';
	import '../app.css';

	const opts: SvelteToastOptions = {
		pausable: true,
		duration: 5000,
		dismissable: true,
		theme: {
			'--toastBarBackground': 'red',
			'--toastBackground': '#efefef',
			'--toastColor': 'black'
		}
	};
</script>

<SvelteToast options={opts} />

{#if !$user}
	<LoginScreen />
{:else}
	<slot />
{/if}
