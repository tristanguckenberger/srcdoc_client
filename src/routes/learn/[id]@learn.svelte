<script context="module">
	import {
		isPostStore,
		isCreationStore,
		currentPostPage,
		currentPost,
		postDetailStarter,
		thumbnailStore,
		postAuthor
	} from '$lib/stores/postStore';

	import Post from '$lib/classObjects/post';
	import { initialPostData, pageStore } from '$lib/stores/codeStore';

	export async function load({ params, fetch }) {
		isCreationStore.set(true);
		const postSlug = params?.id;

		if (postSlug) {
			// console.log('postSlug')
			// console.log(postSlug)
			commentHydrator.reload(postSlug);
			const post = postHydrator.reload(postSlug);
			const pages = projectsHydrator.reload(postSlug);
			return {
				post,
				pages,
				postSlug
			};
		}
		

		// if (comments) console.log(comments);
		// if (post) console.log(post);
		// if (pages) console.log(pages)
		return {
			postSlug
		};
	}
</script>

<script lang="ts">
	// Svelte Stuff
	import { tick } from 'svelte';
	import { put as putUtil } from '$lib/utils.js';
	import { session } from '$app/stores';
	import marked from 'marked';
	import { slide } from 'svelte/transition';

	// Components
	import Button from '$lib/components/ui/Button/TextButton.svelte';
	import CustomToggle from '$lib/components/ui/CustomToggle/index.svelte';
	import NewComment from '$lib/components/ui/Comment/NewComment.svelte';
	import Reply from '$lib/components/ui/Reply/index.svelte';
	import Vote from '$lib/components/ui/Vote/index.svelte';

	// Stores
	import { showCaptureThumbnail } from '$lib/stores/codeStore.js';
	import { messageEvent } from '$lib/stores/eventStore';
	import { commentHydrator, postHydrator, projectsHydrator } from '$lib/stores/hydrator';
	import { clientWidth, isVertical, editorContainerHeight, editorContainerWidth, editorOutContainerWidth, editorOutContainerHeight } from '$lib/stores/layoutStore';
	import SplitPane from '$lib/components/layout/SplitPane/index.svelte';
	import { fade, fly } from 'svelte/transition';
	import Editor from '$lib/components/ui/Editor/index.svelte';
	import Output from '$lib/components/ui/Output/index.svelte';
	import Console from '$lib/components/ui/Console/index.svelte';
	import Pane from '$lib/components/layout/EditorLayouts/Base/Pane.svelte';
	import { default as EditorInput } from '$lib/components/layout/EditorLayouts/Base/Input.svelte';
	import { beforeNavigate } from '$app/navigation';
	import {
		selectedStore,
		localCodeStoreHTML,
		localCodeStoreCSS,
		localCodeStoreJS,
		htmlStore,
		cssStore,
		jsStore,
		codeToSave,
		changingPage,
		triggerReset,
		toggleUpdateCodeWithPost
	} from '$lib/stores/codeStore.js';

	// Types
	import type { Log } from '$lib/types/log';

	import { post as postUtil } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { creationStorePostCreationFunc, runSave } from '$lib/stores/creationFuncStore';
	import { afterUpdate, onDestroy, onMount } from 'svelte';

	let hydratedPost;
	let hydratedProjects;
	$: hydratedComments = $commentHydrator;
	$: if ($projectsHydrator) hydratedProjects = $projectsHydrator;
	$: if ($postHydrator) hydratedPost = $postHydrator;
	let selectedTag = $postDetailStarter?.tag;
	let contentWidth;

	let currentPage;
	$: if ($currentPost) post = $currentPost;

	$: currentPage = $currentPostPage;

	$: if ($currentPostPage && $currentPost?.id?.toString() === $currentPostPage?.pid?.toString()) {

		htmlStore.set($currentPostPage?.html);
		cssStore.set($currentPostPage?.css);
		jsStore.set($currentPostPage?.js);
		} else {
		// if (hydratedProjects) currentPostPage.set(hydratedProjects[0])
	}
	
	$: {
		if (hydratedPost) {
			currentPost.set(hydratedPost);
			initialPostData.set(hydratedPost);
		}
	}


	afterUpdate(() => {
		if (!$currentPost && hydratedPost) {
			currentPost.set(hydratedPost);
			initialPostData.set(hydratedPost);
		}
		if (projectSub && projectSub?.length > 0) {
			pageStore.set(projectSub);
		}
	});

	let projectSub;
	const projectSubscription = projectsHydrator.subscribe((x) => {
		console.log('updating');
		console.log(projectSub)
		projectSub = x;
		console.log(projectSub)
	});
		
	let initialized = false;

	onMount(async () => {
		initialized = true;
		if (hydratedPost) currentPost.set(hydratedPost);
		
		if ($postHydrator) {
			initialPostData.set($postHydrator);
			currentPost.set($postHydrator);
		}

		if (projectSub && projectSub?.length > 0) {
			pageStore.set(projectSub);
		}
	});

	beforeNavigate((nav) => {});

	onDestroy(() => {
		initialized = false;
		toggleFix = false;
		currentPost.set({});
		currentPostPage.set({});
		pageStore.set([]);
		hydratedProjects = null;
		post = null;
		currentPage = null;
	});

	$: windowWidth = $clientWidth;
	$: value = $isVertical;


	// Initial Declarations
	let logs: Log[] = [];
	let pageContainerWidth = 0;
	let pages;
	let editorVisible = false;
	let isPost;
	let splitPaneContainer;
	let currentPostTitle = '';
	let currentPostBlurb = '';
	let showLoader = false;



	// Props
	export let post;
	export let projects;
	export let postOBJ;
	export let authorID;
	export let createdAt;
	export let postSlug;
	let postComments;

	// Initial Declarations
	let textAreaGrowContainer;
	let commentsOBJ;
	let mods;
	let showPostDetails = false;
	let showCodeDetails = false;

	let attachCode = false;
	let pageDescription = '';
	let tags = [
		{ id: 1, text: `Q&A` },
		{ id: 2, text: `Tutorial` },
		{ id: 3, text: `PSA` },
		{ id: 4, text: `Request` }
	];
	let editing = false;
	let page;
	let getCommentsSwitch = true;

	// Reactive Declarations & Statements
	$: if (page && page.description) {
		let html = marked.lexer(page.description);
		html.forEach((token, i) => {
			if (token.type === 'code') {
				token.escaped = true;
			}
		});
		pageDescription = marked.parser(html);
	}
	$: if (currentPostBlurb.length >= 260) {
		let characters = currentPostBlurb.split('');
		characters.pop();
		currentPostBlurb = [...characters].join('');
	}
	$: if (currentPostTitle.length >= 100) {
		let characters = currentPostTitle.split('');
		characters.pop();
		currentPostTitle = [...characters].join('');
	}
	$: toggleUpdateCodeWithPost.set(attachCode);
	$: page = (async () => {
		await tick(); 
		return $currentPostPage;
	})().then(r => r);
	$: logs = $messageEvent;

	// Life Cycle Methods
	let fetchCount = 0;

	// Post Control Functions
	const newPage = () => {
		tick();
		// savePage();
		$currentPost.addPage('text');
		// $currentPost.currentPageID = $currentPost.pages.length;
		currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
		triggerReset.set(true);
	};
	const deletePage = () => {
		tick();
		$currentPost.removePage($currentPost.currentPageID);
		currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
		triggerReset.set(true);
	};

	const fetchComments = async () => {
		commentHydrator.reload(postSlug);
	};

	// Fetch Funcs
	const updatePost = async () => {
		const pid = $currentPost.id;
		const url = `../../api/post/updatePost/${pid}.json`;
		let title = currentPostTitle;
		let text = currentPostBlurb;
		let photo = $thumbnailStore;
		let data = {
			title,
			text,
			photo,
			tag: selectedTag ? [selectedTag.text] : []
		};

		try {
			const response = await putUtil(url, data);

			if (response.status !== 200) return;
			let res = await response.json();
			updateProjects(res.data.id);
		} catch (error) {
			// console.log(error);
		}
	};
	const updateProjects = async (pid) => {
		const url = '../../api/project/updateProjectBatch.json';

		let pageData = $currentPost.pages.map((page) => {
			let updatedPage = { ...page };
			updatedPage.text = page.description;
			delete updatedPage.description;
			return updatedPage;
		});

		let data = {
			pageData,
			pid
		};

		const response = await putUtil(url, data);
		if (response.status !== 200) return;

		editing = false;
	};

	let showCreateComment = false;
	$: showCaptureThumbnail.set(editing);
	$: dateCreated = new Date(createdAt);
	const now = new Date();
	$: daysPassed = new Date().getTime() - dateCreated.getTime();
	$: totalDays = Math.floor(daysPassed / (1000 * 3600 * 24));
	let splitOne = null;
	let splitTwo = null;
	let splitFour = null;
	let splitOneWidth = null;

	$: cacldSplitOneWidth = splitOneWidth;

	let paneOneSize = 30; // This is the page pane
	let paneTwoSize = 70; // This is the editor and output pane cluster
	let postContent;








	let toggleFix = false;

