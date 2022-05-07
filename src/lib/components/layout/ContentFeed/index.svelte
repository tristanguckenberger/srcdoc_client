<script lang="ts">
	import { clientWidth, rightPanelWidth } from '$lib/stores/layoutStore';
	import { getStores, navigating, page } from '$app/stores';
	import { currentSlide } from '$lib/stores/rotatorStore';
	import { afterUpdate } from 'svelte';

	let showLeftPane = true;
	let rigthWidth;

	let hidePanel = true;

	$: if ($page.url.pathname === '/auth') {
		hidePanel = true;
	} else {
		hidePanel = false;
	}

	afterUpdate(() => {
		if (rigthWidth > 0) {
			console.log('setting rightPanelWidth at line 20 in afterUpdate in ContentFeed.svelte');
			rightPanelWidth.set(rigthWidth);
		}
	});

	$: hideRightPanel = $page.url.pathname === '/';
</script>

<div class="content-container" class:hideRightPanel>
	<div class="left-panel">
		<slot name="left-panel" />
	</div>
	<div class="center-panel">
		<slot name="center-panel" />
	</div>
	<div class="right-panel" class:hidePanel class:hideRightPanel bind:clientWidth={rigthWidth}>
		<slot name="right-panel" />
	</div>
</div>

<style>
	.left-panel {
		position: relative;
		top: -58px;
		height: calc(100% + 58px);
		border-radius: 6px;
	}

	.content-container {
		display: grid;
		grid-template-columns: minmax(100px, 20%) minmax(600px, 80%) minmax(100px, 20%);
		grid-gap: 10px;
		max-width: 1980px;
		width: 100%;
		justify-content: center;
		margin: auto;
	}

	@media screen and (min-width: 900px) {
		/* if page is explore page, hide right panel */
		.content-container.hideRightPanel {
			grid-template-columns: minmax(100px, 20%) minmax(600px, 80%);
		}
		.right-panel.hideRightPanel {
			visibility: hidden;
		}
		/* end hide right panel */
	}

	.center-panel {
		height: calc(100vh - 78px);
	}

	.right-panel {
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		height: 100%;
	}

	.right-panel.hidePanel {
		background-color: transparent;
	}

	:global(div.left a) {
		/* min-height: 150px; */
		max-height: 350px;
	}
	@media (max-width: 878px) {
		.left-panel,
		.right-panel {
			display: none;
		}
		.content-container {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
			grid-gap: 10px;
			max-width: 1980px;
			width: 100%;
			justify-content: center;
			margin: auto;
			border-radius: 6px;
			overflow: hidden;
		}
	}
</style>
