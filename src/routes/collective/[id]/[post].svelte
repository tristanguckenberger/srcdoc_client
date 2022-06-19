<script context="module">
	import {
		isPostStore,
		currentPostPage,
		currentPost,
		currentPostPageId,
		postAuthor
	} from '$lib/stores/postStore';

	export async function load({ params, fetch }) {
		isPostStore.set(true);

		const collectiveSlug = params.id;
		const postSlug = params.post;
		if (postSlug !== '1') {
			const postURL = `/api/post/getSinglePost/${postSlug}.json`;
			const projectURL = `/api/project/getAllProjectsForPost/${postSlug}.json`;

			const res = await fetch(postURL, {
				method: 'GET'
			});

			const posts = await res.json();

			if (posts) {
				const res = await fetch(projectURL, {
					method: 'GET'
				});

				let projects = await res.json();
				projects.data = projects.data.filter((x) => !x.hasOwnProperty('comment'));

				let postOBJ = {
					id: posts.data.id,
					authorID: posts.data.user,
					postTitle: posts.data.title,
					postBlurb: posts.data.text,
					pages: []
				};

				const createdAt = posts?.data?.createdAt;

				const userURL = `/api/user/getSingle/${posts.data.user}.json`;
				const userRes = await fetch(userURL, {
					method: 'GET'
				});

				let user = await userRes.json();

				if (user && user.data) postAuthor.set(user.data);
				// console.log(user);

				// let data = proj
				// for (let iterator = 0; iterator < projects.data)

				// Build postOBJ pages in desired form
				postOBJ.pages = projects.data.map((x, i) => {
					let components;
					const rBody = x.replBody;
					if (
						typeof rBody != 'undefined' &&
						rBody.hasOwnProperty('files') &&
						typeof rBody.files != 'undefined'
					) {
						components = Object.keys(rBody.files).map((key) => {
							const n = rBody.files[key].name;
							const joinerIndex = n.indexOf('.');
							const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
							const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
							const s = rBody.files[key].source;
							const source = s.replace(/&lt;/gi, '<') || '';
							return {
								type,
								name,
								source
							};
						});
					}

					let html;
					let css;
					let js;
					let id = x.id;
					let pid = x.post;

					components.forEach((x) => {
						if (x.type === 'html') {
							html = {
								source: x.source,
								type: 'html'
							};
						}
						if (x.type === 'css') {
							css = {
								source: x.source,
								type: 'css'
							};
						}
						if (x.type === 'typescript') {
							js = {
								source: x.source,
								type: 'typescript'
							};
						}
					});

					return {
						id,
						pid,
						pageTitle: x.title,
						description: projects.count > 1 ? x.description : posts.data.text,
						html,
						css,
						js
					};
				});

				initialPostData.set(postOBJ);
				currentPost.set(postOBJ);
				currentPostPage.set(postOBJ.pages[0]);

				const commentURL = `../../api/comment/getComments/${postSlug}.json`;

				const result = await fetch(commentURL, {
					method: 'GET'
				});
				let commentRes = await result.json();
				// console.log(commentRes);
				let postComments = commentRes && commentRes.length ? [...commentRes] : [];
				// console.log(posts);
				return {
					props: {
						authorID: posts.data.user,
						posts,
						projects: postOBJ,
						postOBJ,
						postComments,
						createdAt
					}
				};
			}
		}

		const post = {
			postTitle: 'Post 1',
			postBlurb: 'This is dummy data',
			pages: [
				{
					id: 1,
					title: 'Introduction',
					description: 'This is some text',
					html: {
						source: `<div class="howdy">Howdy</div>`,
						type: 'html'
					},
					css: {
						source: `.howdy { color: red; }`,
						type: 'css'
					},
					js: {
						source: `let five = 5; console.log(5+five);`,
						type: 'typescript'
					}
				},
				{
					id: 2,
					title: 'How to do X',
					description: 'This is more text',
					html: {
						source: `<div class="howdy">Howdy from page 2</div>`,
						type: 'html'
					},
					css: {
						source: `.howdy { color: blue; }`,
						type: 'css'
					},
					js: {
						source: `let five = 5; console.log(8+five);`,
						type: 'typescript'
					}
				}
			]
		};

		currentPost.set(post);
		currentPostPage.set(post.pages[0]);

		return {
			props: {
				post
			}
		};
	}
</script>

