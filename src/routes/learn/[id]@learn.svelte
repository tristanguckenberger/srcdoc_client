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
	import { initialPostData } from '$lib/stores/codeStore';

	export async function load({ params, fetch }) {
		isCreationStore.set(true);
		const postSlug = params?.id;

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
			// projects.data = projects.data.filter(x => !x.hasOwnProperty('comment'));

			let postOBJ = {
				id: posts?.data?.id,
				authorID: posts?.data?.user,
				postTitle: posts?.data?.title,
				postBlurb: posts?.data?.text,
				pages: []
			};

			// let data = proj
			// for (let iterator = 0; iterator < projects.data)

			// Build postOBJ pages in desired form
			postOBJ.pages = projects?.data.map((x, i) => {
				let components;
				const rBody = x?.replBody;
				if (
					typeof rBody != 'undefined' &&
					rBody.hasOwnProperty('files') &&
					typeof rBody?.files != 'undefined'
				) {
					components = Object.keys(rBody?.files).map((key) => {
						const n = rBody.files[key].name;
						const joinerIndex = n.indexOf('.');
						const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
						const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
						const s = rBody.files[key].source;
						const source = s?.replace(/&lt;/gi, '<') ?? '';
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

			return {};
		}
	}
</script>

<script lang="ts">
	import { clientWidth } from '$lib/stores/layoutStore';
	import SplitPane from '$lib/components/layout/SplitPane/index.svelte';
	import { fade, fly } from 'svelte/transition';
	import Editor from '$lib/components/ui/Editor/index.svelte';
	import Output from '$lib/components/ui/Output/index.svelte';
	import Console from '$lib/components/ui/Console/index.svelte';
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

	let selectedTag = $postDetailStarter.tag;
	let contentWidth;

	let currentPage;
	$: currentPage = $currentPostPage;

	$: post = $currentPost;

	$: postContainerWidth = contentWidth;

	$: $currentPostPage,
		($currentPost.currentPageID =
			$currentPostPage && $currentPostPage !== {}
				? $currentPostPage.id
				: $currentPost.currentPageID);

	onMount(() => {
		if (!post) {
			post = new Post('TITLE', 'BLURB');
			post.addPage('test');
			currentPost.set(post);
			currentPostPage.set($currentPost.pages[0]);
		}

		if ($currentPostPage) {
			// $currentPostPage.setCode("typescript", "");
			// $currentPostPage.setCode("css", "");
			// $currentPostPage.setCode("html", "");
			htmlStore.set($currentPostPage.html);
			cssStore.set($currentPostPage.css);
			jsStore.set($currentPostPage.js);
		}
		fetchComments();
	});

	beforeNavigate((nav) => {});

	onDestroy(() => {});

	$: windowWidth = $clientWidth;
	$: html = $htmlStore;
	$: css = $cssStore;
	$: js = $jsStore;
	$: srcdoc = { html, css, js };

	// Initial Declarations
	let logs: Log[] = [];
	let last_console_event;
	let pageContainerWidth = 0;
	let pages;
	let triggerDelete;
	let editorVisible = false;
	let isPost;
	let collectives;
	let value: boolean = false; //  Layout Toggle
	let showEditorSettings: boolean = false;
	let pageSelector;
	let authPageRowSizeValue = '';
	let selected;
	let filterForm;
	let leftPaneWidth = 0;
	let splitPaneContainer;
	let currentPostTitle = '';
	let currentPostBlurb = '';
	let showLoader = false;

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

	// Props
	export let posts;
	export let projects;
	export let postOBJ;
	export let authorID;
	export let createdAt;
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
	$: page = $currentPostPage;
	$: logs = $messageEvent;
	let nested;
	// $: comments = nested

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

    function sortComments(unsortedComments) {

	console.log('unsortedComments')
	console.log(unsortedComments)
		if (unsortedComments?.length > 0) {
			unsortedComments?.map((x) => {
				x.isMember = false;
				return x;
			});
			let updateCL = unsortedComments?.slice();
			updateCL?.forEach((comment) => {
				if (!comment?.parentId) comment.parentId = null;
			});
			nested = updateCL?.reduce(
				(initial, value, index, original) => {
					if (value?.parentId) {
						console.log('parent found?')
						let parentFound = findParent(initial?.nested, value);
						if (parentFound) {
							console.log('parent found.')
							checkLeftOvers(initial?.left, value);
						} else {
							initial?.left?.push(value);
						}
					} else {
						console.log('no parent found')
						if (initial?.left?.length) {
							checkLeftOvers(initial?.left, value);
						}
						delete value?.parentId;
						value.root = true;
						initial?.nested?.push(value);
					}
					return index < original?.length - 1 ? initial : initial?.nested;
				},
				{ nested: [], left: [] }
			);

			return nested;
		}
    }

    function checkLeftOvers(leftOvers, possibleParent) {
      let leftOversLen = leftOvers?.length;
      let parentChildren = possibleParent?.children || [];

      for (let i = 0; i < leftOversLen; i++) {
        if (leftOvers[i]?.parentId === possibleParent?.id) {
			delete leftOvers[i]?.parentId;
			parentChildren
				? parentChildren?.push(leftOvers[i])
				: (parentChildren = [leftOvers[i]]);
			possibleParent.count = parentChildren.length;
			const addedObj = leftOvers.splice(i, 1);
			console.log(addedObj)
			checkLeftOvers(leftOvers, addedObj[0]);
        }
      }
    }

    function findParent(possibleParents, possibleChild) {
      let possibleParent = possibleChild?.parentId;
      let found = false;
      for (let i = 0; i < possibleParents?.length; i++) {
		  console.log(possibleParents[i]?.id === possibleParent)
        if (possibleParents[i]?.id === possibleParent) {
          found = true;
		  try {
			delete possibleChild?.parentId;
		  } catch (error) {
			  console.error(error)
		  }
          
          if (possibleParents[i]?.children) {
            possibleParents[i]?.children?.push(possibleChild);
          } else {
            possibleParents[i].children = [possibleChild];
            possibleParents[i].count = possibleParents[i]?.children?.length;
            return true;
          } 
        } else if (possibleParents[i].children)
          found = findParent(possibleParents[i].children, possibleChild);
      }
      return found;
    }

	
	const fetchComments = async () => {
		fetchCount++;
		const url = `../../api/comment/getComments/${$currentPost.id}.json`;
		const result = await fetch(url, {
			method: 'GET'
		});
		let res = await result.json();
		const nestedResult = sortComments(res);
		if (nestedResult.length > 0) {
			postComments = [...nestedResult];
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
			console.log(error);
		}
	};
	const updateProjects = async (pid) => {
		if (!pid) {
			console.log('No post id passed to updateProjects() in [post].svelte.');
		}
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
	// let contentWidth;
	$: showCaptureThumbnail.set(editing);

	$: dateCreated = new Date(createdAt);

	const now = new Date();

	// let daysTimePass = now.getTime() - dateCreated.getTime();
	$: daysPassed = new Date().getTime() - dateCreated.getTime();
	$: totalDays = Math.floor(daysPassed / (1000 * 3600 * 24));

	let splitOne = null;
	let splitTwo = null;
	let splitThree = null;
	let splitFour = null;
	let splitFive = null;
	let splitSix = null;
	let splitSeven = null;
	let splitOneWidth = null;
	$: cacldSplitOneWidth = splitOneWidth;

	const maximize = async (currentChild, isVertical = false) => {
		/*
		 * Steps for Maximizing a pane a user clicks
		 * 1. Determine nearest parent #Split-<num here>
		 * 2. Get all children including self
		 * 3. Check if vertical
		 * 4. If vertical use height
		 */
		const { target } = currentChild;
		const parentSplit = target.closest('.split');
		const parentSection = target.closest('section');
		// console.log();
		const children = parentSplit.children;

		const childCountTotal = parentSplit.childElementCount;
		const gutterCount =
			[...children].filter((child) => child?.classList.contains('gutter')).length ?? 0;
		const adjustedChildCount = childCountTotal - gutterCount;
		[...children].forEach((child) => {
			// console.log(parentSection == child);

			if (parentSection == child) {
				child.style[`${isVertical ? 'height' : 'width'}`] = `calc(${
					adjustedChildCount > 2 ? 80 : 90
				}% - 5px)`;
			} else if (parentSection != child && !child?.classList.contains('gutter')) {
				child.style[`${isVertical ? 'height' : 'width'}`] = `calc(10% - 5px)`;
			}
		});

		const parentParentSplit = parentSplit.closest('.split');
	};
	let paneOneSize = 30; // This is the page pane
	let paneTwoSize = 70; // This is the editor and output pane cluster
	let paneThreeSize; // This is the editor pane cluster

	let postContent;
</script>

<div id="page-container" class:showLoader bind:clientWidth={pageContainerWidth}>
	{#if windowWidth && windowWidth > 900}
		<div class:showLoader bind:this={splitPaneContainer} class="split-container">
			<SplitPane panes={['#split-0', '#split-1']} sizes={[paneOneSize, paneTwoSize]}>
				<!-- Page Content -->
				<section id="split-0" bind:this={splitOne} bind:clientWidth={splitOneWidth}>
					<div class="slot-control-bar">
						<div class="container">page</div>
					</div>
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
								{console.log(cacldSplitOneWidth)}
								{#if cacldSplitOneWidth > 400}
									<div class="post-control-bar" in:fade out:fade="{{ duration: 100 }}">
										<Vote itemID={$currentPost.id} isPost={true} />
										<button class="comment-button" on:click={() => (showCreateComment = true)}
											>Comment</button
										>
									</div>
								{/if}
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
				</section>

				<!-- Editor & Output Content -->
				<section id="split-1" style="z-index: 1000000000;" bind:this={splitTwo}>
					<SplitPane panes={['#split-2', '#split-3']} vertical={value}>
						<!-- Editor Content -->
						<section id="split-2" bind:this={splitThree}>
							<SplitPane panes={['#split-html', '#split-css', '#split-js']} vertical={!value}>
								<section
									id="split-html"
									class="section-panel"
									style="overflow-x: visible;"
									bind:this={splitFive}
								>
									{#if html}
										<div
											class="slot-control-bar"
											on:dblclick={(e) => {
												maximize(e, !value);
											}}
										>
											<div class="container">html</div>
										</div>
										<Editor code={html} />
									{/if}
								</section>
								<section
									id="split-css"
									class="section-panel"
									style="overflow-x: visible;"
									bind:this={splitSix}
								>
									<div
										class="slot-control-bar"
										on:dblclick={(e) => {
											maximize(e, !value);
										}}
									>
										<div class="container">css</div>
									</div>
									<Editor code={css} />
								</section>
								<section
									id="split-js"
									class="section-panel"
									style="overflow-x: visible;"
									bind:this={splitSeven}
								>
									<div
										class="slot-control-bar"
										on:dblclick={(e) => {
											maximize(e, !value);
										}}
									>
										<div class="container">js</div>
									</div>
									<Editor code={js} />
								</section>
							</SplitPane>
						</section>

						<!-- Output Content -->
						<section id="split-3" bind:this={splitFour}>
							<SplitPane
								panes={['#split-output', '#split-console']}
								vertical={!value}
								sizes={[100, 0]}
							>
								<section id="split-output" class="section-panel">
									<div class="slot-control-bar">
										<div class="container">output</div>
									</div>
									<Output {srcdoc} />
								</section>
								<section id="split-console" class="section-panel">
									<div class="slot-control-bar">
										<div class="container">console</div>
									</div>
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
	.slot-control-bar {
		// background-color: #ffffffe6;
		// width: ;
		position: relative;

		// background-color: red;
		.container {
			border-radius: 6px 6px 0px 0px;
			padding: 0 10px 0 10px;
			z-index: 1;
			width: calc(100% - 20px);
			height: 30px;
			position: absolute;
			display: flex;
			align-items: center;
		}
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
		border-radius: 6px;
		background-color: var(--mainThemePanelColor);
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
