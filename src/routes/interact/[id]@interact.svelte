<script context="module">
	import {
		isPostStore,
		isCreationStore,
		currentPostPage,
		currentPost,
		postDetailStarter,
		thumbnailStore
	} from '$lib/stores/postStore';

	import Post from '$lib/classObjects/post';
	import { initialPostData } from '$lib/stores/codeStore';

	export async function load({ params, fetch }) {
		isCreationStore.set(true);
		const postSlug = params.id;

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
				// projects.data = projects.data.filter(x => !x.hasOwnProperty('comment'));

				let postOBJ = {
					id: posts.data.id,
					authorID: posts.data.user,
					postTitle: posts.data.title,
					postBlurb: posts.data.text,
					pages: []
				};

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

				// console.log(postOBJ);

				initialPostData.set(postOBJ);
				currentPost.set(postOBJ);
				currentPostPage.set(postOBJ.pages[0]);

				return {};
			}
		}

		return {};
	}
</script>

<script lang="ts">
	import { clientWidth, isVertical, editorContainerHeight, editorContainerWidth, editorOutContainerWidth, editorOutContainerHeight  } from '$lib/stores/layoutStore';
	import SplitPane from '$lib/components/layout/SplitPane/index.svelte';
	import { fade } from 'svelte/transition';
	import Editor from '$lib/components/ui/Editor/index.svelte';
	import Output from '$lib/components/ui/Output/index.svelte';
	import Console from '$lib/components/ui/Console/index.svelte';
	import Pane from '$lib/components/layout/EditorLayouts/Base/Pane.svelte';
	import {
		afterNavigate,
		beforeNavigate,
		disableScrollHandling,
		// goto,
		invalidate,
		prefetch,
		prefetchRoutes
	} from '$app/navigation';
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
import { messageEvent } from '$lib/stores/eventStore';

	let selectedTag = $postDetailStarter?.['tag'];

	let currentPage;
	$: currentPage = $currentPostPage;

	$: post = $currentPost;

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
	});

	beforeNavigate((nav) => {});

	// afterNavigate((nav) => {
	// 	console.log('after from: ');
	// 	console.log(nav.from);
	// 	console.log('after to: ');
	// 	console.log(nav.to);
	// });
	onDestroy(() => {});

	$: windowWidth = $clientWidth;
	$: html = $htmlStore;
	$: css = $cssStore;
	$: js = $jsStore;
	$: srcdoc = { html, css, js };

	// Initial Declarations
	let logs;

	let pageContainerWidth = 0;

	let splitPaneContainer;

	let showLoader = false;

	$: value = $isVertical;

	$: logs = $messageEvent;
</script>

<div id="page-container" class:showLoader bind:clientWidth={pageContainerWidth}>
	{#if windowWidth && windowWidth > 900}
		<div class:showLoader bind:this={splitPaneContainer} class="split-container">
			<SplitPane panes={['#split-2', '#split-3']} vertical={value}>
				<section id="split-2" bind:clientWidth={$editorContainerWidth} bind:clientHeight={$editorContainerHeight}>
					<SplitPane panes={['#split-html', '#split-css', '#split-js']} vertical={!value}>
						<Pane id={'split-html'} label={'html'}>
							<Editor slot="pane-content" code={html}/>
						</Pane>
						<Pane id={'split-css'} label={'css'}>
							<Editor slot="pane-content" code={css}/>
						</Pane>
						<Pane id={'split-js'} label={'js'}>
							<Editor slot="pane-content" code={js}/>
						</Pane>
					</SplitPane>
				</section>
				<section id="split-3"  bind:clientWidth={$editorOutContainerWidth} bind:clientHeight={$editorOutContainerHeight}>
					<SplitPane panes={['#split-output', '#split-console']} vertical={!value} sizes={[100, 0]}>
						<Pane id={'split-output'} label={'output'}>
							<Output slot="pane-content" {srcdoc} />
						</Pane>
						<Pane id={'split-console'} label={'console'}>
							<Console slot="pane-content" {logs} />
						</Pane>
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
	}
	#split-0 {
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		padding-left: 15px;
	}
	#split-console {
		overflow-y: scroll;
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
</style>
