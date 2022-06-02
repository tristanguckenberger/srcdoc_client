<script context="module">
	import {
		isPostStore,
		currentPostPage,
		currentPost,
		postDetailStarter,
		thumbnailStore,
		isCreationStore,
		postAuthor
	} from '$lib/stores/postStore';
	import Post from '$lib/classObjects/post';

	export async function load({ params }) {
		isPostStore.set(true);
		isCreationStore.set(false);
		showCreationModal.set(false);
		let postOBJ = new Post('Add a post title...', 'Add a post description...');
		postOBJ.addPage('Page Title', 'Page Body');
		const postSlug = params.post;
		currentPost.set(postOBJ);
		currentPostPage.set(postOBJ.pages[0]);

		return {
			props: {
				postOBJ
			}
		};
	}
</script>

<script>
	import { onMount, tick } from 'svelte';
	import {
		htmlStore,
		cssStore,
		jsStore,
		codeToSave,
		changingPage,
		triggerReset,
		lockPageStore,
		showCaptureThumbnail,
		toggleUpdateCodeWithPost
	} from '$lib/stores/codeStore.js';
	import { post as postUtil } from '$lib/utils.js';
	import { navigating, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button/TextButton.svelte';
	import SplitPane from '$lib/components/layout/SplitPane/index.svelte';
	import Editor from '$lib/components/ui/Editor/index.svelte';
	import Output from '$lib/components/ui/Output/index.svelte';
	import Console from '$lib/components/ui/Console/index.svelte';
	import { slide, fade } from 'svelte/transition';
	import { showCreationModal } from '$lib/stores/modalStore';
	import { put as putUtil } from '$lib/utils.js';
	import marked from 'marked';
	import { clientWidth } from '$lib/stores/layoutStore';

	// export let posts;
	// export let projects;
	// export let postOBJ;
	export let createdAt;

	const now = new Date();
	let logs = [];
	let value = false; //  Layout Toggle
	let showLoader = false;
	let contentWidth;
	let page;
	let tags = [
		{ id: 1, text: `Q&A` },
		{ id: 2, text: `Tutorial` },
		{ id: 3, text: `PSA` },
		{ id: 4, text: `Request` }
	];
	let selectedTag = $postDetailStarter?.['tag'];
	let pageDescription = '';
	let currentPostTitle = '';
	let currentPostBlurb = '';
	let attachCode = false;
	let pageContainerWidth = 0;
	let editing = false;
	let getCommentsSwitch = true;
	let fetchCount = 0;
	let textAreaGrowContainer;
	let splitPaneContainer;
	let showPostDetails = false;

	// Updating current post data whenever it changes
	// Need to move as much of $: vars with functions to be svelte actions
	// Stop repeating yourself
	// Reactive Declarations & Statements //
	$: toggleUpdateCodeWithPost.set(attachCode);
	$: page = $currentPostPage;
	$: post = $currentPost;
	$: html = $htmlStore;
	$: css = $cssStore;
	$: js = $jsStore;
	$: showCaptureThumbnail.set(editing);
	$: dateCreated = new Date(createdAt);
	$: daysPassed = new Date().getTime() - dateCreated.getTime();
	$: totalDays = Math.floor(daysPassed / (1000 * 3600 * 24));
	$: windowWidth = $clientWidth;
	$: srcdoc = { html, css, js };
	$: {
		codeToSave.set([$htmlStore, $cssStore, $jsStore]);
	}
	$: {
		page = $currentPostPage;
	}
	$: if ($codeToSave && $codeToSave != {} && $changingPage === false) {
		if (post?.pages && $currentPost?.pages) {
			$currentPost?.pages[$currentPost?.currentPageID - 1]?.setCode(
				$codeToSave[0]?.type,
				$codeToSave[0]?.source
			);
			$currentPost?.pages[$currentPost?.currentPageID - 1]?.setCode(
				$codeToSave[1]?.type,
				$codeToSave[1]?.source
			);
			$currentPost?.pages[$currentPost?.currentPageID - 1]?.setCode(
				$codeToSave[2]?.type,
				$codeToSave[2]?.source
			);

			let newPost = $currentPost.pages[$currentPost.currentPageID - 1];

			currentPostPage.set(newPost);
		}
	}
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
	// THE BELOW CRASHES EVERYTHING WHEN NAVIGATING AWAY FROM THE PAGE
	$: $currentPostPage && $currentPost, updateCurrentPageId();
	$: if (currentPostBlurb && currentPostBlurb.length >= 260) {
		let characters = currentPostBlurb.split('');
		characters.pop();
		currentPostBlurb = [...characters].join('');
	}
	$: if (currentPostTitle && currentPostTitle.length >= 100) {
		let characters = currentPostTitle.split('');
		characters.pop();
		currentPostTitle = [...characters].join('');
	}
	// Post Control Functions
	const updateCurrentPageId = () => {
		if ($lockPageStore === false) {
			let currentPageID =
				$currentPostPage && $currentPostPage !== {}
					? $currentPostPage.id
					: $currentPost
					? $currentPost.currentPageID
					: 0;
			if ($currentPost) {
				$currentPost.currentPageID = currentPageID;
			}
		}
	};
	onMount(() => {
		showCreationModal.set(false);
		if (!post) {
			post = new Post('TITLE', 'BLURB');
			post.addPage('test');
			currentPost.set(post);
			currentPostPage.set($currentPost.pages[0]);
		}
		isPostStore.set(true);
		if ($currentPostPage) {
			htmlStore.set($currentPostPage?.html);
			cssStore.set($currentPostPage?.css);
			jsStore.set($currentPostPage?.js);
		}
	});
	const createPost = async () => {
		const url = '../../api/post/createNewPost.json';
		let title = currentPostTitle;
		let text = currentPostBlurb;
		let photo = $thumbnailStore ?? null;

		try {
			const response = await postUtil(url, {
				title,
				text,
				photo,
				selectedTag
			});

			if (response.status !== 200) return;
			let res = await response.json();
			createProjects(res.data.id);
		} catch (error) {
			console.log(error);
		}
	};
	const saveCodeEditor = () => {
		if ($toggleUpdateCodeWithPost) {
			let postOBJ = new Post($currentPost?.postTitle, $currentPost?.postBlurb);
			postOBJ.authorID = $currentPost?.authorID;
			postOBJ.id = $currentPost?.id;
			let currentPID;

			for (let i = 0; i < $currentPost?.pages.length; i++) {
				postOBJ.pages[i] = $currentPost?.pages[i];
				if (postOBJ?.pages[i]?.['id'] == $currentPostPage?.id) {
					currentPID = i;
					// @ts-ignore
					postOBJ.pages[i].html.source = $htmlStore?.source;
					// @ts-ignore
					postOBJ.pages[i].css.source = $cssStore?.source;
					// @ts-ignore
					postOBJ.pages[i].js.source = $jsStore?.source;
				}
			}

			if (postOBJ) {
				currentPost.set(postOBJ);
				currentPostPage.set($currentPost.pages[currentPID]);
			}
		} else if ($isCreationStore) {
			let postOBJ = new Post($currentPost.postTitle, $currentPost.postBlurb);
			postOBJ.id = $currentPost.id;

			postOBJ.pages[0] = JSON.parse(JSON.stringify($currentPost.pages[0]));

			// @ts-ignore
			postOBJ.pages[0].html.source = $htmlStore.source;
			// @ts-ignore
			postOBJ.pages[0].css.source = $cssStore.source;
			// @ts-ignore
			postOBJ.pages[0].js.source = $jsStore.source;

			if (postOBJ) {
				currentPost.set(postOBJ);
				currentPostPage.set($currentPost.pages[0]);
			}
		}
	};
	const createProjects = async (PID) => {
		const url = '../../api/project/createNewProject.json';

		let pageData = $currentPost.pages.map((page) => {
			let updatedPage = { ...page };
			updatedPage.text = page.description;
			delete updatedPage.description;
			return updatedPage;
		});

		try {
			const response = await postUtil(url, {
				pageData,
				PID
			});

			if (response.status !== 200) return;
			lockPageStore.set(true);
			changingPage.set(true);
			goto('/');
		} catch (error) {
			console.log(error);
		}
	};
	const savePage = () => {
		tick();
		$currentPost.pages[$currentPost.currentPageID - 1].setTitle(page.title);
		$currentPost.pages[$currentPost.currentPageID - 1].setText(page.description);
		currentPost.set($currentPost);
		currentPostPage.set($currentPost.pages[$currentPost.currentPageID - 1]);
		currentPost.set($currentPost);
	};
	const newPage = () => {
		$currentPost?.addPage('text');
		// currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
		// triggerReset.set(true);
	};
	const deletePage = () => {
		tick();
		$currentPost.removePage($currentPost.currentPageID);
		currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
		triggerReset.set(true);
	};
	// const updatePost = async () => {
	// 	const pid = $currentPost.id;
	// 	const url = `../../api/post/updatePost/${pid}.json`;
	// 	let title = currentPostTitle;
	// 	let text = currentPostBlurb;
	// 	let photo = $thumbnailStore;
	// 	let data = {
	// 		title,
	// 		text,
	// 		photo,
	// 		tag: selectedTag ? [selectedTag.text] : []
	// 	};

	// 	try {
	// 		const response = await putUtil(url, data);

	// 		if (response.status !== 200) return;
	// 		let res = await response.json();
	// 		updateProjects(res.data.id);
	// 	} catch (error) {
	// 		console.log(error);
	// 	}
	// };
	// const updateProjects = async (pid) => {
	// 	const url = '../../api/project/updateProjectBatch.json';

	// 	let pageData = $currentPost.pages.map((page) => {
	// 		let updatedPage = { ...page };
	// 		updatedPage.text = page.description;
	// 		delete updatedPage.description;
	// 		return updatedPage;
	// 	});

	// 	let data = {
	// 		pageData,
	// 		pid
	// 	};

	// 	// try {
	// 	const response = await putUtil(url, data);

	// 	if (response.status !== 200) return;

	// 	editing = false;

	// 	// fetchUpdatedData(pid);
	// 	// goto("/");
	// 	// } catch (error) {
	// 	//     console.log(error);
	// 	// }
	// };
	// const fetchUpdatedData = async (pid) => {
	// 	const postURL = `/api/post/getSinglePost/${pid}.json`;
	// 	const projectURL = `/api/project/getAllProjectsForPost/${pid}.json`;
	// 	const res = await fetch(postURL, {
	// 		method: 'GET'
	// 	});
	// 	const posts = await res.json();
	// 	if (posts) {
	// 		const res = await fetch(projectURL, {
	// 			method: 'GET'
	// 		});

	// 		const projects = await res.json();

	// 		let projectPages = projects.data;

	// 		let postOBJ = {
	// 			id: posts.data.id,
	// 			authorID: posts.data.user,
	// 			postTitle: posts.data.title,
	// 			postBlurb: posts.data.text,
	// 			pages: pageArrBuilder(projectPages)
	// 		};

	// 		currentPost.set(postOBJ);
	// 		currentPostPage.set(postOBJ.pages[0]);
	// 	}
	// };
	// const pageArrBuilder = (data) => {
	// 	let mappedData = data.map((x, i) => {
	// 		let components;
	// 		const rBody = x.replBody;
	// 		if (
	// 			typeof rBody != 'undefined' &&
	// 			rBody.hasOwnProperty('files') &&
	// 			typeof rBody.files != 'undefined'
	// 		) {
	// 			components = replBuilder(rBody);
	// 		}
	// 		let id = x.id;
	// 		let pid = x.post;

	// 		let files = replCodeMapper(components);
	// 		let { html, css, js } = files;

	// 		return {
	// 			id,
	// 			pid,
	// 			pageTitle: x.title,
	// 			text: x.text ? x.text : x.description,
	// 			html,
	// 			css,
	// 			js
	// 		};
	// 	});
	// 	return mappedData;
	// };
	// Helper Funcs
	// const replBuilder = (replBody) => {
	// 	let components = Object.keys(replBody.files).map((key) => {
	// 		const n = replBody.files[key].name;
	// 		const joinerIndex = n.indexOf('.');
	// 		const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
	// 		const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
	// 		const s = replBody.files[key].source;
	// 		const source = s.replace(/&lt;/gi, '<') || '';
	// 		return {
	// 			type,
	// 			name,
	// 			source
	// 		};
	// 	});
	// 	return components;
	// };
	// const replCodeMapper = (components) => {
	// 	let html;
	// 	let css;
	// 	let js;

	// 	components.forEach((x) => {
	// 		if (x.type === 'html') {
	// 			html = {
	// 				source: x.source,
	// 				type: 'html'
	// 			};
	// 		}
	// 		if (x.type === 'css') {
	// 			css = {
	// 				source: x.source,
	// 				type: 'css'
	// 			};
	// 		}
	// 		if (x.type === 'typescript') {
	// 			js = {
	// 				source: x.source,
	// 				type: 'typescript'
	// 			};
	// 		}
	// 	});

	// 	return { html, css, js };
	// };
</script>

<svelte:window
	bind:innerWidth={windowWidth}
	on:keyup={(e) => {
		// could add a bool to toggle this 'autosaving' functionality
		// and allow the user to set update its value via editor settings.
		saveCodeEditor();
	}}
/>
<div id="page-container" class:showLoader bind:clientWidth={pageContainerWidth}>
	{#if windowWidth && windowWidth > 900}
		<div class:showLoader bind:this={splitPaneContainer} class="split-container">
			<SplitPane panes={['#split-0', '#split-1']} sizes={[30, 70]}>
				<section id="split-0">
					<div class="post-contentContainer" style="--contentWidth: calc({contentWidth}px - 2rem);">
						<div class="post-content" bind:clientWidth={contentWidth}>
							<label for="">
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
									<label for="page-text">
										<span>Post Title</span>
									</label>
									<input
										type="text"
										bind:value={currentPostTitle}
										name="title"
										placeholder="Add post title..."
									/>
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
									<label>
										<select bind:value={selectedTag}>
											{#each tags as tag}
												<option value={tag}>{tag.text}</option>
											{/each}
										</select>
									</label>
								</div>
							{/if}
							<hr class:showPostDetails />
							<label for="page-title">
								<span>Page Title</span>
								{#if page}
									<input type="text" bind:value={page.title} name="page-title" />
								{/if}
							</label>
							<br />
							<label for="page-text">
								<span>Page Body</span>
							</label>
							<div class="grow-wrap" bind:this={textAreaGrowContainer}>
								{#if page}
									<textarea
										name="page-text"
										placeholder="Page body..."
										bind:value={page.description}
										on:input={() => {
											textAreaGrowContainer.dataset.replicatedValue = page.description;
										}}
									/>
								{/if}
							</div>
							<div class="post-control-bar">
								<div class="format-controls">
									<div class="control insert">+</div>
								</div>
								<Button name={'Add Page'} cssClass="blue" onClickFunc={newPage} />
								<Button name={'Save Page'} cssClass="blue" onClickFunc={savePage} />
								<Button name={'Delete Page'} cssClass="blue" onClickFunc={deletePage} />
								<div class="controls">
									<!-- <button on:click={createPost}>Post</button> -->

									<Button name={'Post'} cssClass="blue" onClickFunc={createPost} />
								</div>
							</div>
						</div>
					</div>
				</section>
				<section id="split-1" style="z-index: 1000000000;">
					<SplitPane panes={['#split-2', '#split-3']} vertical={value}>
						<section id="split-2">
							<SplitPane panes={['#split-html', '#split-css', '#split-js']} vertical={!value}>
								<section id="split-html" class="section-panel" style="overflow-x: visible;">
									{#if html}
										<Editor code={html} />
									{/if}
								</section>
								<section id="split-css" class="section-panel" style="overflow-x: visible;">
									<Editor code={css} />
								</section>
								<section id="split-js" class="section-panel" style="overflow-x: visible;">
									<Editor code={js} />
								</section>
							</SplitPane>
						</section>
						<section id="split-3">
							<SplitPane
								panes={['#split-output', '#split-console']}
								vertical={!value}
								sizes={[100, 0]}
							>
								<section id="split-output" class="section-panel">
									<Output {srcdoc} />
								</section>
								<section id="split-console" class="section-panel">
									<Console {logs} />
								</section>
							</SplitPane>
						</section>
					</SplitPane>
				</section>
			</SplitPane>
		</div>
	{/if}
</div>

<style lang="scss">
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
	:global(#split-0) {
		overflow-y: hidden !important;
		padding-left: 0 !important;
	}
	.post-control-bar {
		padding: 6px;
		border-radius: 6px;
		height: 36px;
		background-color: #ffffff;
		font-size: 16px;
		box-shadow: 0 1px 6px 0px #bebebe40;
		display: flex;
		justify-content: space-between;
		min-height: 36px;

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

		.controls {
			// display:
			:global(button.blue) {
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
		}
	}

	hr {
		width: 100%;
		height: 10px;
		min-height: 10px;
		background-color: var(--mainThemeBackgroundColor);
		border-style: none;
		border-radius: 3px;
		margin: 2rem 0;
		margin-top: 0;
		transition: all 0.2s ease;
	}
	hr.showPostDetails {
		margin-top: 2rem;
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
			color: #525058;
			font-weight: 500;
			padding-bottom: 3px;
		}
	}
	input {
		color: #525058;
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

	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
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
	// #nav-container {
	// 	grid-area: nav;
	// 	margin: 0;
	// 	padding: 0 10px;
	// }
	#page-container {
		grid-area: page;
		margin: 0 10px 10px 10px;
		max-width: calc(100vw - 20px);
	}
	:global(.monaco-editor, .overflow-guard) {
		border-radius: 6px !important;
	}
	.section-panel {
		border-radius: 6px;
		background-color: var(--mainThemePanelColor);
	}
	#split-0 {
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		padding-left: 15px;
	}
	// .sticky-toggle {
	// 	margin-block-start: 0;
	// 	display: grid;
	// 	grid-template-columns: 1fr repeat(4, auto);
	// 	grid-gap: 10px;
	// 	align-items: center;
	// 	height: 100%;
	// 	width: 100%;
	// }
	// .menu-toggle {
	// 	position: relative;
	// 	left: 0px;
	// 	width: 48px;
	// 	height: 48px;
	// 	background-color: var(--mainThemePanelColor);
	// 	border-radius: 6px;
	// 	transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
	// 	display: flex;
	// 	justify-content: center;
	// 	align-items: center;
	// 	&:hover {
	// 		cursor: pointer;
	// 	}
	// 	span {
	// 		position: relative;
	// 		right: 9px;
	// 		height: 100%;
	// 		width: 2px;
	// 		background-color: #525058;
	// 	}
	// }
	// .menu-toggle.select {
	// 	width: 100%;
	// 	min-width: 250px;
	// 	height: 48px;
	// }
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
	// .left-panel-container {
	// 	display: flex;
	// 	flex-direction: column;
	// 	justify-content: flex-start;
	// 	grid-gap: 10px;
	// 	height: 100%;
	// }
	// .left-panel-container.authPage {
	// 	margin-top: 58px !important;
	// 	height: calc(100% - 58px);
	// }
	// .panel-container {
	// 	width: 100%;
	// 	background-color: var(--mainThemePanelColor);
	// 	border-radius: 6px;
	// 	padding-bottom: 10px;
	// 	flex-grow: 1;
	// }
	// .panel-container.bottom {
	// 	padding: 10px 0 10px 0;
	// 	flex-grow: unset;
	// }
	// .form-top {
	// 	width: calc(100% - 20px);
	// 	margin: auto;
	// 	display: flex;
	// 	justify-content: space-between;

	// 	h2 {
	// 		font-family: 'Inter', sans-serif;
	// 		font-size: 18px;
	// 		color: #c21997;
	// 		-webkit-touch-callout: none; /* iOS Safari */
	// 		-webkit-user-select: none; /* Safari */
	// 		-khtml-user-select: none; /* Konqueror HTML */
	// 		-moz-user-select: none; /* Old versions of Firefox */
	// 		-ms-user-select: none; /* Internet Explorer/Edge */
	// 		user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
	// 	}
	// }
	// .filter-options {
	// 	width: calc(100% - 20px);
	// 	margin: auto;
	// 	height: 100%;
	// }
	// .filter-options .filter-options-center {
	// 	display: flex;
	// 	justify-content: flex-start;
	// 	flex-flow: row wrap;
	// 	grid-gap: 10px;
	// 	background-color: var(--mainThemeBackgroundColor);
	// 	border-radius: 6px;
	// 	width: calc(100% - 20px);
	// 	margin: auto;
	// 	padding: 10px;
	// 	list-style: none;

	// 	li {
	// 		padding: 10px;
	// 		width: fit-content;
	// 		font-size: 14px;
	// 		a {
	// 			transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
	// 			&:hover {
	// 				color: #6e6c7383;
	// 			}
	// 		}
	// 	}
	// }
	// footer .filter-options .filter-options-center {
	// 	background-color: unset;
	// 	padding: 0;
	// }
	// .filter-options label {
	// 	padding: 10px;
	// 	width: fit-content;
	// 	font-size: 14px;
	// 	transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
	// 	&:hover {
	// 		cursor: pointer;
	// 		background-color: #f3f3f3;
	// 		border-radius: 6px;
	// 	}
	// 	&.checked {
	// 		background-color: #4ca5ff;
	// 		color: #ffffff;
	// 	}
	// }
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
	// span.filter-label {
	// 	width: calc(100% - 20px);
	// 	margin: auto;
	// 	display: flex;
	// 	justify-content: flex-start;
	// 	-webkit-touch-callout: none; /* iOS Safari */
	// 	-webkit-user-select: none; /* Safari */
	// 	-khtml-user-select: none; /* Konqueror HTML */
	// 	-moz-user-select: none; /* Old versions of Firefox */
	// 	-ms-user-select: none; /* Internet Explorer/Edge */
	// 	user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
	// 	h2 {
	// 		font-family: 'Inter', sans-serif;
	// 		font-size: 14px;
	// 		color: #6e6c73;
	// 		margin-block-end: 0.43em;
	// 	}
	// }
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
	// .left.authPage {
	// 	grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
	// }
	// .creation-modal-container {
	// 	display: flex;
	// 	flex-direction: column;
	// }
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

		// #split-0.noScroll {
		// 	overflow-y: hidden;
		// }

		:global(.post-content) {
			min-width: unset !important;
		}
		:global(.content-container .center-panel div.left) {
			width: calc(100%) !important;
		}
		// main {
		// 	display: grid;
		// 	width: 100%;
		// 	height: 100%;
		// 	overflow-y: hidden;
		// 	overflow-x: hidden;
		// 	grid-template-rows: calc(100vh - 68px) 68px;
		// 	grid-template-columns: 1fr;
		// 	grid-template-areas:
		// 		'page'
		// 		'nav';
		// }
		#page-container {
			margin: 10px 10px 0 10px;
			border-radius: 6px;
			overflow: hidden;
			// -webkit-mask-image: -webkit-radial-gradient(white, black);
		}
		// .center-panel.s-9tIzRZLJ0Lek {
		// 	height: calc(100vh - 78px);
		// 	border-radius: 6px;
		// 	overflow: hidden;
		// 	-webkit-mask-image: -webkit-radial-gradient(white, black);
		// }

		// .editor-opts {
		// 	position: absolute;
		// 	z-index: 10;
		// 	bottom: 0;
		// 	width: calc(100% - 20px);
		// 	display: flex;
		// 	justify-content: center;

		// 	.sub-menu {
		// 		display: flex;
		// 		width: 150px;
		// 		border-radius: 6px;
		// 		height: 100%;
		// 		justify-content: space-between;
		// 		align-items: center;
		// 		list-style-type: none;
		// 		list-style: none;
		// 		background-color: #b4b4b454;
		// 		-webkit-backdrop-filter: saturate(180%) blur(16px);
		// 		backdrop-filter: saturate(180%) blur(16px);
		// 		margin-block-start: 0;
		// 		padding-inline-start: 0;
		// 		padding: 10px;

		// 		li {
		// 			z-index: 1000000000000;
		// 			font-weight: 600;
		// 			color: var(--mainThemeFadedTextColor);
		// 		}
		// 		li.active,
		// 		.htmlActive,
		// 		.cssActive,
		// 		.jsActive {
		// 			color: var(--mainThemePrimaryTextColor);
		// 		}
		// 	}
		// }
		:global(.auth-top-container .auth-top-container-inner) {
			width: 100%;
		}
		// :global(.background-container) {
		// 	.flex {
		// 		flex-direction: column;
		// 	}

		// 	h1 {
		// 		font-size: 25px;
		// 	}
		// }

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

		// :global(#page-container.authNavOpen) {
		// 	// visibility: hidden;
		// }

		#split-0 {
			overflow: hidden !important;
			border-radius: 6px;
			// height: 150px !important;
		}
	}

	// .logo-text {
	// 	position: absolute;
	// 	top: 0;
	// 	left: 20px;
	// 	z-index: 1;
	// 	font-family: 'Outfit', sans-serif;
	// 	color: #ffffff;
	// 	padding: 10px;
	// 	padding-top: 5px;
	// 	font-weight: 500;
	// 	background: linear-gradient(-60deg, #c21997 0%, #7719c2 100%) !important;
	// 	font-size: 1.8em;
	// 	border-radius: 6px;
	// 	transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
	// 	box-shadow: 0px 0px 0px 0px #41414125;
	// 	line-height: 0.9em;
	// }

	// .flex {
	// 	display: flex;
	// 	justify-content: center;
	// 	align-items: center;
	// 	position: relative;
	// 	height: 100%;
	// }
	// .wavesBG {
	// 	position: absolute;
	// 	bottom: 0;
	// 	height: 58vh;
	// 	width: 100%;
	// }

	// .waves {
	// 	position: relative;
	// 	width: 100%;
	// 	height: 15vh;
	// 	margin-bottom: -7px;
	// 	min-height: 100px;
	// 	max-height: 150px;
	// }

	// .content {
	// 	position: relative;
	// 	height: 28vh;
	// 	text-align: center;
	// 	background-color: transparent;

	// 	&.flex {
	// 		display: grid;
	// 		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	// 		width: 80%;
	// 		grid-gap: 10rem;
	// 		margin: 0 auto 4rem auto;
	// 		height: fit-content;
	// 		height: -moz-fit-content;
	// 		align-items: flex-start;

	// 		.features {
	// 			display: flex;
	// 			flex-direction: column;

	// 			svg {
	// 				width: 100px;
	// 				position: relative;
	// 			}

	// 			h2 {
	// 				font-family: 'Inter', sans-serif;
	// 				color: var(--mainThemePrimaryTextColor);
	// 				text-align: left;
	// 				margin-block-end: 0.5em;
	// 				font-size: 30px;
	// 			}
	// 		}
	// 	}
	// }

	// .filler {
	// 	background-color: var(--mainThemeBackgroundColor);
	// 	height: inherit;
	// 	border-radius: 0 0 6px 6px;
	// }

	// i => value to replace
	// calc(i * var(--speed-multiplyer))
	// calc(20 * var(--speed-multiplyer))
	// .parallax > use {
	// 	animation: move-forever cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
	// }
	// .parallax > use:nth-child(1) {
	// 	animation-delay: calc(-2s);
	// 	animation-duration: calc(7 * var(--speed-multiplyer));
	// }
	// .parallax > use:nth-child(2) {
	// 	animation-delay: calc(-3s);
	// 	animation-duration: calc(10 * var(--speed-multiplyer));
	// }
	// .parallax > use:nth-child(3) {
	// 	animation-delay: calc(-4s);
	// 	animation-duration: calc(13 * var(--speed-multiplyer));
	// }
	// .parallax > use:nth-child(4) {
	// 	animation-delay: calc(-5s);
	// 	animation-duration: calc(20 * var(--speed-multiplyer));
	// }
	// @keyframes move-forever {
	// 	0% {
	// 		transform: translate3d(85px, 0, 0);
	// 	}
	// 	100% {
	// 		transform: translate3d(-90px, 0, 0);
	// 	}
	// }
	// .wavesBG {
	// 	height: 87%;
	// }

	// .auth-container {
	// 	width: 100%;
	// 	height: 97%;
	// 	background: linear-gradient(-60deg, #c21997 0%, #4f19c2 100%) !important;
	// }
	// .auth-form.modal-auth {
	// 	position: absolute;
	// 	bottom: 0;
	// 	width: 100%;
	// 	height: 64%;
	// 	border-bottom-left-radius: 6px;
	// 	border-bottom-right-radius: 6px;
	// 	-webkit-border-bottom-right-radius: 6px;
	// 	-webkit-border-bottom-left-radius: 6px;

	// 	:global(form) {
	// 		position: absolute;
	// 		width: calc(100% - 20px);
	// 		bottom: 0;
	// 		padding: 0px 10px 10px 10px;
	// 		height: 93%;
	// 	}

	// 	:global(form > div) {
	// 		height: 100%;
	// 	}

	// 	.form-split {
	// 		backdrop-filter: unset !important;
	// 		width: calc(100% - 40px);
	// 		min-height: 340px;
	// 		height: 100% !important;
	// 		border-radius: 6px;
	// 		display: flex;
	// 		justify-content: center;
	// 		overflow: hidden;
	// 		background-color: var(--mainThemeModalFormBlur);
	// 		padding: 0 10px 10px 10px;
	// 		-webkit-backdrop-filter: saturate(180%) blur(20px);
	// 		backdrop-filter: saturate(180%) blur(20px);
	// 		margin: auto;
	// 		margin-bottom: 10px;
	// 	}
	// }

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

	// :global(.modal-auth) {
	// 	form {
	// 		div {
	// 			height: 100%;
	// 		}
	// 	}
	// }

	:global(.auth-form.modal-auth) {
		background-color: var(--mainThemeBackgroundColor);
	}

	:global(.auth-form.modal-auth.isSignUp form) {
		height: 120% !important;
	}

	// :global(.modal-auth) {
	// 	position: absolute;
	// 	bottom: 0;
	// 	width: calc(100%);
	// 	height: 61%;

	// 	border-bottom-left-radius: 6px;
	// 	border-bottom-right-radius: 6px;
	// 	-webkit-border-bottom-right-radius: 6px;
	// 	-webkit-border-bottom-left-radius: 6px;

	// 	form {
	// 		position: absolute;
	// 		width: 100%;
	// 		bottom: 0;
	// 		height: 93% !important;

	// 		.form-split {
	// 			width: 100%;
	// 			min-height: 350px;
	// 			height: 100%;
	// 			border-radius: 6px;
	// 			display: flex;
	// 			justify-content: center;
	// 			overflow: hidden;
	// 			background-color: var(--mainThemeModalFormBlur);
	// 			-webkit-backdrop-filter: saturate(180%) blur(20px);
	// 			backdrop-filter: saturate(180%) blur(20px);
	// 		}
	// 	}
	// }

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
	// .spinner-container {
	// 	position: absolute;
	// 	width: 100%;
	// 	height: 100%;
	// 	display: flex;
	// 	justify-content: center;
	// 	align-items: center;
	// }

	// #loading {
	// 	display: inline-block;
	// 	width: 50px;
	// 	height: 50px;
	// 	border: 3px solid var(--mainThemeFadedTextColor);
	// 	border-radius: 50%;
	// 	border-top-color: var(--mainThemePrimaryTextColor);
	// 	animation: spin 1s ease-in-out infinite;
	// 	-webkit-animation: spin 1s ease-in-out infinite;
	// }

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

	// .logo-text-nav {
	// 	z-index: 1;
	// 	font-family: 'Inter', sans-serif;
	// 	color: var(--mainThemePrimaryTextColor);
	// 	padding: 10px 0;
	// 	padding-top: 8px;
	// 	font-weight: 400;
	// 	border-radius: 6px;
	// 	transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
	// 	box-shadow: 0px 0px 0px 0px #41414125;
	// 	line-height: 0.9em;
	// 	justify-self: left;
	// 	width: fit-content;
	// }
	// .image-nav {
	// 	// background-color: blue;
	// 	padding: 5px 0 0 0;
	// 	width: 50px;
	// 	height: 50px;
	// 	& > :global(div.image-slot) {
	// 		height: 100%;
	// 		width: 100%;
	// 		:global(.image-container) {
	// 			// background-color: red;
	// 			width: 100%;
	// 			height: 100%;
	// 			border-radius: 6px;
	// 			background-image: var(--profilePic);
	// 			background-repeat: no-repeat;
	// 			background-size: contain;
	// 		}
	// 	}
	// }
	// .nav-id-header {
	// 	display: flex;
	// 	column-gap: 1rem;
	// 	flex-direction: row;
	// 	justify-content: space-between;
	// 	margin: 0 0 3rem 0;

	// 	.logo-text-nav {
	// 		margin-block-start: 0;
	// 		margin-block-end: 0;
	// 	}
	// }

	// user image stuff

	// .user-info-modal {
	// 	padding: 1rem;
	// 	height: 100%;
	// 	display: flex;
	// 	flex-direction: column;

	// 	.post-details {
	// 		flex-grow: 1;

	// 		textarea {
	// 			width: 100%;
	// 			height: calc(100% - 3rem);
	// 			box-sizing: border-box;
	// 			border: 2px solid var(--textareaBorder);
	// 			padding: 0.5rem;
	// 			font: inherit;
	// 			background-color: var(--mainThemePanelAreaColor);
	// 			border-radius: 6px;
	// 			resize: none;
	// 		}
	// 	}

	// 	:global(.image-container) {
	// 		// background-color: red;
	// 		height: 100%;
	// 		border-radius: 6px;
	// 		background-image: var(--profilePic);
	// 		background-repeat: no-repeat;
	// 		background-size: cover;
	// 		transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);

	// 		&:hover {
	// 			cursor: pointer;
	// 			filter: brightness(0.5);
	// 		}
	// 	}
	// }
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
	// svg.menu-icons-svg path,
	// svg.menu-icons-svg circle,
	// svg.menu-icons-svg line,
	// svg.menu-icons-svg polyline {
	// 	stroke: var(--mainThemePrimaryTextColor) !important;
	// }

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
	.post-contentContainer {
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		color-scheme: var(--colorScheme);
		overflow-x: hidden;
		border-radius: 6px;
	}
	// @media screen and (max-width: 900) {
	// 	button {
	// 		height: 40px !important;
	// 	}
	// }
</style>
