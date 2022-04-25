<script>
	import { goto } from '$app/navigation';

	import { currentPost, currentPostPage } from '$lib/stores/postStore';
	import CustomToggle from '$lib/components/ui/CustomToggle/index.svelte';
	import { post as postUtil } from '$lib/utils';
	import TextButton from '../Button/TextButton.svelte';
	import { toggleUpdateCodeWithPost } from '$lib/stores/codeStore';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let postId;
	export let parentId;
	export let tag = ['Comment'];
	let text = '';
	let withRepl = false;

	async function handleKeyup(event) {}

	const createNewComment = async () => {
		const url = '../../api/comment/createComment.json';

		try {
			const response = await postUtil(url, {
				postId,
				text,
				withRepl,
				parentId,
				tag
			});

			if (response.status !== 200) return;
			let res = await response.json();
			if (withRepl && res && res.data) {
				createProjects(res.data.id);
				text = '';
			} else {
				dispatchCommentEvent();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const createProjects = async (CID) => {
		const url = '../../api/project/createNewProject.json';

		let currentPage = $currentPost.pages.filter((x) => {
			return x.id === $currentPostPage.id;
		})[0];

		let pageData = [
			{
				css: {
					source: JSON.parse(JSON.stringify(currentPage.css.source)),
					type: 'css'
				},
				html: {
					source: JSON.parse(JSON.stringify(currentPage.html.source)),
					type: 'html'
				},
				js: {
					source: JSON.parse(JSON.stringify(currentPage.js.source)),
					type: 'typescript'
				},
				title: `${currentPage.pageTitle.split(' ').join('_')}-comment`,
				description: text,
				comment: CID,
				post: postId
			}
		];

		try {
			const response = await postUtil(url, {
				pageData,
				PID: postId,
				comment: CID
			});

			if (response.status !== 200) return;
			text = '';
			dispatchCommentEvent();
		} catch (error) {
			console.log(error);
		}
	};

	function dispatchCommentEvent() {
		dispatch('commentPosted', {
			update: true
		});
	}

	$: toggleUpdateCodeWithPost.set(withRepl);
</script>

<div class="new-comment-container">
	<label for="">
		<span>Commenting as: </span>
	</label>
	<textarea bind:value={text} on:keyup={handleKeyup} />
	<div class="post-controls">
		<div class="toggle-container">
			<label for="">
				<span>Attach Code</span>
			</label>
			<CustomToggle bind:toggle={withRepl} notLayoutToggle={true} />
		</div>

		<TextButton name={'Post'} cssClass={'blue'} onClickFunc={createNewComment} />
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
	.new-comment-container {
		// height: 100%;
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
