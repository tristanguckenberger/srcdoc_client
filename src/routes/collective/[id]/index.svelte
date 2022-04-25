<script context="module">
	export async function load({ params, fetch }) {
        if (params.id) {
            return {
                status: 302,
                redirect: "/"
            };
        }


        const collectiveSlug = params.id;
		const url = `/api/collective/getSingle/${collectiveSlug}.json`;
        const postsURL = `/api/post/getAllPostsForCollective/${collectiveSlug}.json`;
        const res = await fetch(url, {
            method: "GET",
        });

        const collective = await res.json();

        if (!collective) goto("/");

        const postsRes = await fetch(postsURL, {
            method: "GET",
        });

        const posts = await postsRes.json();
        if (posts) postList.set(posts);

		return {
			props: {
				collective,
                posts,
			}
		}
	}
</script>

<script>
    // Svelte Stuff
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    // Components
    import Card from '$lib/components/ui/Card/index.svelte';

    // Stores
    import { filters, refreshSwitch } from '$lib/stores/filterStore.js';
    import { isCreationStore, isPostStore, postList } from '$lib/stores/postStore';
    import { showFilters } from '$lib/stores/filterStore.js';

    // Preload Props
    export let collective;
    export let posts;

    // Initial Declarations
    let newPostMap = [];

    // Reactive Declarations & Statements
    $: {
        if ($filters && $refreshSwitch === true) {
            newPostMap = [];
            posts.data.filter(y => {

                for (const filter in $filters) {

                     $filters[filter].forEach(x => {
                        
                        if (filter === "skill-level") {
 
                            if (y.hasOwnProperty("skillLevel") && y.skillLevel === x) {
                                newPostMap = [...newPostMap, y];
                            }
                        } else if (filter === "archive-status") {
                            if (y.hasOwnProperty("archiveStatus") && y.archiveStatus === x) {
                                newPostMap = [...newPostMap, y];
                            }
                        } else if (filter === "post-type") {
                            if (y.hasOwnProperty("postType") && y.postType === x) {
                                newPostMap = [...newPostMap, y];
                            }
                        } else if (filter === "tags") {
                            if (y.hasOwnProperty("tags") && y.tags === x) {
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

    // Life Cycle Methods
    onMount(() => {
        showFilters.set(true);
        isPostStore.set(false);
        isCreationStore.set(false);
        let authComp = document.querySelector('.background-container');
        if (authComp) authComp.remove();
    });
</script>

{#if posts}
    {#each (posts.data) as post, i (post.id)}
        <a href="/collective/{post.collective}/{post.id}" class="card-container">
            <Card image={`https://picsum.photos/${(315 + i)}/150`}>
                <div slot="card-photo">
            
                </div>
                <div slot="card-content">
                    
                    <div class="card-content">
                        <div class="card-title">
                            <h2>{post.title}</h2>
                        </div>
        
                    </div>
                    <div class="top-info">
                        <span>{post.collectiveName}</span> | posted by <span>{post.username}</span>
                    </div>
                </div>
            </Card>
        </a>
    {/each}
{:else}
    <h2 style="color: red;">Unable to retrieve data</h2>
{/if}