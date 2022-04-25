<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { slide, fade } from 'svelte/transition';
	import { navigating, page, session } from '$app/stores';
	import Search from '$lib/components/ui/Search/index.svelte';
	import Modal from '$lib/components/ui/Search/index.svelte';
	import Hamburger from '$lib/components/ui/Hamburger/index.svelte';
	// import Dots from '$lib/components/layout/Rotator/Dots.svelte';
	import CustomToggle from '$lib/components/ui/CustomToggle/index.svelte';
	import { post as postUtil, get as getUtil } from '$lib/utils.js';

	// Stores
	import {
		clientWidth,
		dropWidth,
		hideBackground,
		rightPanelWidth,
		showAuthModal,
		showCollectives,
		showPosts,
		showPreferences
	} from '$lib/stores/layoutStore';
	import {
		isPostStore,
		currentPostPage,
		currentPost,
		isCreationStore
	} from '$lib/stores/postStore';
	// import {
	//   currentSlide,
	//   previousSlide,
	//   nextSlide,
	//   runDotNavHandler,
	//   dotIndex
	// } from '$lib/stores/rotatorStore.js';
	import { showCreationModal } from '$lib/stores/modalStore.js';
	import { authOption } from '$lib/stores/authStore';
	import { mobileNavOptStore } from '$lib/stores/mobileNavOptStore.js';
	import { reload } from '$lib/stores/funcStore.js';
	import { isDarkModeStore } from '$lib/stores/layoutStore';
	import { afterUpdate } from 'svelte';
	import {
		changingPage,
		codeToSave,
		cssStore,
		htmlStore,
		jsStore,
		lockPageStore
	} from '$lib/stores/codeStore';

	export let showEditorSettings: boolean = false;
	export let showSubNav: boolean = false;
	export let isPost: boolean = false;
	export let isExplorePage: boolean = false;
	export let windowWidth: number;

	let authNavPos = false;
	let authorized;
	let profileToggle = false;
	let showLeftPane = false;
	let profileDropSize;
	let isCustomModal = true;

	$: if ($page.url.pathname === '/') {
		isPost = false;
	}
	// $: dotSlideVal = $currentSlide;
	$: if ($rightPanelWidth > 0) dropWidth.set($rightPanelWidth);
	$: if ($clientWidth > 1920 && (isPost === false || isCreation === false)) {
		if ($page.url.pathname === '/auth') {
			showLeftPane = false;
		} else {
			showLeftPane = true;
		}
	} else {
		showLeftPane = false;
	}
	$: if ($page.url.pathname === '/auth') {
		authNavPos = true;
	} else {
		authNavPos = false;
	}
	// $: authorized = $session;
	$: if (!authorized) {
		$page.url.pathname === '/auth';
	}
	$: signedOut = !authorized ? true : false;
	$: authNavWidth = $rightPanelWidth > 0 ? $rightPanelWidth : authNavWidth;
	$: postsToggled = $showPosts;
	$: collectivesToggled = $showCollectives;

	$: hideBackground.set(profileToggle);

	let showLoader = $navigating !== null;

	afterUpdate(() => {
		showLoader = $navigating !== null;
		authorized = $session;
		// console.log($session);
	});

	$: if (showLoader) {
		profileToggle = false;
	}

	const logout = async () => {
		const url = '../../api/auth/signout.json';
		await getUtil(url).then((r) => {
			profileToggle = false;
			isPostStore.set(false);
			isCreationStore.set(false);
			$session = null;
			goto('/');
		});
	};
	const toggleCreate = () => {
		let modalCreationBool = $showCreationModal;
		showCreationModal.set(!modalCreationBool);
	};

	// $: if (profileDropSize === 0 || authNavWidth === 0) {
	//   profileDropSize = $dropWidth;
	//   authNavWidth = $dropWidth;
	// }

	let isCreation = $isCreationStore;

	afterUpdate(() => {
		isCreation = $isCreationStore;
	});

	let navMargin = 'auto';
	let navWidth = '100%';

	afterNavigate((nav) => {
		console.log(nav);
		if (nav.to?.pathname.includes('interact')) {
			navMargin = '0 10px 0 10px';
			navWidth = 'calc(100% - 20px)';
		} else if (nav.to?.pathname === '/') {
			navMargin = 'auto';
			navWidth = '100%';
		}
	});
