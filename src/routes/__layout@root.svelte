<script>
	import ContentFeed from '$lib/components/layout/ContentFeed/index.svelte';
	import PageInfoCard from '$lib/components/ui/PageInfoCard/index.svelte';
	import LeftNavBar from '$lib/components/layout/Nav/LeftNavBar.svelte';
	import { showFilters } from '$lib/stores/filterStore';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { clientWidth, isDarkModeStore, isVertical, showAuthModal, showPreferences } from '$lib/stores/layoutStore';
	import Nav from '$lib/components/layout/Nav/index.svelte';
	import Modal from '$lib/components/ui/Modal/index.svelte';
	import SignIn from '$lib/components/auth/SignIn/index.svelte';
	import SignUp from '$lib/components/auth/SignUp/index.svelte';
	import CustomToggle from '$lib/components/ui/CustomToggle/index.svelte';
	import VerifyEmail from '$lib/components/auth/VerifyEmail/index.svelte';
	import {
		currentPost,
		currentPostPage,
		currentPostPageId,
		currentPostPageRevert,
		isCreationStore,
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
	import { navigating, session } from '$app/stores';
	import { showCreationModal } from '$lib/stores/modalStore';
	import { authOption } from '$lib/stores/authStore';
	import { post as postUtil, get as getUtil, put as putUtil } from '$lib/utils.js';
	import { goto } from '$app/navigation';
import { reload } from '$lib/stores/funcStore';
import { onMount } from 'svelte';

	let windowWidth;
	let value = false; //  Layout Toggle
	let email = '';
	let error = '*';
	let password = '';
	let passwordConf = '';
	let username = '';
	let verificationCode = '';
	let autions = [SignIn, SignUp, VerifyEmail];
	let selectedCreation;
	let unique = {};

	$: selectedAution = autions[$authOption];
	$: clientWidth.set(windowWidth);
	$: isPost = $isPostStore;
	$: showingPreferencesModal = $showPreferences;
	$: modalCreationBool = $showCreationModal;
	$: isSignUp = $authOption === 1;
	$: isVertical.set(value);

	let editorVisible = false;
	let leftPaneWidth = 0;
	let pageContainerWidth = 0;
	$: pageContainerWidth ? clientWidth.set(pageContainerWidth) : null;
	$: filterVisible = $showFilters;
	let contentFeed;
	let filterForm;
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

	const login = async (gCred) => {

		const response = gCred
		? await postUtil(`/api/auth/signIn.json`, { gCred }).then((r) => r.json(), gCred)
		: await postUtil(`/api/auth/signIn.json`, { email, password }).then((r) => r.json());

		console.log(response);

		if (response && response.active === false) {
		authOption.set(2);
		} else {
		console.log(response);
		$session = response;
		showAuthModal.set(false);
		}
	};
	const handleNewCreation = async () => {
		// if (selectedCreation = 'Post') {
		//   modalCreationBool = false;
		//   goToLink();
		// }
		switch (selectedCreation) {
			case 'Post':
				modalCreationBool = false;
				goToLink(2);
				break;
			case 'Creation':
			modalCreationBool = false;
			goToLink(1);
			break;
		}
	};
	const verify = async () => {
		const response = await getUtil(`/api/auth/verifyCode/${verificationCode}.json`);
		$session = null;
		const verificationRes = await response.json();
		if (verificationRes && verificationRes.error) {
		error = verificationRes.error;
		} else if (verificationRes) {
		error = '*';
		$session = verificationRes;
		showAuthModal.set(false);
		}
	};
	const register = async () => {
		if (passwordConf !== password) return;

		let url = `/api/auth/register.json`;
		try {
		const response = await postUtil(url, {
			username,
			email,
			password
		});
		if (response) {
			$session = response;
			showAuthModal.set(false);
			goto('/');
		}
		} catch (error) {}
	};
	const speedMultiplyer = tweened(1.0, {
    duration: 1000,
    easing: quintOut
  });

  
  onMount(async () => {
    speedMultiplyer.set(4.5);
    // window.addEventListener('message', handle_event, false);
    // reload.set(reloadEditor);
    // layoutInited = true;
  });
</script>

<main
	style="
--fadeAccent: #{mainThemeFadeAccent} !important;
--pageContainerWidth: {pageContainerWidth}px; 
--leftPaneWidth: {leftPaneWidth}px;
--speed-multiplyer: {$speedMultiplyer}s; 
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
<!-- Auth Modal Start -->
{#if $showAuthModal}
	<Modal isCustomModal={true} isAuth={true} {isSignUp}>
	<div class="auth-container" slot="custom_modal">
		<div class="wavesBG">
		<svg
			class="waves"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			viewBox="0 24 150 28"
			preserveAspectRatio="none"
			shape-rendering="auto"
		>
			<defs>
			<path
				id="gentle-wave"
				d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
			/>
			</defs>
			<g class="parallax">
			<use xlink:href="#gentle-wave" x="48" y="0" fill="#{mainThemeBackgroundColor}b3" />
			<use xlink:href="#gentle-wave" x="48" y="3" fill="#{mainThemeBackgroundColor}80" />
			<use xlink:href="#gentle-wave" x="48" y="5" fill="#{mainThemeBackgroundColor}4d" />
			<use xlink:href="#gentle-wave" x="48" y="7" fill="#{mainThemeBackgroundColor}" />
			</g>
		</svg>
		</div>
		<div class="top-item top-right">
		<h2 class="logo-text">srcdoc</h2>
		<br />
		<br />
		<br />
		<div class="auth-form modal-auth" class:isSignUp>
			<!-- <SignIn bind:email={email} bind:password={password} {login}/> -->
			<svelte:component
			this={selectedAution}
			bind:email
			bind:password
			bind:username
			bind:passwordConf
			bind:verificationCode
			{error}
			{login}
			{register}
			{verify}
			/>
		</div>
		</div>
	</div>
	</Modal>
{/if}
<!-- Auth Modal End -->

<!-- Preferences/General Settings Modal Start -->
{#if showingPreferencesModal}
	<Modal isCustomModal={false} isAuth={false}>
	<div slot="toggle">
		Darkmode
		<CustomToggle bind:toggle={$isDarkModeStore} notLayoutToggle={true} />
	</div>
	</Modal>
{/if}
<!-- Preferences/General Settings Modal End -->
	<!-- Nav Start -->
	<!-- <div id="nav-container">
		<Nav windowWidth={$clientWidth} isExplorePage={true}>
			<li class="logo-li nav-id-header" slot="userProfile">
				<div class="image-nav">
					<div class="image-slot">
						<div class="image-container" />
					</div>
				</div>
				<div style="height: 100%; flex-grow: 2;">
					<h3 class="logo-text-nav">
						{$session.username || $session.user.username}
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
		</Nav>
	</div> -->
	<div id="page-container" bind:clientWidth={pageContainerWidth}>
		<ContentFeed bind:this={contentFeed}>
			<div slot="left-panel" class="left-panel-container" bind:clientWidth={leftPaneWidth}>
				<!-- if explore page -> Nav Panel-->
				{#if filterVisible}
					<div class="panel-container" bind:this={filterForm}>
						<LeftNavBar />
					</div>
					<div class="panel-container bottom">
						<footer>
							<div class="filter-options">
								<ul class="filter-options-center">
									<li><a href=".">Terms of Service</a></li>
									<li><a href=".">Privacy Policy</a></li>
									<li><a href=".">Cookie Policy</a></li>
									<li>© 2022 srcdoc</li>
								</ul>
							</div>
						</footer>
					</div>
				{/if}
			</div>
			<div slot="center-panel" class="left" class:editorVisible>
				<slot />
			</div>
		</ContentFeed>
	</div>
</main>

<style lang="scss">
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
	main {
		background-color: var(--mainThemeBackgroundColor);
		display: grid;
		width: 100%;
		height: 100%;
		overflow-y: hidden;
		overflow-x: hidden;
		grid-template-rows: calc(100vh);
		grid-template-columns: 1fr;
		grid-template-areas:
			// 'nav'
			'page';
		color: var(--mainThemePrimaryTextColor);
	}
	#nav-container {
		grid-area: nav;
		margin: 0;
		padding: 0 10px;
	}
	#page-container {
		grid-area: page;
		margin: 10px 10px 10px 10px;
		max-width: calc(100vw - 20px);
		height: calc(100% - 20px);
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
		// margin-top: 10px;
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
		padding: 0;
		height: 100%;
		overflow-y: scroll;
		max-height: calc(100vh - 10px);
		color-scheme: var(--colorScheme);
		scroll-snap-type: y mandatory;
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
		.center-panel {
			height: 100%;
			border-radius: 6px;
			overflow: hidden;
			// -webkit-mask-image: -webkit-radial-gradient(white, black);
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

	/* width */
	::-webkit-scrollbar {
		width: inherit;
	}

	/* Track */
	::-webkit-scrollbar-track {
		background: #e3e3e3;
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: #888;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
