<script context="module">

	export async function load({ params, fetch }) {
        const userSlug = params.id;
        // console.log(userSlug);
		const url = `/api/user/getSingle/${userSlug}.json`;
        const postsURL = `/api/post/getAllPostsForUser/${userSlug}.json`;
        
        const res = await fetch(url, {
            method: "GET",
        });

        const user = await res.json();

        // if (!user) goto("/");
        profileStore.set(user.data);

        const postsRes = await fetch(postsURL, {
            method: "GET",
        });

        const posts = await postsRes.json();
        // console.log(posts);
        
        if (posts) postList.set(posts);

		return {
			props: {
			
                posts,
			}
		}
	}
</script>

<script>
    // Svelte Stuff
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";

    // Components
    import Card from '$lib/components/ui/Card/index.svelte';
    import Vote from '$lib/components/ui/Vote/index.svelte';

    // Stores
    import { filters, refreshSwitch } from '$lib/stores/filterStore.js';
    import { isCreationStore, isPostStore, postList } from '$lib/stores/postStore';
    import { showFilters } from '$lib/stores/filterStore.js';
    import { profileStore } from '$lib/stores/profileStore';
import { post } from '$lib/api';

    // Preload Props
    // export let user;
    export let posts;

    // Initial Declarations
    // let newPostMap = [];
    // $: posts = $postList;
    // $: console.log(posts);

    // Reactive Declarations & Statements
    // $: {
    //     if ($filters && $refreshSwitch === true) {
    //         newPostMap = [];
    //         posts.data.filter(y => {

    //             for (const filter in $filters) {

    //                  $filters[filter].forEach(x => {
                        
    //                     if (filter === "skill-level") {
 
    //                         if (y.hasOwnProperty("skillLevel") && y.skillLevel === x) {
    //                             newPostMap = [...newPostMap, y];
    //                         }
    //                     } else if (filter === "archive-status") {
    //                         if (y.hasOwnProperty("archiveStatus") && y.archiveStatus === x) {
    //                             newPostMap = [...newPostMap, y];
    //                         }
    //                     } else if (filter === "post-type") {
    //                         if (y.hasOwnProperty("postType") && y.postType === x) {
    //                             newPostMap = [...newPostMap, y];
    //                         }
    //                     } else if (filter === "tags") {
    //                         if (y.hasOwnProperty("tags") && y.tags === x) {
    //                             newPostMap = [...newPostMap, y];
    //                         }
    //                     }

    //                 });
    //             }
            
    //         });

    //         if (newPostMap.length > 0) {
    //             posts.data = newPostMap;
    //         } else if ($filters != {} && newPostMap.length < 1) {
    //             posts.data = newPostMap;
    //         } else {
    //             posts.data = postsBackup;
    //         }
    //         setTimeout(() => {
    //             refreshSwitch.set(false);
    //         }, 200);
    //     } else if ($refreshSwitch === true) {
    //         posts.data = postsBackup;
    //     }
    // }
    // $: posts = $postList;

    // Life Cycle Methods
    onMount(() => {
        // console.log(posts);
        showFilters.set(true);
        isPostStore.set(false);
        isCreationStore.set(false);
        // let authComp = document.querySelector('.background-container');
        // if (authComp) authComp.remove();
    });
</script>

{#if posts}
    {#each (posts?.data ? posts.data : posts) as post, i (post.id)}
        {#if post.tag[0] === 'Creation'}
            <div class="card-container">
                <Card link={`/creation/${post.id}`} image={`https://storage.googleapis.com/omni-thumbnails/${(post.photo ? post.photo : "not_found")}.png`}>
                    <div slot="card-photo">
                    </div>
                    <div slot="card-content" class="content-cont">
                        <a href="/creation/{post.id}">
                            <div class="card-title">
                                <h2>{post.title}</h2>
                            </div>
                        </a>
                        <div class="card-content">
                            <Vote itemID={post.id} isPost={true} />
                            <div class="text-info">
                            
                                <div class="top-info">
                                    {post.tag[0] || "No Tags"} by <a href="/profiles/{post.user}">{post.username}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        {:else}
            <div class="card-container">
                <Card link={`/collective/${post.collective}/${post.id}`} image={`https://storage.googleapis.com/omni-thumbnails/${(post.photo ? post.photo : "not_found")}.png`}>
                    <div slot="card-photo">
                    </div>
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
                                    {post.tag[0] || "No Tags"} by <a href="/profiles/{post.user}">{post.username}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        {/if}
    {/each}
{:else}
    howdy
{/if}

<style lang="scss">
    .content-cont {
        height: 100%;
        justify-content: center;
        display: flex;
        flex-direction: column;
        padding: 0 10px 0 10px;
    }
    .text-info {
        flex-grow: 5;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .card-content {
        display: flex;
        flex-direction: row;
        row-gap: 10px;
        column-gap: 1rem;
        align-items: stretch;
        // height: 100%;
    }
    .top-info {
        font-size: 13px;
        font-weight: 300;
        background: var(--fadeAccent);
        padding: 5px;
        border-radius: 3px;

        span, a {
            color: #d730ac96;
            font-weight: 600;
        }
    }
    .card-title {
        /* padding-top: 10px; */
    }
</style>