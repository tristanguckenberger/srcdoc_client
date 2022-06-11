<script>
	import { clientWidth, isDarkModeStore } from '$lib/stores/layoutStore';
	import Nav from '$lib/components/layout/Nav/index.svelte';
	import { navigating, session } from '$app/stores';
	import {
		currentPost,
		currentPostPage,
		currentPostPageId,
		currentPostPageRevert,
		isPostStore
	} from '$lib/stores/postStore';
	import {
		changingPage,
		cssStore,
		htmlStore,
		initialPostData,
		jsStore,
		localCodeStoreCSS,
		localCodeStoreHTML,
		localCodeStoreJS,
		triggerReset
	} from '$lib/stores/codeStore';
	import { destroyLogs, eventStoreLogHandler, messageEvent } from '$lib/stores/eventStore';
	import { afterUpdate, onDestroy, onMount } from 'svelte';

	onMount(() => {
		window.addEventListener('message', handle_event, false);
	});

	onDestroy(() => {
		window.removeEventListener('message', handle_event, false);
		destroyLogs();
	});

	let windowWidth;
	let pageContainerWidth;
	let leftPaneWidth;
	let userProfilePic;
	let authorProfilePic;
	let authPageRowSizeValue;
	let selected;
	let pageSelector;
	let showEditorSettings = false;

	$: clientWidth.set(windowWidth);
	$: isPost = $isPostStore;
	$: postPages = $currentPost?.pages;
	$: console.log($currentPost?.pages);

	// THEMES ---------------------------------------------------------------------
	let mainThemeBackgroundColor = 'ECECEC';
	let mainThemePanelColor = 'FBFBFB';
	let mainThemePanelAreaColor = 'FFFFFF';
	let mainThemePrimaryTextColor = '525058';
	let mainThemeFadedTextColor = '52505857';
	let mainThemeNavDropColors = '525058';
	let mainThemeModalBlurBgColor = 'rgba(236, 236, 236, 0.8)';
	let mainThemeScrollBarBG = 'd5d5d5';
	let mainThemeAccentColor = 'ECECEC';
	let mainThemeAccentHoverColor = 'ECECECab';
	let mainThemeModalFormBlur = 'FBFBFBc2';
	let mainThemeFadeAccent = 'f5f5f5';
	let colorScheme = 'light';
	let boxShadowColor = 'c5c5c55c';
	let inputBG = 'e1d6e642';
	let textareaBorder = '2020210d';
	let postControlBackgroundColor = 'ffffff';
	let mainThemeShadow = '0 1px 6px 0px #24232429';

	// $: isDarkModeStore.set(isDarkMode);

	$: if ($isDarkModeStore) {
		mainThemeBackgroundColor = '242324'; //'202021'; // 272727
		mainThemePanelColor = '373638';
		mainThemePanelAreaColor = '2d2c2d'; //'20202175'; // '3e3d407d';
		mainThemePrimaryTextColor = 'FFFFFF';
		mainThemeFadedTextColor = 'E3E3E357';
		mainThemeNavDropColors = 'E3E3E3';
		mainThemeModalBlurBgColor = 'rgba(39, 39, 39, 0.8)';
		mainThemeScrollBarBG = '3F3D41';
		mainThemeAccentColor = '202021';
		mainThemeAccentHoverColor = '20202185';
		mainThemeModalFormBlur = '373638f5';
		mainThemeFadeAccent = '2d2d30e0';
		colorScheme = 'dark';
		postControlBackgroundColor = '424243';
		boxShadowColor = '0000009c';
		inputBG = '403e41';
		textareaBorder = '2020214a';
		mainThemeShadow = '0 1px 6px 0px #242324';
	} else {
		mainThemeBackgroundColor = 'E3E3E3';
		mainThemePanelColor = 'FBFBFB';
		mainThemePanelAreaColor = 'FFFFFF';
		mainThemePrimaryTextColor = '525058';
		mainThemeFadedTextColor = '52505857';
		mainThemeNavDropColors = '525058';
		mainThemeModalBlurBgColor = 'rgba(236, 236, 236, 0.8)';
		mainThemeScrollBarBG = 'd5d5d5';
		mainThemeAccentColor = 'E3E3E3';
		mainThemeAccentHoverColor = 'E3E3E3ab';
		mainThemeModalFormBlur = 'FBFBFBf5';
		mainThemeFadeAccent = 'f5f5f5';
		colorScheme = 'light';
		postControlBackgroundColor = 'ffffff';
		boxShadowColor = 'c5c5c55c';
		inputBG = 'e1d6e642';
		textareaBorder = '2020210d';
		mainThemeShadow = '0 1px 6px 0px #24232429';
	}

	const setPageSelect = () => {
		if (pageSelector && $currentPostPage && !$changingPage && $navigating === null) {
			pageSelector.value = $currentPostPage;
		}
	};

	const handlePageSelect = () => {
		if (selected) {
			htmlStore.set(selected.html);
			cssStore.set(selected.css);
			jsStore.set(selected.js);
			localCodeStoreHTML.set(selected.html);
			localCodeStoreCSS.set(selected.css);
			localCodeStoreJS.set(selected.js);

			currentPostPage.set(selected);
			currentPostPageRevert.set(JSON.parse(JSON.stringify($currentPostPage)));
			if ($currentPostPage && $currentPostPage.id) currentPostPageId.set($currentPostPage.id);
			changingPage.set(true);
			// pageSelector.value = $currentPostPage;
		}
	};

	function toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	const resetPost = () => {
		currentPost.set($initialPostData);
		htmlStore.set($currentPostPageRevert.html);
		cssStore.set($currentPostPageRevert.css);
		jsStore.set($currentPostPageRevert.js);

		changingPage.set(true);
	};

	const handle_event = (event) => {
		const { action, args } = event?.data;
		if (action === 'console') {
			eventStoreLogHandler($messageEvent, event?.data);
		}
	};
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div
	class="learn"
	style="
	--fadeAccent: #{mainThemeFadeAccent} !important;
	--authorPic: url('{authorProfilePic}');
	--profilePic: url('{userProfilePic}');
	--authPageRowSizeValue: {authPageRowSizeValue}; 
	--pageContainerWidth: {pageContainerWidth}px; 
	--leftPaneWidth: {leftPaneWidth}px;
	--mainThemeBackgroundColor: #{mainThemeBackgroundColor} !important;
	--mainThemePanelColor: #{mainThemePanelColor} !important;
	--mainThemePanelAreaColor: #{mainThemePanelAreaColor} !important;
	--mainThemePrimaryTextColor: #{mainThemePrimaryTextColor} !important;
	--mainThemeFadedTextColor: #{mainThemeFadedTextColor} !important;
	--mainThemeNavDropColors: #{mainThemeNavDropColors} !important;
	--mainThemeModalBlurBgColor: {mainThemeModalBlurBgColor} !important;
	--mainThemeScrollBarBG: #{mainThemeScrollBarBG} !important;
	--mainThemeAccentColor: #{mainThemeAccentColor} !important;
	--mainThemeAccentHoverColor: #{mainThemeAccentHoverColor} !important;
	--mainThemeModalFormBlur: #{mainThemeModalFormBlur} !important;
	--postControlBackgroundColor: #{postControlBackgroundColor} !important;
	--colorScheme: {colorScheme} !important;
	--boxShadowColor: #{boxShadowColor} !important;
	--inputBG: #{inputBG} !important;
	--textareaBorder: #{textareaBorder} !important;
	--mainThemeShadow: {mainThemeShadow} !important;
	"