$: {
	const objCheck = ($currentPostPage && Object.keys($currentPostPage).length === 0 && Object.getPrototypeOf($currentPostPage) === Object.prototype);
	const objCheckForItems = ($currentPostPage && Object.keys($currentPostPage).length !== 0 && Object.getPrototypeOf($currentPostPage) === Object.prototype);
	if (objCheck && !!$pageStore && initialized && ($currentPost?.id == $pageStore[0]?.pid)) {
		currentPostPage.set(JSON.parse(JSON.stringify($pageStore[0])));
	}
	if (objCheckForItems && initialized && ($currentPost?.id == $pageStore[0]?.pid) && toggleFix === false) {
		if ($pageStore[0]?.pid == $currentPostPage?.pid) {

			console.log('SETTING THE CODE STORES')
			console.log($currentPostPage);
			htmlStore.set($currentPostPage?.html);
			cssStore.set($currentPostPage?.css);
			jsStore.set($currentPostPage?.js);
			changingPage.set(true);
			setTimeout(() => {
				toggleFix = true;
			}, 1000); 
		
		} else {
			if (($currentPost?.id == $pageStore[0]?.pid)) {
				currentPostPage.set(JSON.parse(JSON.stringify($pageStore[0])));
				changingPage.set(true);
			}
		}

	}
}

