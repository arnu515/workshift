<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<div class="fixed w-full h-full top-0 left-0 bg-gray-200 grid place-items-center">
	<div class="flex flex-col items-center">
		<div transition:fly class="spinner" />
		<p class="nojs">This site requires JavaScript to work.</p>
	</div>
</div>

<style lang="postcss">
	.spinner {
		@apply border-4 border-transparent rounded-full border-dashed;
		border-top-color: gray;
		width: 32px;
		height: 32px;
		animation: spin 500ms linear infinite;
	}
	.nojs {
		@apply text-gray-600 text-xl text-center my-4 font-bold;
		opacity: 0;
		animation-name: nojs;
		animation-duration: 500ms;
		animation-timing-function: ease;
		animation-delay: 5s;
		animation-fill-mode: forwards;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	@keyframes nojs {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
