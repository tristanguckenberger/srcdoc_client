<script context="module">
	export async function load({ fetch }) {
		const urlPosts = '/api/post/getPosts.json';

		const res = await fetch(urlPosts, {
			method: 'GET'
		});
		const posts = await res.json();
		postList.set(posts.data);

		return {
			props: {
				posts
			}
		};
	}
</script>

<script>
	// Svelte Stuff
	import { onMount } from 'svelte';

	// Stores
	import { isCreationStore, isPostStore, postList } from '$lib/stores/postStore';
	import { redirected, showAuthModal, showPosts } from '$lib/stores/layoutStore';
	import { showFilters } from '$lib/stores/filterStore.js';
	import { authOption } from '$lib/stores/authStore';
	import { changingPage, initialPostData, lockPageStore } from '$lib/stores/codeStore';

	// Components
	import Card from '$lib/components/ui/Card/index.svelte';
	import VoteCount from '$lib/components/ui/Vote/VoteCount.svelte';

	export let posts;

	onMount(() => {
		initialPostData.set({});
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

	$: posts = $postList ?? posts?.data;
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
			{:else}
				<Card
					link={`/learn/${post.id}`}
					image={`https://storage.googleapis.com/omni-thumbnails/${
						post.photo ? post.photo : 'not_found'
					}.png`}
				>
					<div slot="card-photo" class="content-cont">
						<div class="card-content">
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
