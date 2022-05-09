<script>
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

	export let showEditorSettings = false;
	export let showSubNav = false;
	export let isPost = false;
	export let isExplorePage = false;
	export let windowWidth;

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

	let isCreation = $isCreationStore;

	afterUpdate(() => {
		isCreation = $isCreationStore;
	});

	let navMargin = 'auto';
	let navWidth = '100%';

	afterNavigate((nav) => {
		if (nav.to?.pathname.includes('interact') || nav.to?.pathname.includes('learn')) {
			navMargin = '0 10px 0 10px';
			navWidth = 'calc(100% - 20px)';
		} else if (nav.to?.pathname === '/') {
			navMargin = 'auto';
			navWidth = '100%';
		}
	});
</script>

<div class="left-nav-container" style="height: 100%;">
	<ul class="left-nav">
		<li>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
				><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
					d="M575.8 255.5C575.8 273.5 560.8 287.6 543.8 287.6H511.8L512.5 447.7C512.5 450.5 512.3 453.1 512 455.8V472C512 494.1 494.1 512 472 512H456C454.9 512 453.8 511.1 452.7 511.9C451.3 511.1 449.9 512 448.5 512H392C369.9 512 352 494.1 352 472V384C352 366.3 337.7 352 320 352H256C238.3 352 224 366.3 224 384V472C224 494.1 206.1 512 184 512H128.1C126.6 512 125.1 511.9 123.6 511.8C122.4 511.9 121.2 512 120 512H104C81.91 512 64 494.1 64 472V360C64 359.1 64.03 358.1 64.09 357.2V287.6H32.05C14.02 287.6 0 273.5 0 255.5C0 246.5 3.004 238.5 10.01 231.5L266.4 8.016C273.4 1.002 281.4 0 288.4 0C295.4 0 303.4 2.004 309.5 7.014L564.8 231.5C572.8 238.5 576.9 246.5 575.8 255.5L575.8 255.5z"
				/></svg
			><a href="/">Home</a>
		</li>
		<li>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
				><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
					d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"
				/></svg
			><a href="/">Search</a>
		</li>
		<li>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
				><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
					d="M160 48C160 21.49 181.5 0 208 0H256V80C256 88.84 263.2 96 272 96H304C312.8 96 320 88.84 320 80V0H368C394.5 0 416 21.49 416 48V176C416 202.5 394.5 224 368 224H208C181.5 224 160 202.5 160 176V48zM96 288V368C96 376.8 103.2 384 112 384H144C152.8 384 160 376.8 160 368V288H208C234.5 288 256 309.5 256 336V464C256 490.5 234.5 512 208 512H48C21.49 512 0 490.5 0 464V336C0 309.5 21.49 288 48 288H96zM416 288V368C416 376.8 423.2 384 432 384H464C472.8 384 480 376.8 480 368V288H528C554.5 288 576 309.5 576 336V464C576 490.5 554.5 512 528 512H368C341.5 512 320 490.5 320 464V336C320 309.5 341.5 288 368 288H416z"
				/></svg
			><a href="/">Your Creations</a>
		</li>
		<li>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
				><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
					d="M50.73 58.53C58.86 42.27 75.48 32 93.67 32H208V160H0L50.73 58.53zM240 160V32H354.3C372.5 32 389.1 42.27 397.3 58.53L448 160H240zM448 416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V192H448V416z"
				/></svg
			><a href="/">New Creation</a>
		</li>
		<li>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
				><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
					d="M0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84.02L256 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 .0003 232.4 .0003 190.9L0 190.9z"
				/></svg
			><a href="/">Liked Creations</a>
		</li>
	</ul>
	<ul class:authNavPos class:signedOut class="nav-container" class:isPost>
		{#if windowWidth < 900}
			<ul
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

									if ($page?.url?.pathname === 'interact' || $page?.url?.pathname === 'learn') {
										setTimeout(() => {
										$reload();
									}, 50);
									}

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
				<!-- <li bind:clientWidth={profileDropSize}>
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
				</li> -->
			{:else}

						<li >
							<a
								href="."
								on:click|preventDefault={() => {
									console.log('sign in')
									authOption.set(0);
									showAuthModal.set(true);
							}}>
								Sign In
							</a>
						</li>
						<li>
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
						<li>
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
			
			{/if}
		{/if}
	</ul>
</div>

<style lang="scss">
	.left-nav {
		display: flex;
		list-style-type: none;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
		max-height: 220px;
		margin-block-start: 2rem;
		padding-inline-start: 1.4rem;

		li {
			display: flex;
			align-items: center;
			// justify-content: space-between;
			gap: 1rem;
			font-size: 14px;
			fill: #525058;

			&:hover {
				cursor: pointer;
			}
		}

		svg {
			width: 25px;
		}
	}

	.left-nav-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.nav-container {
		display: flex;
		list-style-type: none;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
		max-height: 220px;
		margin-block-start: 0;
		padding-inline-start: 0;

		li {
			padding-left: 2rem;
		}

		li a.nav-toggle {
			display: flex;
			justify-content: space-between;
			align-items: center;
			// color: var(--mainThemePrimaryTextColor) !important;
			.toggle-container {
				display: flex;
				width: 100px;
				justify-content: space-between;
				align-items: center;
				padding-right: 1rem;
			}

	
		}

		hr {
				width: 100%;
				height: 5px;
				box-sizing: border-box;
				border-style: none;
				background-color: var(--mainThemeBackgroundColor);
			}
	}

	:global(.auth-form.modal-auth) form {
		height: fit-content !important;
	}
</style>
