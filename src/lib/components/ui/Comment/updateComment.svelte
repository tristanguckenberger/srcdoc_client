<script>
	import { post as postUtil, put as putUtil } from '$lib/utils';
	import { session } from '$app/stores';
	import { currentPost, currentPostPage } from '$lib/stores/postStore';
	import CustomToggle from '$lib/components/ui/CustomToggle/index.svelte';
	import TextButton from '../Button/TextButton.svelte';
	import {
		cssStore,
		htmlStore,
		jsStore,
		projectStore,
		toggleUpdateCodeWithPost
	} from '$lib/stores/codeStore';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	// export let updateComment;
	// export let commentId;
	export let comment;
	export let editing;
	export let setCode;
	export let text = comment.text;
	let withRepl = false;

	// $: if (setCode) setCode(comment.id);

	onMount(() => {
		if (setCode) setCode(comment.id);
	});

	async function handleKeyup(event) {}

	const updateProjects = async (pid) => {
		const url = '../../api/project/updateProjectBatch.json';
		$projectStore[0].html = { ...$htmlStore };
		$projectStore[0].css = { ...$cssStore };
		$projectStore[0].js = { ...$jsStore };

		let pageData = $projectStore;

		let data = {
			pageData,
			pid: $projectStore.id
		};

		try {
			const response = await putUtil(url, data);

			if (response.status !== 200) return;

			editing = false;

			// fetchUpdatedData(pid);
			// goto("/");
		} catch (error) {
			// console.log(error);
		}
	};

	const updateComment = async () => {
		const url = `../../api/comment/updateComment/${comment.id}.json`;

		try {
			const response = await putUtil(url, {
				text
			});

			if (response.status !== 200) return;
			let res = await response.json();

			if (withRepl && res && res.data) {
				updateProjects(res.data.id);
				// text = "";
			} else {
				dispatchCommentEvent();
			}
		} catch (error) {
			// console.log(error);
		}
	};

	function dispatchCommentEvent() {
		dispatch('commentUpdated', {
			update: true
		});
	}
</script>

<div class="edit-comment-container">
	<label for="">
		<span>Editing: </span>
	</label>
	<textarea bind:value={text} on:keyup={handleKeyup} />
	<div class="post-controls">
		{#if comment.withRepl}
			<div class="toggle-container">
				<label for="">
					<span>Attach Code</span>
				</label>
				<CustomToggle bind:toggle={withRepl} notLayoutToggle={true} />
			</div>
		{/if}

		<TextButton name={'Update'} cssClass={'blue'} onClickFunc={updateComment} />
	</div>
</div>

<style lang="scss">
	textarea {
		border: 2px solid var(--textareaBorder);
		padding: 0.5rem;
		font: inherit;
		max-height: calc(100%);
		min-height: 200px;
		box-sizing: border-box;
		background-color: var(--mainThemePanelAreaColor);
		border-radius: 6px;
		width: 100%;
		resize: none;
	}
	.edit-comment-container {
		height: 100%;
	}
	.post-controls {
		display: flex;
		height: 100px;
		align-items: center;
		justify-content: space-between;

		:global(button.blue) {
			height: 40px;
		}
	}
</style>
