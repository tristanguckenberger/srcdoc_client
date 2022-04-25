<script>
	import { onMount } from 'svelte';
	export let image = '';
	export let link = '';
</script>

<div class="card-container">
	<a href={link}>
		<div class="card-photo" style="background-image: url('{image}');">
			<slot name="card-photo" />
		</div>
	</a>
	<div class="card-body">
		<slot name="card-content" />
	</div>
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
	.card-container {
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		display: grid;
		height: 100%;
		max-height: 300px;
		grid-template-rows: 3fr 2fr;
		overflow: hidden;
	}
	.card-photo {
		background-color: #bc5757;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		border-radius: 6px 6px 0 6px;
		min-height: 150px;
		transition: all 250ms cubic-bezier(0.53, 0.03, 0, 1);
		width: 100%;
		height: 100%;
	}
	:global(.card-photo div img) {
		width: 100%;
		height: 100%;
	}

	.card-container:hover .card-photo {
		/* transform: translateY(10px); */
		filter: brightness(0.85);
	}
	:global(.card-title h2) {
		font-family: 'Inter', serif;
		font-weight: 500;
		font-size: 18px;
		margin-block-start: 0;
	}
	.card-body {
		/* padding: 1rem; */
		padding: 10px;
		// z-index: 100000000000000000000000000000000;
		background-color: var(--mainThemePanelColor);
	}
</style>