>
	<div id="nav-container">
		<Nav {isPost} {windowWidth} isExplorePage={false}>
			<li class="logo-li nav-id-header" slot="userProfile">
				<div class="image-nav">
					<div class="image-slot">
						<div class="image-container" />
					</div>
				</div>
				<div style="height: 100%; flex-grow: 2;">
					<h3 class="logo-text-nav">
						{$session?.['username'] || $session?.['user']?.['username']}
					</h3>
					<span style="font-size: 14px;">View Profile</span>
				</div>
				<div>
					<h2
						style="font-weight: 200; height: 100%; display: flex; align-items: center; margin-block-end: 0; margin-block-start: 0;"
					>
						>
					</h2>
				</div>
			</li>

			<div slot="editorMenu">
				<a class="sticky-toggle" href="/" on:click|preventDefault>
					<div class="menu-toggle select">
						{#if postPages}
							<select
								bind:value={selected}
								on:change={() => {
									handlePageSelect();
								}}
								bind:this={pageSelector}
							>
								{#each postPages as pageVal, i}
									<option value={pageVal}>
										{#if !$triggerReset}
											{#if pageVal?.pageTitle}
												{pageVal?.pageTitle}
											{:else}
												{pageVal?.title}
											{/if}
										{/if}
									</option>
								{/each}
							</select>
						{/if}
					</div>

					<div
						class="menu-toggle"
						on:click={() => {
							showEditorSettings = !showEditorSettings;
						}}
					>
						<svg
							class="menu-icons-svg"
							style="width: 60%;"
							xmlns="http://www.w3.org/2000/svg"
							width="192"
							height="192"
							fill="#000000"
							viewBox="0 0 256 256"
							><rect width="256" height="256" fill="none" /><circle
								cx="128"
								cy="128"
								r="48"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><path
								d="M183.7,65.1q3.8,3.5,7.2,7.2l27.3,3.9a103.2,103.2,0,0,1,10.2,24.6l-16.6,22.1s.3,6.8,0,10.2l16.6,22.1a102.2,102.2,0,0,1-10.2,24.6l-27.3,3.9s-4.7,4.9-7.2,7.2l-3.9,27.3a103.2,103.2,0,0,1-24.6,10.2l-22.1-16.6a57.9,57.9,0,0,1-10.2,0l-22.1,16.6a102.2,102.2,0,0,1-24.6-10.2l-3.9-27.3q-3.7-3.5-7.2-7.2l-27.3-3.9a103.2,103.2,0,0,1-10.2-24.6l16.6-22.1s-.3-6.8,0-10.2L27.6,100.8A102.2,102.2,0,0,1,37.8,76.2l27.3-3.9q3.5-3.7,7.2-7.2l3.9-27.3a103.2,103.2,0,0,1,24.6-10.2l22.1,16.6a57.9,57.9,0,0,1,10.2,0l22.1-16.6a102.2,102.2,0,0,1,24.6,10.2Z"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/></svg
						>
					</div>
					<div class="menu-toggle" on:click={toggleFullScreen}>
						<svg
							class="menu-icons-svg"
							style="width: 60%;"
							xmlns="http://www.w3.org/2000/svg"
							width="192"
							height="192"
							fill="#000000"
							viewBox="0 0 256 256"
							><rect width="256" height="256" fill="none" /><polyline
								points="168 48 208 48 208 88"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><line
								x1="152"
								y1="104"
								x2="208"
								y2="48"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><polyline
								points="88 208 48 208 48 168"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><line
								x1="104"
								y1="152"
								x2="48"
								y2="208"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><polyline
								points="208 168 208 208 168 208"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><line
								x1="152"
								y1="152"
								x2="208"
								y2="208"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><polyline
								points="48 88 48 48 88 48"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><line
								x1="104"
								y1="104"
								x2="48"
								y2="48"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/></svg
						>
					</div>
					<div
						style="/*width: fit-content; padding: 0 1rem;*/"
						class="menu-toggle"
						on:click={resetPost}
					>
						<svg
							class="menu-icons-svg"
							style="width: 60%;"
							xmlns="http://www.w3.org/2000/svg"
							width="192"
							height="192"
							fill="#000000"
							viewBox="0 0 256 256"
							><rect width="256" height="256" fill="none" /><polyline
								points="79.8 99.7 31.8 99.7 31.8 51.7"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/><path
								d="M65.8,190.2a88,88,0,1,0,0-124.4l-34,33.9"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/></svg
						>
					</div>
					<div class="menu-toggle" on:click={setPageSelect}>
						<svg
							class="menu-icons-svg"
							style="width: 60%;"
							xmlns="http://www.w3.org/2000/svg"
							width="192"
							height="192"
							fill="#000000"
							viewBox="0 0 256 256"
							><rect width="256" height="256" fill="none" /><path
								d="M228.1,121.2,84.2,33.2A8,8,0,0,0,72,40V216a8,8,0,0,0,12.2,6.8l143.9-88A7.9,7.9,0,0,0,228.1,121.2Z"
								fill="none"
								stroke="#000000"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
						</svg>
					</div>
				</a>
			</div>
		</Nav>
	</div>
	<slot />
</div>

<style lang="scss">
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
	.learn {
		background-color: var(--mainThemeBackgroundColor);
		display: grid;
		width: 100%;
		height: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		grid-template-rows: 68px calc(100vh - 68px);
		grid-template-columns: 1fr;
		grid-template-areas:
			'nav'
			'page';
		color: var(--mainThemePrimaryTextColor);
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
	:global(.learn .left-panel) {
		display: none;
	}
</style>
