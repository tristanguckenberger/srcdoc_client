<script context="module">
  export async function load({ params, fetch }) {
    const collectiveSlug = params.id;
    const url = `/api/collective/getSingle/${collectiveSlug}.json`;
    const postsURL = `/api/post/getAllPostsForCollective/${collectiveSlug}.json`;

    const res = await fetch(url, {
      method: 'GET'
    });

    const collective = await res.json();

    if (!collective) goto('/');

    const postsRes = await fetch(postsURL, {
      method: 'GET'
    });

    const posts = await postsRes.json();
    if (posts) postList.set(posts);

    return {
      props: {
        collective,
        posts
      }
    };
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
  export let posts;

  // Initial Declarations
  let newPostMap = [];

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
  {#each posts.data as post, i (post.id)}
    <a href="/collective/{post.collective}/{post.id}" class="card-container">
      <Card image={`https://picsum.photos/${315 + i}/150`}>
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
