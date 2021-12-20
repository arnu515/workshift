<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import axios from '$lib/axios';
	import { toast } from '@zerodevx/svelte-toast';
	import { user } from '$lib/stores/user';

	interface LoginProvider {
		name: string;
		url: string;
		svg: string;
		bgColor: string;
		whiteText: boolean;
	}

	let email = '',
		password = '',
		username = '';
	let loading = false;
	let loginType: 'none' | 'login' | 'register' = 'none';

	async function getLoginType(email: string): Promise<typeof loginType> {
		const { data } = await axios.post('/auth/isregistered', { email });
		const { isRegistered } = data;
		return isRegistered ? 'login' : 'register';
	}

	async function auth() {
		loading = true;
		if (loginType === 'none') {
			loginType = await getLoginType(email);
			loading = false;
			return;
		}

		const res = await axios.post(`/auth/local/${loginType}`, { email, password, username });
		if (!res.status.toString().startsWith('2')) {
			toast.push(Array.isArray(res.data.message) ? res.data.message.join('\n') : res.data.message);
			return;
		}
		$user = res.data;
		loading = false;
		return;
	}
</script>

<div
	class="bg-gray-200 grid place-items-center fixed w-full h-full"
	transition:fade={{ duration: 100 }}
>
	<div
		class="bg-white border border-gray-400 text-black px-6 py-4 rounded"
		transition:slide={{ duration: 400, delay: 100 }}
	>
		<h1 class="text-5xl font-bold my-4">Sign in to WorkShift</h1>
		{#if loginType === 'none'}
			<form method="POST" on:submit|preventDefault={auth} class="my-2 flex items-center gap-2">
				<input
					bind:value={email}
					type="email"
					class:loading
					name="email"
					autofocus
					disabled={loading}
					aria-label="Email"
					placeholder="hey@email.com"
				/>
				<button class:loading style="width: auto" disabled={loading} type="submit">
					{#if !loading}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
							/>
						</svg>
					{/if}
				</button>
			</form>
		{:else if loginType === 'login'}
			<form on:submit|preventDefault={auth}>
				<div class="my-2">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						name="email"
						placeholder="hey@email.com"
					/>
				</div>
				<div class="my-2">
					<label for="password">Password</label>
					<input
						autofocus
						type="password"
						id="password"
						bind:value={password}
						name="password"
						placeholder="P@$$W0rD"
					/>
				</div>
				<div class="my-2 flex items-center gap-2">
					<button
						class="back"
						disabled={loading}
						type="button"
						class:loading
						on:click={() => (loginType = 'none')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
					</button>
					<button type="submit">Login</button>
				</div>
			</form>
		{:else if loginType === 'register'}
			<form on:submit|preventDefault={auth}>
				<div class="my-2">
					<label for="email">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						name="email"
						placeholder="hey@email.com"
					/>
				</div>
				<div class="my-2">
					<label for="password">Password</label>
					<input
						autofocus
						type="password"
						id="password"
						bind:value={password}
						name="password"
						placeholder="P@$$W0rD"
					/>
				</div>
				<div class="my-2">
					<label for="username">Username</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						name="username"
						placeholder="Username"
					/>
				</div>
				<div class="my-2 flex gap-2 items-center">
					<button
						class="back"
						disabled={loading}
						type="button"
						class:loading
						on:click={() => (loginType = 'none')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
					</button>
					<button type="submit">Register</button>
				</div>
			</form>
		{/if}
		<p class="text-center text-gray-500 uppercase mt-5 mb-2">Or use a third-party service</p>

		<div class="flex flex-col gap-2 justify-center">
			<a href="/connect/github" class="provider bg-[#181717] text-white">
				<svg role="img" viewBox="0 0 24 24" class="fill-white" xmlns="http://www.w3.org/2000/svg"
					><title>GitHub</title><path
						d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
					/></svg
				>
				<span>GitHub</span>
			</a>
			<a href="/connect/discord" class="provider bg-[#5865f2] text-white">
				<svg role="img" viewBox="0 0 24 24" class="fill-white" xmlns="http://www.w3.org/2000/svg"
					><title>Discord</title><path
						d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
					/></svg
				>
				<span>Discord</span>
			</a>
		</div>
	</div>
</div>

<style lang="postcss">
	.provider {
		@apply flex items-center justify-center border border-transparent rounded px-4 py-2 gap-2 font-bold;
	}
	:global(.provider svg) {
		@apply h-6 w-6;
	}

	label {
		@apply block font-bold text-lg mb-1;
	}

	input {
		@apply rounded border border-gray-400 px-4 py-2 outline-none w-full focus:border-gray-600 text-center;
	}

	input.loading {
		@apply bg-gray-200 cursor-not-allowed;
	}

	button.back {
		@apply bg-gray-500 text-white border border-gray-500 rounded px-4 py-2 cursor-pointer;
	}

	button.back.loading {
		@apply cursor-not-allowed;
	}

	button[type='submit'] {
		@apply bg-blue-500 text-white border border-blue-500 rounded px-4 py-2 cursor-pointer w-full;
	}

	button[type='submit'].loading {
		@apply cursor-not-allowed;
	}
</style>
