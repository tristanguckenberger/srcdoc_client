<script context="module">
	export async function load({ fetch }) {
		const urlPosts = '/api/post/getPosts.json';

		const res = await fetch(urlPosts, {
			method: 'GET'
		});
		const posts = await res.json();
		const postsBackup = posts.data;
		postList.set(posts.data);

		return {
			props: {
				posts,
				postsBackup
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/Card/index.svelte';

	// stores
	import { filters, refreshSwitch } from '$lib/stores/filterStore.js';
	import {
		currentPost,
		currentPostPage,
		isCreationStore,
		isPostStore,
		postList
	} from '$lib/stores/postStore';
	import { redirected, showAuthModal, showCollectives, showPosts } from '$lib/stores/layoutStore';
	import { collectivesList } from '$lib/stores/collectivesStore';
	import { showFilters } from '$lib/stores/filterStore.js';
	import { authOption } from '$lib/stores/authStore';
	import { post } from '$lib/api';
	import Login from './login.svelte';
	import Vote from '$lib/components/ui/Vote/index.svelte';
	import { changingPage, initialPostData, lockPageStore } from '$lib/stores/codeStore';
	import VoteCount from '$lib/components/ui/Vote/VoteCount.svelte';

	export let error = '';
	export let posts;
	export let postsBackup;

	let newPostMap = [];

	onMount(() => {
		initialPostData.set(null);
		// currentPost.set(null);
		// currentPostPage.set(null);
		lockPageStore.set(false);
		changingPage.set(false);
		if ($redirected) {
			setTimeout(() => {
				authOption.set(0);
				showAuthModal.set(true);
			}, 200);

			redirected.set(false);
		}

		showFilters.set(true);
		isPostStore.set(false);
		isCreationStore.set(false);
		let authComp = document.querySelector('.background-container');
		if (authComp) authComp.remove();
	});

	$: {
		if ($filters && $refreshSwitch === true) {
			newPostMap = [];
			posts.data = postsBackup;
			posts.data.filter((y) => {
				for (const filter in $filters) {
					$filters[filter].forEach((x) => {
						if (filter === 'skill-level') {
							if (y.hasOwnProperty('skillLevel') && y.skillLevel === x) {
								newPostMap = [...newPostMap, y];
							}
						} else if (filter === 'archive-status') {
							if (y.hasOwnProperty('archiveStatus') && y.archiveStatus === x) {
								newPostMap = [...newPostMap, y];
							}
						} else if (filter === 'post-type') {
							if (y.hasOwnProperty('postType') && y.postType === x) {
								newPostMap = [...newPostMap, y];
							}
						} else if (filter === 'tags') {
							if (y.hasOwnProperty('tags') && y.tags === x) {
								newPostMap = [...newPostMap, y];
							}
						}
					});
				}
			});

			if (newPostMap.length > 0) {
				posts.data = newPostMap;
			} else if ($filters != {} && newPostMap.length < 1) {
				posts.data = newPostMap;
			} else {
				posts.data = postsBackup;
			}
			setTimeout(() => {
				refreshSwitch.set(false);
			}, 200);
		} else if ($refreshSwitch === true) {
			posts.data = postsBackup;
		}
	}
	$: posts = $postList;
	$: collectives = $collectivesList ? JSON.parse(JSON.stringify($collectivesList)) : null;
</script>

{#if $showPosts}
	{#if posts}
		{#each posts?.data ? posts.data : posts as post, i (post.id)}
			{#if post.tag[0] === 'Creation'}
				<!-- <div class="card-container"> -->
				<Card
					link={`/interact/${post.id}`}
					image={`https://storage.googleapis.com/omni-thumbnails/${
						post.photo ? post.photo : 'not_found'
					}.png`}
				>
					<!-- <div slot="card-photo" /> -->
					<div slot="card-photo" class="content-cont">
						<a href="/interact/{post.id}">
							<!-- <div class="card-title">
								<h2>{post.title}</h2>
							</div> -->
						</a>
						<div class="card-content">
							<!-- <Vote itemID={post.id} isPost={true} /> -->
							<VoteCount itemID={post.id} isPost={true} />
							<div class="text-info">
								<div class="top-info">
									{post.tag[0] || 'No Tags'} by
									<a href="/profiles/{post.user}">{post.username}</a>
								</div>
							</div>
						</div>
					</div>
				</Card>
				<!-- </div> -->
				<!-- {:else}
				<div class="card-container">
					<Card
						link={`/collective/${post.collective}/${post.id}`}
						image={`https://storage.googleapis.com/omni-thumbnails/${
							post.photo ? post.photo : 'not_found'
						}.png`}
					>
						<div slot="card-photo" />
						<div slot="card-content" class="content-cont">
							<a href="/collective/{post.collective}/{post.id}">
								<div class="card-title">
									<h2>{post.title}</h2>
								</div>
							</a>
							<div class="card-content">
								<Vote itemID={post.id} isPost={true} />
								<div class="text-info">
									<div class="top-info">
										{post.tag[0] || 'No Tags'} by
										<a href="/profiles/{post.user}">{post.username}</a>
									</div>
								</div>
							</div>
						</div>
					</Card>
				</div> -->
			{/if}
		{/each}
	{/if}
{:else}
	<h2 style="color: red;">Unable to retrieve data</h2>
{/if}

<style lang="scss">
	.content-cont {
		height: 100%;
		justify-content: center;
		display: flex;
		flex-direction: column;
		// padding: 0 10px 0 10px;
	}
	.text-info {
		flex-grow: 5;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.card-content {
		display: flex;
		flex-direction: row-reverse;
		row-gap: 10px;
		column-gap: 1rem;
		align-items: stretch;
		// height: 100%;
	}
	.top-info {
		font-size: 13px;
		font-weight: 300;
		// background: var(--fadeAccent);
		padding: 5px;
		border-radius: 3px;
		font-weight: 600;

		a {
			color: #d730ac96;
			font-weight: 600;
		}
	}
	.card-title {
		/* padding-top: 10px; */
	}
</style>