</script>
<h1>Howdy</h1>
<div id="page-container" class:showLoader bind:clientWidth={pageContainerWidth}>
	{#if windowWidth && windowWidth > 900}
		<div class:showLoader bind:this={splitPaneContainer} class="split-container">
			<SplitPane panes={['#split-0', '#split-1']} sizes={[paneOneSize, paneTwoSize]}>
				<section id="split-0" bind:this={splitOne} bind:clientWidth={splitOneWidth}>
			
					<div class="post-contentContainer" style="--contentWidth: calc({contentWidth}px - 2rem);">
						<div class="post-content" bind:clientWidth={contentWidth} bind:this={postContent}>
							{#if editing}
								<label for="" class="toggle">
									<h3
										style="font-weight: 500;"
										on:click={() => {
											showPostDetails = !showPostDetails;
										}}
									>
										Post Details
										<span>
											{#if showPostDetails}
												-
											{:else}
												+
											{/if}
										</span>
									</h3>
								</label>
								{#if showPostDetails}
									<div
										class="post-details"
										in:slide={{ delay: 0, duration: 100 }}
										out:slide={{ delay: 100, duration: 150 }}
									>
										<div class="row">
											<label for="post-title">
												<span>Post Title</span>
												<input
													type="text"
													bind:value={currentPostTitle}
													name="post-title"
													placeholder="Add post title..."
												/>
											</label>

											<label style="flex-grow: 1; padding-left: 10px;">
												<span>Post Type</span>
												<select bind:value={selectedTag}>
													{#each tags as tag}
														<option value={tag}>{tag.text}</option>
													{/each}
												</select>
											</label>
										</div>
										<br />
										<br />
										<label for="page-text">
											<span>Post Description</span>
										</label>
										<textarea
											class="description-body"
											name="postText"
											placeholder="Add post description..."
											bind:value={currentPostBlurb}
										/>
										<br />
										<br />
									</div>
								{/if}
								<br />
								<hr />

								<label for="" class="toggle">
									<h3
										style="font-weight: 500;"
										on:click={() => {
											showCodeDetails = !showCodeDetails;
										}}
									>
										Code Details
										<span>
											{#if showCodeDetails}
												-
											{:else}
												+
											{/if}
										</span>
									</h3>
								</label>
								{#if showCodeDetails}
									<label
										for=""
										in:slide={{ delay: 0, duration: 100 }}
										out:slide={{ delay: 100, duration: 150 }}
									>
										<span>Attach Code</span>
									</label>
									<CustomToggle bind:toggle={attachCode} notLayoutToggle={true} />
								{/if}
								<br />
								<hr />

								<label for="">
									<h3 style="font-weight: 500;">
										<span> Page Details </span>
									</h3>
								</label>

								<Button name={'Add Page'} cssClass="gray" onClickFunc={newPage} />
								<Button name={'Delete Page'} cssClass="red" onClickFunc={deletePage} />
								<br />
								<label for="page-title">
									<span>Page Title</span>
									<input type="text" bind:value={page.pageTitle} name="title" />
								</label>
								<br />
								<label for="page-text">
									<span>Page Body</span>
								</label>
								<div class="grow-wrap" bind:this={textAreaGrowContainer}>
									<textarea
										name="postText"
										placeholder="Page body..."
										bind:value={page.description}
										on:input={() => {
											textAreaGrowContainer.dataset.replicatedValue = page.description;
										}}
									/>
								</div>
								<div class="post-control-bar">
									<div class="format-controls">
										<div class="control insert">+</div>
									</div>

									<Button name={'Cancel'} cssClass="red" onClickFunc={() => (editing = false)} />
									<Button name={'Update'} cssClass="blue" onClickFunc={updatePost} />
								</div>
							{:else}
								<div class="post-top-info">
									{#if ($session?.id === $currentPost?.authorID) || ($session?.user?.id === $currentPost?.authorID)}
										<button on:click={() => (editing = true)}>Edit</button>
									{/if}
								</div>

								<h1>{page?.pageTitle || page?.title}</h1>
								{#if $postAuthor}
									<div class="author-info">
										<div class="author-img" />
										<div class="author-name">
											<span>
												{$postAuthor.username}
											</span>
											<span style="font-size: .8rem;">
												{#if totalDays && totalDays <= 7}
													posted {totalDays >= 1
														? totalDays + ' days ago'
														: totalDays + ' hours ago'}
												{:else}
													posted on {dateCreated.toLocaleDateString()}
												{/if}
											</span>
										</div>
									</div>
								{/if}
								<p>{@html pageDescription}</p>
							{/if}
							<br />
							{#if showCreateComment}
								<NewComment
									postId={$currentPost.id}
									parentId={null}
									tag={['Comment']}
									on:commentPosted={() => {
										fetchComments();
									}}
								/>

								<div class="post-control-bar">
									<Vote itemID={$currentPost.id} isPost={true} />
									<button class="comment-button cancel" on:click={() => (showCreateComment = false)}
										>Cancel</button
									>
								</div>
							{:else}
								{#if cacldSplitOneWidth > 400}
									<div class="post-control-bar">
										<Vote itemID={$currentPost.id} isPost={true} />
										<button class="comment-button" on:click={() => (showCreateComment = true)}
											>Comment</button
										>
									</div>
								{/if}
							{/if}
							<hr />

							{#if hydratedComments}
								<div class="comments" bind:this={commentsOBJ}>
									<Reply
										{mods}
										bind:postComment={hydratedComments}
										expanded={false}
										slug={$currentPost.id}
										{fetchComments}
									/>
								</div>
							{/if}
						</div>
					</div>
				</section>

				
				<section id="split-1" style="z-index: 1000000000;" bind:this={splitTwo}>
					<SplitPane panes={['#split-2', '#split-3']} vertical={value}>
						<EditorInput />

						<section id="split-3" bind:this={splitFour} bind:clientWidth={$editorOutContainerWidth} bind:clientHeight={$editorOutContainerHeight}>
							<SplitPane
								panes={['#split-output', '#split-console']}
								vertical={!value}
								sizes={[100, 0]}
							>
								<Pane id={'split-output'} label={'output'}>
									<Output slot="pane-content" />
								</Pane>
								<Pane id={'split-console'} label={'console'}>
									<Console slot="pane-content" {logs} />
								</Pane>
							</SplitPane>
						</section>
					</SplitPane>
				</section>

			</SplitPane>
		</div>
	{/if}
</div>

<style lang="scss">
	:global(.gutter) {
		min-width: 10px;
		min-height: 10px;
	}
	section#split-1 {
		min-width: 110px;
	}

	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
	.divi {
		background-color: #52505817;
		height: 3px;
		margin-inline-end: 10px;
		margin-block-end: 0px;
		border: none;
		margin-block-start: 0px;
	}
	:global(html, body, #svelte) {
		height: 100%;

		color: #525058;
		margin: 0;
		font-family: 'Inter', sans-serif;
	}
	:global(h1, h2) {
		font-family: 'Inter', serif;
	}
	:global(a) {
		color: var(--mainThemePrimaryTextColor);
		text-decoration: none;
		&:hover {
			cursor: pointer;
		}
	}
	#nav-container {
		grid-area: nav;
		margin: 0;
		padding: 0 10px;
	}
	#page-container {
		grid-area: page;
		margin: 0 10px 10px 10px;
		max-width: calc(100vw - 20px);
	}
	:global(.monaco-editor, .overflow-guard) {
		border-radius: 6px !important;
	}
	.section-panel {
		flex-grow: 1;
		border-radius: 6px;
		background-color: var(--mainThemePanelColor);
		min-width: 30px;
	}
	#split-0 {
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		padding-left: 15px;
	}
	.sticky-toggle {
		margin-block-start: 0;
		display: grid;
		grid-template-columns: 1fr repeat(4, auto);
		grid-gap: 10px;
		align-items: center;
		height: 100%;
		width: 100%;
	}
	.menu-toggle {
		position: relative;
		left: 0px;
		width: 48px;
		height: 48px;
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
		display: flex;
		justify-content: center;
		align-items: center;
		&:hover {
			cursor: pointer;
		}
		span {
			position: relative;
			right: 9px;
			height: 100%;
			width: 2px;
			background-color: #525058;
		}
	}
	.menu-toggle.select {
		width: 100%;
		min-width: 250px;
		height: 48px;
	}
	select {
		width: 90%;
		min-width: 250px;
		height: 40px;
		font-size: 16px;
		color: var(--mainThemePrimaryTextColor);
		border: none;
		background-color: unset;
		outline-offset: unset;
	}
	select:focus-visible {
		outline-offset: unset;
		outline: none;
	}
	:global(label, button, .no-selection) {
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
	}
	.left-panel-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		grid-gap: 10px;
		height: 100%;
	}
	.left-panel-container.authPage {
		margin-top: 58px !important;
		height: calc(100% - 58px);
	}
	.panel-container {
		width: 100%;
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		padding-bottom: 10px;
		flex-grow: 1;
	}
	.panel-container.bottom {
		padding: 10px 0 10px 0;
		flex-grow: unset;
	}
	.form-top {
		width: calc(100% - 20px);
		margin: auto;
		display: flex;
		justify-content: space-between;

		h2 {
			font-family: 'Inter', sans-serif;
			font-size: 18px;
			color: #c21997;
			-webkit-touch-callout: none; /* iOS Safari */
			-webkit-user-select: none; /* Safari */
			-khtml-user-select: none; /* Konqueror HTML */
			-moz-user-select: none; /* Old versions of Firefox */
			-ms-user-select: none; /* Internet Explorer/Edge */
			user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
		}
	}
	.filter-options {
		width: calc(100% - 20px);
		margin: auto;
		height: 100%;
	}
	.filter-options .filter-options-center {
		display: flex;
		justify-content: flex-start;
		flex-flow: row wrap;
		grid-gap: 10px;
		background-color: var(--mainThemeBackgroundColor);
		border-radius: 6px;
		width: calc(100% - 20px);
		margin: auto;
		padding: 10px;
		list-style: none;

		li {
			padding: 10px;
			width: fit-content;
			font-size: 14px;
			a {
				transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
				&:hover {
					color: #6e6c7383;
				}
			}
		}
	}
	footer .filter-options .filter-options-center {
		background-color: unset;
		padding: 0;
	}
	.filter-options label {
		padding: 10px;
		width: fit-content;
		font-size: 14px;
		transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
		&:hover {
			cursor: pointer;
			background-color: #f3f3f3;
			border-radius: 6px;
		}
		&.checked {
			background-color: #4ca5ff;
			color: #ffffff;
		}
	}
	.filter-options label input {
		display: none;
	}
	:global(.form-top .refresh) {
		height: fit-content;
		padding: 10px;
		border: none;
		border-radius: 6px;
		margin-block-start: 0.83em;
		margin-block-end: 0.83em;
		background-color: #c21997;
		color: #ffffff;
		font-weight: 600;
		font-family: 'Inter', sans-serif;

		&:hover {
			cursor: pointer;
		}
	}
	:global(.filter-options label.checked) {
		background-color: #c21997 !important;
		color: #ffffff !important;
		border-radius: 6px;
		// font-weight: 600;
	}
	span.filter-label {
		width: calc(100% - 20px);
		margin: auto;
		display: flex;
		justify-content: flex-start;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none; /* Safari */
		-khtml-user-select: none; /* Konqueror HTML */
		-moz-user-select: none; /* Old versions of Firefox */
		-ms-user-select: none; /* Internet Explorer/Edge */
		user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
		h2 {
			font-family: 'Inter', sans-serif;
			font-size: 14px;
			color: #6e6c73;
			margin-block-end: 0.43em;
		}
	}
	.split-container {
		height: 100%;
	}
	:global(.content-container .center-panel div.left) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
		grid-template-rows: repeat(auto-fill, 285px);
		grid-gap: 10px;
		max-width: 1700px;
		width: 100% !important;
		padding: 0 10px 0 0;
		height: calc(100%);
		overflow-y: scroll;
		max-height: calc(100vh - 10px);
		color-scheme: var(--colorScheme);
	}
	:global(.content-container .center-panel div.left.editorVisible) {
		max-width: var(--pageContainerWidth) !important;
		width: var(--pageContainerWidth) !important;
		position: absolute;
		left: 0;
		padding: 0 !important;
	}
	:global(.center-panel .authPage.left) {
		overflow-y: hidden !important;
		width: 100% !important;
	}
	.left.authPage {
		grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
	}
	.creation-modal-container {
		display: flex;
		flex-direction: column;
	}
	.post-details {
		display: flex;
		flex-direction: column;
	}
	:global(.post-controls button.blue) {
		z-index: 10000;
		background-color: #198bff;
		font-weight: 600;
		height: 100%;
		display: flex;
		// flex-direction: ;
		align-items: center;
		font-family: Karla, sans-serif;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		padding: 0 1rem;
	}
	:global(.monaco-editor .scroll-decoration) {
		box-shadow: none !important;
	}
	@media screen and (max-width: 900px) {
		:global(.left-panel) {
			display: none;
		}
		:global(nav.isPost) {
			grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)) !important;
		}
		#split-0 {
			background-color: var(--mainThemePanelColor);
			border-radius: 6px;
			padding-left: 0;
			height: calc(100%);
		}

		#split-0.noScroll {
			overflow-y: hidden;
		}

		:global(.post-content) {
			min-width: unset !important;
		}
		:global(.content-container .center-panel div.left) {
			width: calc(100%) !important;
		}
		main {
			display: grid;
			width: 100%;
			height: 100%;
			overflow-y: hidden;
			overflow-x: hidden;
			grid-template-rows: calc(100vh - 68px) 68px;
			grid-template-columns: 1fr;
			grid-template-areas:
				'page'
				'nav';
		}
		#page-container {
			margin: 10px 10px 0 10px;
			border-radius: 6px;
			overflow: hidden;
			-webkit-mask-image: -webkit-radial-gradient(white, black);
		}
		.center-panel.s-9tIzRZLJ0Lek {
			height: calc(100vh - 78px);
			border-radius: 6px;
			overflow: hidden;
			-webkit-mask-image: -webkit-radial-gradient(white, black);
		}

		.editor-opts {
			position: absolute;
			z-index: 10;
			bottom: 0;
			width: calc(100% - 20px);
			display: flex;
			justify-content: center;

			.sub-menu {
				display: flex;
				width: 150px;
				border-radius: 6px;
				height: 100%;
				justify-content: space-between;
				align-items: center;
				list-style-type: none;
				list-style: none;
				background-color: #b4b4b454;
				-webkit-backdrop-filter: saturate(180%) blur(16px);
				backdrop-filter: saturate(180%) blur(16px);
				margin-block-start: 0;
				padding-inline-start: 0;
				padding: 10px;

				li {
					z-index: 1000000000000;
					font-weight: 600;
					color: var(--mainThemeFadedTextColor);
				}
				li.active,
				.htmlActive,
				.cssActive,
				.jsActive {
					color: var(--mainThemePrimaryTextColor);
				}
			}
		}
		:global(.auth-top-container .auth-top-container-inner) {
			width: 100%;
		}
		:global(.background-container) {
			.flex {
				flex-direction: column;
			}

			h1 {
				font-size: 25px;
			}
		}

		:global(.monaco-editor .iPadShowKeyboard) {
			display: none;
		}

		:global(.top-right .auth-form) {
			display: flex;
			flex-direction: column;
			width: 100% !important;
			z-index: 1;
			margin: unset !important;
			margin-top: unset !important;
		}
		:global(.form-content-container) {
			width: calc(100% - 15vw) !important;
		}

		:global(.inner-header.flex div) {
			flex-direction: column;
			z-index: 1;
		}

		:global(.top-slide) {
			z-index: 1 !important;
		}
		:global(.bot-slide),
		:global(.mid-slide) {
			z-index: -99999999999999 !important;
		}

		:global(#page-container.authNavOpen) {
			// visibility: hidden;
		}

		#split-0 {
			overflow: hidden !important;
			border-radius: 6px;
			// height: 150px !important;
		}
	}

	.logo-text {
		position: absolute;
		top: 0;
		left: 20px;
		z-index: 1;
		font-family: 'Outfit', sans-serif;
		color: #ffffff;
		padding: 10px;
		padding-top: 5px;
		font-weight: 500;
		background: linear-gradient(-60deg, #c21997 0%, #7719c2 100%) !important;
		font-size: 1.8em;
		border-radius: 6px;
		transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: 0px 0px 0px 0px #41414125;
		line-height: 0.9em;
	}

	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		height: 100%;
	}
	.wavesBG {
		position: absolute;
		bottom: 0;
		height: 58vh;
		width: 100%;
	}

	.waves {
		position: relative;
		width: 100%;
		height: 15vh;
		margin-bottom: -7px;
		min-height: 100px;
		max-height: 150px;
	}

	.content {
		position: relative;
		height: 28vh;
		text-align: center;
		background-color: transparent;

		&.flex {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			width: 80%;
			grid-gap: 10rem;
			margin: 0 auto 4rem auto;
			height: fit-content;
			height: -moz-fit-content;
			align-items: flex-start;

			.features {
				display: flex;
				flex-direction: column;

				svg {
					width: 100px;
					position: relative;
				}

				h2 {
					font-family: 'Inter', sans-serif;
					color: var(--mainThemePrimaryTextColor);
					text-align: left;
					margin-block-end: 0.5em;
					font-size: 30px;
				}
			}
		}
	}

	.filler {
		background-color: var(--mainThemeBackgroundColor);
		height: inherit;
		border-radius: 0 0 6px 6px;
	}

	// i => value to replace
	// calc(i * var(--speed-multiplyer))
	// calc(20 * var(--speed-multiplyer))
	.parallax > use {
		animation: move-forever cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
	}
	.parallax > use:nth-child(1) {
		animation-delay: calc(-2s);
		animation-duration: calc(7 * var(--speed-multiplyer));
	}
	.parallax > use:nth-child(2) {
		animation-delay: calc(-3s);
		animation-duration: calc(10 * var(--speed-multiplyer));
	}
	.parallax > use:nth-child(3) {
		animation-delay: calc(-4s);
		animation-duration: calc(13 * var(--speed-multiplyer));
	}
	.parallax > use:nth-child(4) {
		animation-delay: calc(-5s);
		animation-duration: calc(20 * var(--speed-multiplyer));
	}
	@keyframes move-forever {
		0% {
			transform: translate3d(85px, 0, 0);
		}
		100% {
			transform: translate3d(-90px, 0, 0);
		}
	}
	.wavesBG {
		height: 87%;
	}

	.auth-container {
		width: 100%;
		height: 97%;
		background: linear-gradient(-60deg, #c21997 0%, #4f19c2 100%) !important;
	}
	.auth-form.modal-auth {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 64%;
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		-webkit-border-bottom-right-radius: 6px;
		-webkit-border-bottom-left-radius: 6px;

		:global(form) {
			position: absolute;
			width: calc(100% - 20px);
			bottom: 0;
			padding: 0px 10px 10px 10px;
			height: 93%;
		}

		:global(form > div) {
			height: 100%;
		}

		.form-split {
			backdrop-filter: unset !important;
			width: calc(100% - 40px);
			min-height: 340px;
			height: 100% !important;
			border-radius: 6px;
			display: flex;
			justify-content: center;
			overflow: hidden;
			background-color: var(--mainThemeModalFormBlur);
			padding: 0 10px 10px 10px;
			-webkit-backdrop-filter: saturate(180%) blur(20px);
			backdrop-filter: saturate(180%) blur(20px);
			margin: auto;
			margin-bottom: 10px;
		}
	}

	:global(.modal-container) {
		position: absolute;
		margin: 10px !important;
		border-radius: 6px;
		z-index: 10000000000000000000000000000000000000000000000;
		width: calc(100% - 20px);
		min-height: calc(100vh - 78px);
		background-color: var(--mainThemeModalBlurBgColor);
		display: flex;
		justify-content: center;
		align-items: center;
		height: calc(100% - 20px);
		top: unset !important;
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		backdrop-filter: saturate(180%) blur(20px);
	}

	:global(.modal-auth) {
		form {
			div {
				height: 100%;
			}
		}
	}

	:global(.auth-form.modal-auth) {
		background-color: var(--mainThemeBackgroundColor);
	}

	:global(.auth-form.modal-auth.isSignUp form) {
		height: 120% !important;
	}

	:global(.modal-auth) {
		position: absolute;
		bottom: 0;
		width: calc(100%);
		height: 61%;

		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		-webkit-border-bottom-right-radius: 6px;
		-webkit-border-bottom-left-radius: 6px;

		form {
			position: absolute;
			width: 100%;
			bottom: 0;
			height: 93% !important;

			.form-split {
				width: 100%;
				min-height: 350px;
				height: 100%;
				border-radius: 6px;
				display: flex;
				justify-content: center;
				overflow: hidden;
				background-color: var(--mainThemeModalFormBlur);
				-webkit-backdrop-filter: saturate(180%) blur(20px);
				backdrop-filter: saturate(180%) blur(20px);
			}
		}
	}

	:global(.form-split) {
		background-color: var(--mainThemeModalFormBlur);
	}

	:global(textarea) {
		color: var(--mainThemePrimaryTextColor);
		background-color: var(--mainThemePanelAreaColor);
	}

	// @media screen and (min-width: 900px) {

	//   ::-webkit-scrollbar {
	//     background-color: var(--mainThemePanelColor);
	//     border-top-right-radius: 6px;
	//     border-bottom-right-radius: 6px;
	//     -webkit-border-bottom-right-radius: 6px;
	//     -webkit-border-top-right-radius: 6px;
	//   }
	//   ::-webkit-scrollbar-thumb {
	//     background-color: var(--mainThemePanelAreaColor);
	//     // border-top-right-radius: 6px;
	//     // border-bottom-right-radius: 6px;
	//   }
	//   ::-webkit-scrollbar-track {
	//     border-top-right-radius: 6px;
	//     border-bottom-right-radius: 6px;
	//     -webkit-border-bottom-right-radius: 6px;
	//     -webkit-border-top-right-radius: 6px;
	//     // background-color: red;
	//     overflow: hidden;
	//   }
	// }
	#split-output {
		background-color: #fbfbfb !important;
	}

	.showLoader {
		visibility: hidden !important;
		display: none !important;
	}
	.spinner-container {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#loading {
		display: inline-block;
		width: 50px;
		height: 50px;
		border: 3px solid var(--mainThemeFadedTextColor);
		border-radius: 50%;
		border-top-color: var(--mainThemePrimaryTextColor);
		animation: spin 1s ease-in-out infinite;
		-webkit-animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to {
			-webkit-transform: rotate(360deg);
		}
	}
	@-webkit-keyframes spin {
		to {
			-webkit-transform: rotate(360deg);
		}
	}

	textarea {
		border: 2px solid var(--textareaBorder);
	}

	.logo-text-nav {
		z-index: 1;
		font-family: 'Inter', sans-serif;
		color: var(--mainThemePrimaryTextColor);
		padding: 10px 0;
		padding-top: 8px;
		font-weight: 400;
		border-radius: 6px;
		transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: 0px 0px 0px 0px #41414125;
		line-height: 0.9em;
		justify-self: left;
		width: fit-content;
	}
	.image-nav {
		// background-color: blue;
		padding: 5px 0 0 0;
		width: 50px;
		height: 50px;
		& > :global(div.image-slot) {
			height: 100%;
			width: 100%;
			:global(.image-container) {
				// background-color: red;
				width: 100%;
				height: 100%;
				border-radius: 6px;
				background-image: var(--profilePic);
				background-repeat: no-repeat;
				background-size: contain;
			}
		}
	}
	.nav-id-header {
		display: flex;
		column-gap: 1rem;
		flex-direction: row;
		justify-content: space-between;
		margin: 0 0 3rem 0;

		.logo-text-nav {
			margin-block-start: 0;
			margin-block-end: 0;
		}
	}

	// user image stuff

	.user-info-modal {
		padding: 1rem;
		height: 100%;
		display: flex;
		flex-direction: column;

		.post-details {
			flex-grow: 1;

			textarea {
				width: 100%;
				height: calc(100% - 3rem);
				box-sizing: border-box;
				border: 2px solid var(--textareaBorder);
				padding: 0.5rem;
				font: inherit;
				background-color: var(--mainThemePanelAreaColor);
				border-radius: 6px;
				resize: none;
			}
		}

		:global(.image-container) {
			// background-color: red;
			height: 100%;
			border-radius: 6px;
			background-image: var(--profilePic);
			background-repeat: no-repeat;
			background-size: cover;
			transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);

			&:hover {
				cursor: pointer;
				filter: brightness(0.5);
			}
		}
	}
	:global(pre) {
		background-color: #525058;
		border-radius: 4px;
		font-size: 85%;
		color: #ffffff;
		line-height: 1.45;
		overflow: auto;
		padding: 16px;
	}
	:global(button.google-auth) {
		width: 100%;
		border: 0;
		background-color: #4285f4;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
		padding: 5px 0;
		height: 30px;
		box-sizing: content-box;
		cursor: pointer;
	}
	svg.menu-icons-svg path,
	svg.menu-icons-svg circle,
	svg.menu-icons-svg line,
	svg.menu-icons-svg polyline {
		stroke: var(--mainThemePrimaryTextColor) !important;
	}

	@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
	.post-content {
		max-width: 750px;
		min-width: 350px;
		margin: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		height: calc(100% - 2rem);
	}
	.grow-wrap {
		display: grid;
		max-height: 100%;
		min-height: 200px;
	}
	.grow-wrap::after {
		/* Note the weird space! Needed to preventy jumpy behavior */
		content: attr(data-replicated-value) ' ';
		/* This is how textarea text behaves */
		white-space: pre-wrap;
		/* Hidden from view, clicks, and screen readers */
		visibility: hidden;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		resize: none;
		height: 100%;
		border: 0px solid black;
		padding: 0.5rem;
		font: inherit;
		grid-area: 1/1/2/2;
		height: 100%;
		max-height: calc(100%);
		box-sizing: border-box;
	}
	.grow-wrap > textarea,
	.grow-wrap::after {
		border: 2px solid #52505814;
		border-bottom: none;
		padding: 0.5rem;
		font: inherit;
		grid-area: 1/1/2/2;
		height: 100%;
		max-height: calc(100%);
		box-sizing: border-box;
		overflow: auto;
		background-color: var(--mainThemePanelAreaColor);
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
	}
	:global(pre) {
		background-color: #525058;
		border-radius: 4px;
		font-size: 85%;
		color: #ffffff;
		line-height: 1.45;
		overflow: auto;
		padding: 16px;
	}
	:global(pre code) {
		font-family: 'Roboto Mono', monospace;
	}
	.post-control-bar {
		border-radius: 6px;
		height: 56px;
		background-color: var(--postControlBackgroundColor);
		font-size: 16px;
		box-shadow: var(--mainThemeShadow);
		display: flex;
		justify-content: space-between;
		min-height: 36px;
		bottom: 20px;
		position: fixed;
		// width: 100%;
		// max-width: 750px;
		// min-width: 350px;
		width: var(--contentWidth);
		margin: auto;
		box-sizing: border-box;
		z-index: 1000000000;
		padding: 10px;

		.format-controls {
			.control {
				&.insert {
					font-size: 2rem;
					font-weight: 200;
					line-height: 2rem;
					height: 2rem;

					&:hover {
						cursor: pointer;
					}
				}
			}
		}

		:global(button) {
			z-index: 10000;

			font-weight: 600;
			height: 100%;
			display: flex;
			// flex-direction: ;
			align-items: center;
			font-family: Karla, sans-serif;
			color: #ffffff;
			border: none;
			border-radius: 6px;
			padding: 0 1rem;
		}
		:global(button.blue) {
			background-color: #198bff;
		}
		:global(button.red) {
			background-color: #cc1313;
		}
		:global(button.gray) {
			background-color: #ececec;
		}
	}
	hr {
		width: 100%;
		height: 10px;
		min-height: 10px;
		background-color: var(--mainThemeBackgroundColor);
		border-style: none;
		border-radius: 3px;
		margin: 1rem 0;
		margin-top: 0;
		transition: all 0.2s ease;
	}
	.description-body {
		height: 200px;
		min-height: 200px;
		border: 2px solid #52505814;
		border-radius: 6px;
	}
	label {
		display: flex;
		flex-direction: column;
		span {
			color: var(--mainThemePrimaryTextColor);
			font-weight: 500;
			padding-bottom: 3px;
		}
	}
	input {
		color: var(--mainThemePrimaryTextColor);
		background: #fbfbfb;
		font-size: 16px;
		border: 2px solid #52505814;
		font: inherit;
		padding: 5px;
		outline: inherit;
		background-color: rgb(255, 255, 255, 0.9);
		border-radius: 6px;
		height: 30px;
	}
	.post-details .row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	select {
		color: var(--mainThemePrimaryTextColor);
		background: #fbfbfb;
		font-size: 16px;
		border: 2px solid #52505814;
		font: inherit;
		padding: 5px;
		outline: inherit;
		background-color: rgb(255, 255, 255, 0.9);
		border-radius: 6px;
		height: 44px;
		flex-grow: 1;
	}
	p {
		code {
		}
	}
	label.toggle {
		cursor: pointer;
	}
	.post-contentContainer {
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		color-scheme: var(--colorScheme);
		overflow-x: hidden;
		border-radius: 6px;
	}
	.post-top-info {
		display: flex;
		justify-content: space-between;

		button {
		}
	}
	.author-info {
		display: flex;
		align-items: center;
		column-gap: 10px;
	}
	.author-img {
		column-gap: 10px;
		height: 30px;
		width: 30px;
		border-radius: 3px;
		background-image: var(--authorPic);
		background-repeat: no-repeat;
		background-size: cover;
		transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);

		&:hover {
			cursor: pointer;
			filter: brightness(0.5);
		}
	}
	.comment-button {
		background-color: #198bff;
		&:focus {
			outline: inherit;
		}
		&:hover {
			cursor: pointer;
		}
	}
	.comment-button.cancel {
		background-color: #c21997;
	}
	@media screen and (max-width: 900) {
		button {
			height: 40px !important;
		}
	}
	.comments {
		padding-bottom: 80px;
	}
	.author-name {
		display: flex;
		flex-direction: column;
	}
</style>
