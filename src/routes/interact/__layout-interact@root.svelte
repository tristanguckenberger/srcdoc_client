<script>
	import { clientWidth, isDarkModeStore } from '$lib/stores/layoutStore';
	import Nav from '$lib/components/layout/Nav/index.svelte';
	import { session } from '$app/stores';
	let windowWidth;
	let pageContainerWidth;
	let leftPaneWidth;
	let userProfilePic;
	let authorProfilePic;
	let authPageRowSizeValue;

	$: clientWidth.set(windowWidth);

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
	<div id="nav-container">
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
</style>