<script>
	// Svelte Stuff
	import { onMount, tick } from 'svelte';
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
	import {
		htmlStore,
		cssStore,
		jsStore,
		triggerReset,
		toggleUpdateCodeWithPost,
		initialPostData,
		showCaptureThumbnail
	} from '$lib/stores/codeStore.js';
	import { thumbnailStore } from '$lib/stores/postStore';

	// Props
	export let posts;
	export let projects;
	export let postOBJ;
	export let authorID;
	export let createdAt;
	let postComments;

	// Initial Declarations
	let currentPostTitle = $currentPost.postTitle;
	let currentPostBlurb = $currentPost.postBlurb;
	let textAreaGrowContainer;
	let commentsOBJ;
	let mods;
	let showPostDetails = false;
	let showCodeDetails = false;
	let attachCode = false;
	let selectedTag;
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
	$: page = $currentPostPage;

	// Life Cycle Methods
	onMount(() => {
		isPostStore.set(true);
		if ($currentPostPage) {
			htmlStore.set($currentPostPage.html);
			cssStore.set($currentPostPage.css);
			jsStore.set($currentPostPage.js);
		}

		if ($currentPostPage && $currentPostPage.id) currentPostPageId.set($currentPostPage.id);
		if (!postComments && getCommentsSwitch) fetchComments();
	});
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
		fetchCount++;
		// console.log(`${fetchCount}____________fetchComments`);
		const url = `../../api/comment/getComments/${$currentPost.id}.json`;
		const result = await fetch(url, {
			method: 'GET'
		});
		let res = await result.json();
		if (res.length > 0) {
			postComments = [...res];
			if (postComments) {
				getCommentsSwitch = false;
			}
		}
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

		// try {
		const response = await putUtil(url, data);

		if (response.status !== 200) return;

		editing = false;

		// fetchUpdatedData(pid);
		// goto("/");
		// } catch (error) {
		//     console.log(error);
		// }
	};
	const fetchUpdatedData = async (pid) => {
		const postURL = `/api/post/getSinglePost/${pid}.json`;
		const projectURL = `/api/project/getAllProjectsForPost/${pid}.json`;
		const res = await fetch(postURL, {
			method: 'GET'
		});
		const posts = await res.json();
		if (posts) {
			const res = await fetch(projectURL, {
				method: 'GET'
			});

			const projects = await res.json();

			let projectPages = projects.data;

			let postOBJ = {
				id: posts.data.id,
				authorID: posts.data.user,
				postTitle: posts.data.title,
				postBlurb: posts.data.text,
				pages: pageArrBuilder(projectPages)
			};

			currentPost.set(postOBJ);
			currentPostPage.set(postOBJ.pages[0]);
		}
	};
	const pageArrBuilder = (data) => {
		let mappedData = data.map((x, i) => {
			let components;
			const rBody = x.replBody;
			if (
				typeof rBody != 'undefined' &&
				rBody.hasOwnProperty('files') &&
				typeof rBody.files != 'undefined'
			) {
				components = replBuilder(rBody);
			}
			let id = x.id;
			let pid = x.post;

			let files = replCodeMapper(components);
			let { html, css, js } = files;

			return {
				id,
				pid,
				pageTitle: x.title,
				text: x.text ? x.text : x.description,
				html,
				css,
				js
			};
		});
		return mappedData;
	};

	// Helper Funcs
	const replBuilder = (replBody) => {
		let components = Object.keys(replBody.files).map((key) => {
			const n = replBody.files[key].name;
			const joinerIndex = n.indexOf('.');
			const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
			const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
			const s = replBody.files[key].source;
			const source = s.replace(/&lt;/gi, '<') || '';
			return {
				type,
				name,
				source
			};
		});
		return components;
	};
	const replCodeMapper = (components) => {
		let html;
		let css;
		let js;

		components.forEach((x) => {
			if (x.type === 'html') {
				html = {
					source: x.source,
					type: 'html'
				};
			}
			if (x.type === 'css') {
				css = {
					source: x.source,
					type: 'css'
				};
			}
			if (x.type === 'typescript') {
				js = {
					source: x.source,
					type: 'typescript'
				};
			}
		});

		return { html, css, js };
	};
	let showCreateComment = false;
	let contentWidth;
	$: showCaptureThumbnail.set(editing);

	$: dateCreated = new Date(createdAt);

	const now = new Date();

	// let daysTimePass = now.getTime() - dateCreated.getTime();
	$: daysPassed = new Date().getTime() - dateCreated.getTime();
	$: totalDays = Math.floor(daysPassed / (1000 * 3600 * 24));
	$: shrink = contentWidth < 350;
	$: newWidth = contentWidth;
</script>

<div
	class="post-contentContainer"
	style="--contentWidth: calc({newWidth}px - 2rem);"
	bind:clientWidth={contentWidth}
>
	<div class="post-content">
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
			<div class="post-control-bar" class:shrink>
				<div class="format-controls">
					<div class="control insert">+</div>
				</div>

				<Button name={'Cancel'} cssClass="red" onClickFunc={() => (editing = false)} />
				<Button name={'Update'} cssClass="blue" onClickFunc={updatePost} />
			</div>
		{:else}
			<div class="post-top-info">
				{#if ($session && $session.id && $session.id === $currentPost.authorID) || ($session && $session.user && $session.user.id && $session.user.id === $currentPost.authorID)}
					<button on:click={() => (editing = true)}>Edit</button>
				{/if}
			</div>

			<h1>{page.pageTitle || page.title}</h1>
			{#if $postAuthor}
				<div class="author-info">
					<div class="author-img" />
					<div class="author-name">
						<span>
							{$postAuthor.username}
						</span>
						<span style="font-size: .8rem;">
							{#if totalDays && totalDays <= 7}
								posted {totalDays >= 1 ? totalDays + ' days ago' : totalDays + ' hours ago'}
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
			<div class="post-control-bar">
				<Vote itemID={$currentPost.id} isPost={true} />
				<button class="comment-button" on:click={() => (showCreateComment = true)}>Comment</button>
			</div>
		{/if}
		<hr />

		{#if postComments}
			<div class="comments" bind:this={commentsOBJ}>
				<Reply
					{mods}
					bind:postComment={postComments}
					expanded={false}
					slug={$currentPost.id}
					{fetchComments}
				/>
			</div>
		{/if}
	</div>
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
		min-width: 30px;
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

	.post-control-bar.shrink {
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
