<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { get as getUtil, post as postUtil } from '$lib/utils';

	export let itemID: string;
	export let isPost: boolean;
	let count: number = 0;

	const createVote = async (tag) => {
		const url = `../../api/vote/createVote.json`;
		await postUtil(url, {
			itemID,
			isPost,
			tag
		}).then(() => {
			getCurrentVote();
		});
	};

	const getCurrentVote = async () => {
		const url = `../../api/vote/getVoteCount/${itemID}.json`;
		const response = await getUtil(url);
		let res = await response.json();
		count = res.data;
	};

	onMount(() => {
		getCurrentVote();
	});

	afterUpdate(() => {
		getCurrentVote();
	});
</script>

<div class="vote-container">
	<span class="no-selection"
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
			><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
				d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"
			/></svg
		>{count}</span
	>
</div>

<style lang="scss">
	.vote-container {
		display: flex;
		justify-content: end;
		align-items: center;
		flex-direction: row;
		width: 80px;
		padding: 3px 0 0 6px;
		font-size: 10px;
		font-weight: 800;

		// span:hover {
		// 	cursor: pointer;
		// }
	}
	// svg path {
	// 	fill: var(--mainThemePrimaryTextColor);
	// 	transition: all 150ms ease;
	// }
	// svg:hover > path.upvote {
	// 	fill: #198bff;
	// }
	// svg:hover > path.downvote {
	// 	fill: #d730ac96;
	// }
	.no-selection {
		display: flex;
		align-items: center;
		// justify-content: space-between;
		gap: 5px;
		font-size: 10px;
		fill: #525058;

		svg {
			width: 15px;
		}
	}
</style>
