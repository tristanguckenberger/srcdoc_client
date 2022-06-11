<script lang='ts'>
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
	import { destroyLogs, eventStoreLogHandler, messageEvent } from '$lib/stores/eventStore';
	import { authOption } from '$lib/stores/authStore';
	import { post as postUtil, get as getUtil, put as putUtil } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import type { Log } from '$lib/types/log';
	import { onDestroy, onMount } from 'svelte';
	// import {onMount }

	  // Initial Declarations
	let logs: Log[] = [];
	let last_console_event;
	let windowWidth;
	let pageContainerWidth;
	let leftPaneWidth;
	let userProfilePic;
	let authorProfilePic;
	let authPageRowSizeValue;
	let showEditorSettings = false;
	let showUserEditModal = false;
	let value = false; //  Layout Toggle
	let email = '';
	let error = '*';
	let password = '';
	let passwordConf = '';
	let username = '';
	let verificationCode = '';
	let autions = [SignIn, SignUp, VerifyEmail];
	let options = ['Creation', 'Post', 'Project', 'Collective'];
	let selectedCreation;
	let currentPostTitle = '';
  	let currentPostBlurb = '';
	let selectedTag;
	let tags = [
		{ id: 1, text: `Q&A` },
		{ id: 2, text: `Tutorial` },
		{ id: 3, text: `PSA` },
		{ id: 4, text: `Request` },
		{ id: 5, text: `Creation` }
	];

	$: selectedAution = autions[$authOption];
	$: clientWidth.set(windowWidth);
	$: isPost = $isPostStore;
	$: showingPreferencesModal = $showPreferences;
	$: modalCreationBool = $showCreationModal;
	$: isSignUp = $authOption === 1;
	$: isVertical.set(value);
	// isCreationStore.set(true);

	onMount(() => {
		window.addEventListener('message', handle_event, false);
	});

	onDestroy(() => {
		window.removeEventListener('message', handle_event, false);
		destroyLogs();
	});

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
		// switch (selectedCreation) {
		// case 'Post':
		// 	modalCreationBool = false;
		// 	goToLink(2);
		// 	break;
		// case 'Creation':
		// 	modalCreationBool = false;
		// 	goToLink(1);
		// 	break;
		// }
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

  const handle_event = (event) => {
	const { action, args } = event?.data;
	if (action === 'console') {
		eventStoreLogHandler($messageEvent, event?.data);
	}
  };

</script>

<svelte:window bind:innerWidth={windowWidth} />
<div
	class="interact"
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
{#if $navigating}
	<div class="spinner-container">
	<div id="loading" />
	</div>
{/if}

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

<!-- Editor Settings Modal Start -->
{#if showEditorSettings}
	<Modal bind:showEditorSettings>
	<div slot="toggle">
		<CustomToggle bind:toggle={value} />
	</div>
	</Modal>
{/if}
<!-- Editor Settings Modal End -->

<!-- Creation Modal Start -->
{#if modalCreationBool}
	<Modal isCustomModal={modalCreationBool} bind:modalCreationBool>
	<div class="creation-modal-container" slot="custom_modal">
		Create New:
		<!-- Select Creation Type Start -->
		<div class="menu-toggle select">
		<select bind:value={selectedCreation}>
			{#if options}
			{#each options as option}
				<option value={option}>
				{option}
				</option>
			{/each}
			{/if}
		</select>

		<!-- {#if selectedCreation === 'Post'}
			<select bind:value={selectedCollective}>
			{#if collectiveOptions}
				{#each collectiveOptions as option}
				<option value={option.id}>
					{option.name}
				</option>
				{/each}
			{/if}
			</select>
		{/if} -->
		</div>
		<!-- Select Creation Type End -->

		<!-- Post Selection Options Start -->
		{#if selectedCreation === 'Post' || selectedCreation === 'Creation'}
		<div class="post-details">
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
			<label>
			<select bind:value={selectedTag}>
				{#each tags as tag}
				<option value={tag}>{tag.text}</option>
				{/each}
			</select>
			</label>
		</div>
		{/if}
		<!-- Post Selection Options End -->

		<button on:click={handleNewCreation}>Create</button>
	</div>
	</Modal>
{/if}
<!-- Creation Modal End -->
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

		<div slot="editorMenu">
			<a class="sticky-toggle" href="/" on:click|preventDefault>
				<div class="menu-toggle select">
					title
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
				<div class="menu-toggle">
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
						/></svg
					>
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
	.interact {
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
	:global(.interact .left-panel) {
		display: none;
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
</style>
