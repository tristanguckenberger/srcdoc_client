<script lang="ts">
	import { onMount, afterUpdate, onDestroy } from 'svelte';
	import { clearSplit, splitStore } from '$lib/stores/splitStore';
	import Split from 'split.js';
	import { page } from '$app/stores';
	export let panes: string[];
	export let sizes: number[] = null;
	export let vertical: boolean = false;

	let splitInstance: Split.Instance;

	$: authPage = $page.url.pathname === '/auth';

	// $: if ($clearSplit) {
	//   reloadSplit();
	// }

	const reloadSplit = () => {
		// Destory existing splitInstance
		if (splitInstance && !authPage) splitInstance.destroy();

		// Init a new split instance
		splitInstance = Split(panes, {
			direction: vertical ? 'vertical' : 'horizontal',
			gutterSize: 10,
			sizes
		});
	};

	let split;

	afterUpdate(() => {
		console.log($clearSplit);
		if ($clearSplit) {
			reloadSplit();
			setTimeout(() => {
				clearSplit.set(false);
			}, 100);
		}
	});

	onDestroy(() => {
		split = null;
	});

	// Replaces functionality found in onMount
	$: if (split) {
		panes.map(async (query) => {
			await split.querySelector(query).classList.add('pane');
		});

		// Init Split.js
		setTimeout(() => reloadSplit(), 50);
	}
</script>

<div class="split {vertical ? 'vertical' : ''}" bind:this={split}>
	<slot />
</div>

<style lang="scss">
	/* TODO: REWRITE WITH SCSS */
	.split {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
		max-width: 100vw;
	}

	.split.vertical {
		display: block;
		flex-direction: unset;
	}

	:global(.gutter) {
		background-color: transparent;
		border-radius: 3px;
		background-repeat: no-repeat;
		background-position: 50%;
		z-index: 2147483647;
		transition: background-color 250ms ease;

		&:hover {
			background-color: #4ca5ff;
		}
	}

	:global(.gutter.gutter-horizontal) {
		cursor: col-resize;
		// width: 10px !important;
	}

	:global(.gutter.gutter-vertical) {
		cursor: row-resize;
		// height: 10px !important;
	}
</style>