</script>

<nav
	class:showLeftPane
	class:isPost
	class:isCreation
	style="--navWidth: {navWidth}; --navMargin: {navMargin}; --drop-width: {profileDropSize}px; --rightPanelWidth: {250}px;"
>
	<div class:showLeftPane class:isPost class:isCreation class="left-panel" />

	{#if $page && $page.hasOwnProperty('path')}
		{#if ($isPostStore === true || $isCreationStore === true) && windowWidth > 900}
			<slot name="editorMenu" />
			<Search />
		{:else if ($isPostStore === false || $isCreationStore === false) && $page.url.pathname !== '/auth' && windowWidth > 900}
			<div
				class="browse-controls"
				in:fade={{ delay: 100, duration: 100 }}
				out:fade={{ delay: 0, duration: 100 }}
			>
				<Search />
			</div>
		{/if}
	{/if}
	<ul class:authNavPos class:signedOut class="nav-container" class:isPost>
		{#if windowWidth < 900}
			{#if profileToggle}
				<ul
					class="drop"
					class:isPost
					in:slide={{ delay: 0, duration: 100 }}
					out:slide={{ delay: 100, duration: 150 }}
				>
					{#if $session}
						<slot name="userProfile" />
					{:else}
						<li class="logo-li">
							<h2 class="logo-text">srcdoc</h2>
						</li>
					{/if}
					<ul class="drop-mobile-nav">
						<li>
							<a href="/">Explore</a>
						</li>
						{#if $session}
							<li>
								<a href="." on:click|preventDefault={logout}>Sign Out</a>
							</li>
						{:else}
							<li>
								<a
									href="."
									on:click|preventDefault={() => {
										profileToggle = !profileToggle;
										authOption.set(0);
										setTimeout(() => {
											$reload();
										}, 50);
										goto('/').then((r) => setTimeout(() => goto('/auth'), 50));
									}}>Sign In</a
								>
							</li>
							<li>
								<a
									href="/auth"
									on:click={() => {
										setTimeout(() => {
											$reload();
											profileToggle = !profileToggle;
										}, 50);
										authOption.set(1);
									}}>Sign Up</a
								>
							</li>
						{/if}
					</ul>

					<!-- <li>
            <a
              href="."
              on:click|preventDefault={() => {
                 setTimeout(() => {
                        profileToggle = !profileToggle;
                        showPreferences.set(true);
                        $reload();
                    }, 50);
              }}>Preferences</a
            >
          </li> -->

					<hr />
					<li style="padding-top: calc(1rem - 0.5em);">
						<a
							href="."
							class="nav-toggle"
							on:click|preventDefault={() => {
								// isDarkModeStore.set(!$isDarkModeStore);
							}}
						>
							Dark Mode
							<div class="toggle-container">
								{#if $isDarkModeStore} On {:else} Off {/if}
								<CustomToggle bind:toggle={$isDarkModeStore} notLayoutToggle={true} />
							</div>
						</a>
					</li>
				</ul>
			{/if}

			{#if authorized}
				<li bind:clientWidth={profileDropSize}>
					<div
						class:profileToggle
						class="profile-drop"
						on:click={() => {
							profileToggle = !profileToggle;
						}}
					>
						{#if windowWidth < 900}
							<Hamburger />
						{:else}
							{#if authorized.hasOwnProperty('user')}
								<span class="label">
									<a href="/profiles/u/{authorized.user.id}">
										{authorized.user.username}
									</a>
								</span>
							{:else if authorized.hasOwnProperty('username')}
								<span class="label">
									<a href="/profiles/u/{authorized.id}">
										{authorized.username}
									</a>
								</span>
							{:else}
								<span class="label"> omni </span>
							{/if}
							<Hamburger />
						{/if}
					</div>
				</li>
			{:else}
				<li bind:clientWidth={profileDropSize}>
					<div
						class:profileToggle
						class="profile-drop"
						on:click={() => {
							profileToggle = !profileToggle;
							if (profileToggle) {
								setTimeout(() => {
									document.querySelector('ul.drop').classList.add('blurred');
								}, 100);
							}
						}}
					>
						{#if windowWidth < 900}
							<Hamburger />
						{:else}
							{#if authorized.hasOwnProperty('user')}
								<span class="label">
									<a href="/profiles/u/{authorized.user.id}">
										{authorized.user.username}
									</a>
								</span>
							{:else if authorized.hasOwnProperty('username')}
								<span class="label">
									<a href="/profiles/u/{authorized.id}">
										{authorized.username}
									</a>
								</span>
							{:else}
								<span class="label"> omni </span>
							{/if}
							<Hamburger />
						{/if}
					</div>
				</li>
			{/if}

			<li class="menu-item explore sub-menu-container">
				{#if authorized}
					{#if ($isPostStore || $isCreationStore) && windowWidth < 900}
						<ul class="sub-menu">
							<li
								class="active POST-SELECT"
								on:click={() => {
									document.querySelector('.POST-SELECT').classList.add('active');
									document.querySelector('.CODE-SELECT').classList.remove('active');
									document.querySelector('.OUTPUT-SELECT').classList.remove('active');
									mobileNavOptStore.set(0);
								}}
							>
								Post
							</li>
							<li
								class="CODE-SELECT"
								on:click={() => {
									document.querySelector('.POST-SELECT').classList.remove('active');
									document.querySelector('.CODE-SELECT').classList.add('active');
									document.querySelector('.OUTPUT-SELECT').classList.remove('active');
									mobileNavOptStore.set(1);
								}}
							>
								Code
							</li>
							<li
								class="OUTPUT-SELECT"
								on:click={() => {
									document.querySelector('.POST-SELECT').classList.remove('active');
									document.querySelector('.CODE-SELECT').classList.remove('active');
									document.querySelector('.OUTPUT-SELECT').classList.add('active');
									mobileNavOptStore.set(2);
								}}
							>
								Output
							</li>
						</ul>
					{:else}
						<a href="." on:click|preventDefault={toggleCreate}>+</a>
					{/if}
				{:else if ($isPostStore || $isCreationStore) && windowWidth < 900}
					<ul class="sub-menu">
						<li
							class="active POST-SELECT"
							on:click={() => {
								document.querySelector('.POST-SELECT').classList.add('active');
								document.querySelector('.CODE-SELECT').classList.remove('active');
								document.querySelector('.OUTPUT-SELECT').classList.remove('active');
								mobileNavOptStore.set(0);
							}}
						>
							Post
						</li>
						<li
							class="CODE-SELECT"
							on:click={() => {
								document.querySelector('.POST-SELECT').classList.remove('active');
								document.querySelector('.CODE-SELECT').classList.add('active');
								document.querySelector('.OUTPUT-SELECT').classList.remove('active');
								mobileNavOptStore.set(1);
							}}
						>
							Code
						</li>
						<li
							class="OUTPUT-SELECT"
							on:click={() => {
								document.querySelector('.POST-SELECT').classList.remove('active');
								document.querySelector('.CODE-SELECT').classList.remove('active');
								document.querySelector('.OUTPUT-SELECT').classList.add('active');
								mobileNavOptStore.set(2);
							}}
						>
							Output
						</li>
					</ul>
				{/if}
			</li>
		{:else}
			{#if authorized}
				<li class="menu-item explore">
					<a href="." on:click|preventDefault={toggleCreate}>+</a>
				</li>
			{/if}
			{#if authorized}
				<li bind:clientWidth={profileDropSize}>
					<div
						class:profileToggle
						class="profile-drop"
						on:click={() => {
							profileToggle = !profileToggle;
						}}
					>
						<Hamburger />
						{#if windowWidth > 900}
							{#if authorized && authorized.hasOwnProperty('user')}
								<span class="label">
									<a href="/profiles/u/{authorized.user.id}">
										{authorized.user.username}
									</a>
								</span>
							{:else if authorized && authorized.hasOwnProperty('username')}
								<span class="label">
									<a href="/profiles/u/{authorized.id}">
										{authorized.username}
									</a>
								</span>
							{/if}
						{/if}
					</div>

					{#if profileToggle}
						<ul
							class="drop"
							class:isPost
							in:slide={{ delay: 0, duration: 100 }}
							out:slide={{ delay: 100, duration: 150 }}
						>
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a href="/">Explore</a>
							</li>
							<!-- <li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
                    <a
                    href="."
                    on:click|preventDefault={() => {
                      setTimeout(() => {
                        profileToggle = !profileToggle;
                        showPreferences.set(true);
                        $reload();
                      }, 50);
                    }}>Preferences</a
                    >
                </li> -->
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a href="." class="g_id_signout" on:click|preventDefault={logout}>Sign Out</a>
							</li>
							<hr />
							<li>
								<a
									href="."
									class="nav-toggle"
									on:click|preventDefault={() => {
										// isDarkModeStore.set(!$isDarkModeStore);
									}}
								>
									Dark Mode
									<div class="toggle-container">
										{#if $isDarkModeStore} On {:else} Off {/if}
										<CustomToggle bind:toggle={$isDarkModeStore} notLayoutToggle={true} />
									</div>
								</a>
							</li>
						</ul>
					{/if}
				</li>
			{:else}
				<li bind:clientWidth={profileDropSize}>
					<div
						class:profileToggle
						class="profile-drop"
						on:click={() => {
							profileToggle = !profileToggle;
						}}
					>
						<Hamburger />
						{#if windowWidth > 900}
							{#if authorized && authorized.hasOwnProperty('user')}
								<span class="label">
									{authorized.user.username}
								</span>
							{:else if authorized && authorized.hasOwnProperty('username')}
								<span class="label">
									{authorized.username}
								</span>
							{/if}
						{/if}
					</div>
					{#if profileToggle}
						<ul
							class="drop"
							class:isPost
							in:slide={{ delay: 0, duration: 100 }}
							out:slide={{ delay: 100, duration: 150 }}
						>
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a href="/">Explore</a>
							</li>
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a
									href="."
									on:click|preventDefault={() => {
										profileToggle = !profileToggle;
										authOption.set(0);
										setTimeout(() => {
											$reload();
										}, 50);
										showAuthModal.set(true);
									}}>Sign In</a
								>
							</li>
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a
									href="."
									on:click|preventDefault={() => {
										profileToggle = !profileToggle;
										setTimeout(() => {
											$reload();
										}, 50);
										authOption.set(1);
										showAuthModal.set(true);
									}}>Sign Up</a
								>
							</li>
							<hr />
							<li in:fade={{ delay: 100, duration: 150 }} out:fade={{ delay: 0, duration: 150 }}>
								<a
									class="nav-toggle"
									href="."
									on:click|preventDefault={() => {
										// Set store toggle value for dark/light theme
										// isDarkModeStore.set(!$isDarkModeStore);
									}}
								>
									Dark Mode
									<div class="toggle-container">
										{#if $isDarkModeStore} On {:else} Off {/if}
										<CustomToggle bind:toggle={$isDarkModeStore} notLayoutToggle={true} />
									</div>
								</a>
							</li>
						</ul>
					{/if}
				</li>
			{/if}
		{/if}
	</ul>
</nav>

<style lang="scss">
	hr {
		width: var(--drop-width);
		height: 5px;
		box-sizing: border-box;
		border-style: none;
		background-color: var(--mainThemeBackgroundColor);
	}
	.toggle-container {
		display: flex;
		width: 100px;
		justify-content: space-between;
		align-items: center;
	}
	.auth {
		// border: 2px solid transparent;
	}
	:global(.auth.active) {
		// border: 2px solid #fc79b1 !important;
	}
	nav {
		display: grid;
		grid-template-columns: minmax(400px, 70%) minmax(200px, 30%);
		grid-gap: 10px;
		width: 90%;
		width: 100%;
		justify-content: center;
		background-color: var(--mainThemeBackgroundColor);
		justify-content: space-between;
		align-items: center;
		height: 68px;

		transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);

		// new styles
		display: grid;
		grid-template-columns: minmax(100px, 20%) minmax(450px, 80%) minmax(250px, 20%);
		grid-gap: 10px;
		max-width: 1980px;
		width: 100%;
		justify-content: center;
		margin: var(--navMargin);
		width: var(--navWidth);

		ul {
			display: grid;
			grid-template-columns: 48px calc(100% - 48px);
			// grid-template-columns: 100px calc(100% - 100px);
			align-items: center;
			list-style: none;
			// height: calc(100% - 20px);
			grid-gap: 10px;
			margin-block-end: 0;
			margin-block-start: 0;
			width: calc(100% - 10px);
			padding-inline-start: 0;

			li {
				height: 48px;
				justify-content: center;
				justify-self: center;
				align-items: center;
				width: 100%;
				user-select: none;
				-webkit-user-select: none;
				-khtml-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;

				a {
					padding: 0 1.5rem;
				}
			}
		}
		ul.signedOut {
			grid-template-columns: calc(100%);
			width: 100%;
		}
	}
	nav.showLeftPane {
		grid-template-columns: minmax(100px, 20%) minmax(600px, 80%) minmax(100px, 20%);
		max-width: 1980px;
	}
	.menu-item {
		height: 100%;
		display: flex;
		align-items: center;
		border-radius: 6px;
		transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
		background-color: var(--mainThemePanelColor);

		&:hover {
			// background-color: #f5f5f5;
			cursor: pointer;
		}
	}
	.left-panel {
		// display: none;
	}
	.left-panel.showLeftPane {
		// display: block;
	}
	.left-panel.isPost,
	.left-panel.isCreation {
		visibility: hidden;
	}
	@media (max-width: 878px) {
		.left-panel,
		.right-panel {
			display: none;
		}
		nav {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
			grid-gap: 10px;
			max-width: 1980px;
			width: 100%;
			justify-content: center;
			margin: auto;
		}
	}
	.auth-bar {
		width: 100%;
		height: 48px;
		display: grid;
		grid-gap: 10px;
		grid-template-columns: 1fr 1fr;
		div {
			width: 100%;
			background-color: var(--mainThemePanelColor);
			border-radius: 6px;
			justify-content: center;
			justify-self: center;
			align-items: center;
			display: flex;
			a {
				width: 100%;
				height: 100%;
				justify-content: center;
				justify-self: center;
				align-items: center;
				display: flex;
			}
		}
	}
	.profile-drop {
		min-width: 250px;
		width: 100%;
		flex-grow: 1;
		height: 48px;
		position: relative;
		color: var(--mainThemeNavDropColors);
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 10;

		&:hover {
			cursor: pointer;
			border-radius: 6px 6px 0 0;
			// border-bottom: transparent;
		}

		span {
			transform: rotate(90deg);
		}
		span.label {
			transform: unset;
			padding: 0 10px 0 10px;
		}
	}
	.profile-drop.profileToggle {
		border-radius: 6px 6px 0 0;
		border-bottom: unset;
	}
	ul.drop {
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: saturate(180%) blur(20px) !important;
		position: absolute;
		padding: 1rem;
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		// -webkit-border-bottom-right-radius: 6px;
		// -webkit-border-bottom-left-radius: 6px;
		padding-right: 0px;
		// background-color: #4ca5ffc9;
		// background-color: #6e6d73c9
		background-color: var(--mainThemeModalFormBlur);
		color: var(--mainThemePrimaryTextColor) !important;
		display: flex;
		flex-direction: column;
		justify-content: center;
		list-style: none;
		margin-block-end: 0;
		margin-block-start: 0;
		padding-inline-start: 0;
		// z-index: 9999999999999999999999999999999999999999999;
		height: fit-content;
		height: -moz-fit-content;
		width: var(--drop-width);
		z-index: 10000000000;

		li {
			display: flex;
			justify-content: flex-end;

			a {
				color: var(--mainThemePrimaryTextColor) !important;
				text-align: left;
				font-weight: 600;
				width: var(--drop-width - 20px);
			}

			color: var(--mainThemePrimaryTextColor) !important;
		}
	}
	nav.isPost,
	nav.isCreation {
		grid-template-columns: 2fr 2fr var(--rightPanelWidth);
	}
	.drop.isPost {
		box-shadow: unset;
	}
	ul.authNavPos {
		// position: fixed;
		// right: 20px;
		width: calc(var(--rightPanelWidth) - 10px);
		.menu-item {
			height: 48px;
			transition: unset;
		}
	}
	.menu-item.explore {
		display: flex;
		justify-content: center;
		align-items: center;

		a {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
	.browse-controls {
		display: flex;
		align-items: center;
		flex-direction: row;
		background-color: var(--mainThemePanelColor);
		border-radius: 6px;
		min-height: 48px;

		:global(.search-input-container) {
			flex-grow: 6;
		}

		.controls-container {
			ul {
				display: flex;
				padding-right: 10px;
				li {
					display: flex;
					align-items: center;
					height: 48px;

					a {
						padding: 10px;
						width: fit-content;
						font-weight: 600 !important;
						border-radius: 6px;
						font-size: 13.3333px !important;
						color: var(--mainThemeFadedTextColor);
						transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
					}
				}
			}
		}
	}
	li.postsToggled > a,
	li.collectivesToggled > a {
		background-color: #4ca5fe;
		color: #ffffff !important;
	}
	.profile-drop {
		flex-direction: row-reverse;
	}
	@media screen and (max-width: 900px) {
		hr {
			width: 100% !important;
		}
		ul.drop-mobile-nav {
			display: flex;
			margin-right: 0 !important;
			flex-direction: column;
			flex-grow: 1;
			height: 100%;
			row-gap: 1.5rem;

			li {
				a {
					font-size: 1rem;
					font-weight: 400;
				}
			}
		}
		nav ul {
			width: 100% !important;
			grid-gap: 0;

			li {
				height: unset !important;
				font-weight: 600;
				color: var(--mainThemeFadedTextColor);
			}
			li.active {
				color: var(--mainThemePrimaryTextColor);
			}
			margin-right: 10px;
		}
		.nav-container {
			grid-template-columns: calc(100% - 48px) 48px;
			background-color: var(--mainThemePanelColor);
			border-radius: 6px;
		}
		.nav-container.isPost {
			grid-template-columns: 1fr 1.5fr !important;
		}
		.profile-drop {
			flex-direction: row;
			background-color: unset !important;
		}
		.sub-menu {
			display: flex;
			width: 100%;
			height: 100%;
			justify-content: space-between;
			align-items: center;
		}
		nav ul.signedOut {
			grid-template-columns: 1fr !important;
		}
		nav ul.drop {
			width: calc(100vw - 20px) !important;
			height: calc(100% - 110px);
			top: 10px;
			border-radius: 6px;
			backdrop-filter: saturate(180%) blur(20px);
			-webkit-backdrop-filter: blur(20px) saturate(180%);

			li {
				justify-content: flex-start !important;

				a {
					width: 100% !important;
					display: flex !important;
					justify-content: space-between !important;
					align-items: center !important;
				}
			}
		}
		nav {
			background-color: unset !important;
		}
	}

	.blurred {
		backdrop-filter: saturate(180%) blur(20px);
		-webkit-backdrop-filter: blur(20px) saturate(180%) !important;
	}
	.nav-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100% !important;
		font-size: 1rem !important;
		font-weight: 400 !important;
	}
	:global(li.logo-li) {
		width: calc(100% - (1.5rem + 20px));
		position: relative;
	}
	.logo-text {
		position: relative;
		top: 0;
		left: 20px;
		z-index: 1;
		font-family: 'Outfit', sans-serif;
		color: #ffffff;
		padding: 10px;
		padding-top: 8px;
		font-weight: 500;
		font-size: 1.8em;
		border-radius: 6px;
		background: #c21997;
		transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: 0px 0px 0px 0px #41414125;
		line-height: 0.9em;
		justify-self: left;
	}

	.menu-item.sub-menu-container {
		background-color: unset !important;
	}
	.profile-drop .label a {
		transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
	}
	.profile-drop .label a:hover {
		color: #c21997;
	}
</style>
