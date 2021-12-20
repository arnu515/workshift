<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	export const load: Load = ({ page: { query, path } }) => {
		const status = query.get('status');
		const message = query.get('message');
		return {
			props: {
				status,
				message
			}
		};
	};
</script>

<script lang="ts">
	import LoginScreen from '$lib/components/LoginScreen.svelte';
	import { user } from '$lib/stores/user';
	import { toast, SvelteToast, SvelteToastOptions } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import '../app.css';

	export let status: string;
	export let message: string;

	onMount(() => {
		console.log(message, status);
		if (message) {
			toast.push(message, {
				theme: {
					'--toastBarBackground': status?.startsWith('2') ? 'green' : 'red'
				}
			});
		}
	});

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
	<LoginScreen {status} {message} />
{:else}
	<slot />
{/if}
