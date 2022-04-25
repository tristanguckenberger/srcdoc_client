<script context="module">
     import { isPostStore, currentPostPage, currentPost, postDetailStarter, thumbnailStore} from "$lib/stores/postStore";
     import Post from '$lib/classObjects/post';
    
     export async function load({ params }) {
        isPostStore.set(true);
        showCreationModal.set(false);
        let postOBJ = new Post('Add a post title...', 'Add a post description...');
        postOBJ.addPage(0, 'Page 1...');
        const collectiveID = params.id;
        const postSlug = params.post;
        currentPost.set(postOBJ);
        currentPostPage.set(postOBJ.pages[0]);

        return {
            props: {
                postOBJ,
                collectiveID
            }
        }
    }
</script>
<script>
    import { onMount, tick } from 'svelte';
    import { htmlStore, cssStore, jsStore, codeToSave, changingPage, triggerReset, lockPageStore } from '$lib/stores/codeStore.js';
    import { post as postUtil } from '$lib/utils.js';
    import { navigating, session } from "$app/stores";
    import { goto } from "$app/navigation";
    import Button from '$lib/components/ui/Button/TextButton.svelte';
    import { slide, fade } from 'svelte/transition';
import { showCreationModal } from "$lib/stores/modalStore";

    export let posts;
    export let projects;
    export let postOBJ;
    export let collectiveID;

    // console.log(postOBJ);

    $: post = $currentPost;


    // THE BELOW CRASHES EVERYTHING WHEN NAVIGATING AWAY FROM THE PAGE
    $: $currentPostPage && $currentPost, updateCurrentPageId();

    const updateCurrentPageId = () => {
        if ($lockPageStore === false) {
            let currentPageID = $currentPostPage && $currentPostPage !== {} ? $currentPostPage.id : $currentPost ? $currentPost.currentPageID : 0;
            if ($currentPost) {
                $currentPost.currentPageID = currentPageID;
            }
        }
        
    }

    // USE THIS INSTEAD??
    // $: $currentPostPage, $currentPost.currentPageID = 
    //     $currentPostPage && $currentPostPage !== {} ? 
    //     $currentPostPage.id : $currentPost.currentPageID ;


    onMount(() => {
        showCreationModal.set(false);
        if (!post) {
            post = new Post('TITLE', 'BLURB');
            post.addPage('test')
            currentPost.set(post);
            currentPostPage.set($currentPost.pages[0]);
        }
        isPostStore.set(true);
        // $currentPostPage.setCode("typescript", "");
        // $currentPostPage.setCode("css", "");
        // $currentPostPage.setCode("html", "");
        if ($currentPostPage) {
            htmlStore.set($currentPostPage.html);
            cssStore.set($currentPostPage.css);
            jsStore.set($currentPostPage.js);
        }
    });

    const createPost = async () => {
        const url = "../../api/post/createNewPost.json";
        let CID = collectiveID;
        let title = currentPostTitle;
        let text = currentPostBlurb;
        let photo = $thumbnailStore ? $thumbnailStore : null;

        try {
            const response = await postUtil(url, { 
                CID, 
                title,
                text,
                photo,
                selectedTag
            });

            if (response.status !== 200) return;
            let res = await response.json();
            createProjects(res.data.id);

        } catch (error) {
            console.log(error);
        }
        
    };
    const createProjects = async (PID) => {
        const url = "../../api/project/createNewProject.json";
        
        let pageData = $currentPost.pages.map(page => {
            let updatedPage = {...page};
            updatedPage.text = page.description;
            delete updatedPage.description;
            return updatedPage;
        });

        try {
            const response = await postUtil(url, {
                pageData,
                PID,
            });

            if (response.status !== 200) return;
            lockPageStore.set(true);
            changingPage.set(true);
            goto("/");
        } catch (error) {
            console.log(error);
        }
    };
    const newPage = () => {
        tick();
        savePage();
        $currentPost.addPage('text');
        // $currentPost.currentPageID = $currentPost.pages.length;
        currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
        triggerReset.set(true);
    };
    const savePage = () => {
        tick();
        $currentPost.pages[$currentPost.currentPageID - 1].setTitle(page.title);
        $currentPost.pages[$currentPost.currentPageID - 1].setText(page.description);
        currentPost.set($currentPost);
        currentPostPage.set($currentPost.pages[$currentPost.currentPageID - 1]);
        currentPost.set($currentPost);
    };
    const deletePage = () => {
        tick();
        $currentPost.removePage($currentPost.currentPageID);
        currentPostPage.set($currentPost.pages[$currentPost.pages.length - 1]);
        triggerReset.set(true);
        
    };


    let page;
    $: {
        page = $currentPostPage;
    };

    $: if ($codeToSave && $changingPage === false) {
        if (post && post.hasOwnProperty('pages') && $currentPost && $currentPost.pages) {
            $currentPost.pages[$currentPost.currentPageID - 1].setCode($codeToSave[0].type, $codeToSave[0].source);
            $currentPost.pages[$currentPost.currentPageID - 1].setCode($codeToSave[1].type, $codeToSave[1].source);
            $currentPost.pages[$currentPost.currentPageID - 1].setCode($codeToSave[2].type, $codeToSave[2].source);

            let newPost = $currentPost.pages[$currentPost.currentPageID - 1];

            currentPostPage.set(newPost);
        }
    }

    let tags = [
        { id: 1, text: `Q&A` },
        { id: 2, text: `Tutorial` },
        { id: 3, text: `PSA` },
        { id: 4, text: `Request` },
    ];
    let selectedTag = $postDetailStarter.tag;

    let currentPage;
    $: currentPage = $currentPostPage;
    let currentPostTitle = "";
    let currentPostBlurb = "";

    let textAreaGrowContainer;

    // $: console.log($thumbnailStore);

    $: if (currentPostBlurb && currentPostBlurb.length >= 260) {
        let characters = currentPostBlurb.split('');
        characters.pop();
        currentPostBlurb = [...characters].join('');
    }

    $: if (currentPostTitle && currentPostTitle.length >= 100) {
        let characters = currentPostTitle.split('');
        characters.pop();
        currentPostTitle = [...characters].join('');
    }
    let showPostDetails = false;

</script>


<div class="post-content">
    <label for="">
        <h3 style="font-weight: 500;" on:click={() => {
            showPostDetails = !showPostDetails;
        }}>
            Post Details
            <span>
                {#if showPostDetails}
                -
                {:else}
                +
                {/if}
            </span>
        </h3>
    </label>
    {#if showPostDetails}
    <div class="post-details" in:slide="{{delay: 0, duration: 100}}" out:slide="{{delay: 100, duration: 150}}">
        <label for="page-text">
            <span>Post Title</span>
        </label>
        <input type="text" bind:value={currentPostTitle} name="title" placeholder="Add post title..." />
        <br>
        <br>
        <label for="page-text">
            <span>Post Description</span>
        </label>
        <textarea class="description-body" name="postText" placeholder="Add post description..." bind:value={currentPostBlurb} />
        <br>
        <br>
        <label>
            <select bind:value={selectedTag}>
              {#each tags as tag}
                <option value={tag}>{tag.text}</option>
              {/each}
            </select>
        </label>
    </div>
    {/if}
    <hr class:showPostDetails>
    <label for="page-title">
        <span>Page Title</span>
        {#if page}
            <input type="text" bind:value={page.title} name="page-title" />
        {/if}
    </label>
    <br>
    <label for="page-text">
        <span>Page Body</span>
    </label>
    <div class="grow-wrap" bind:this={textAreaGrowContainer}>
        {#if page}
            <textarea name="page-text" placeholder="Page body..." bind:value={page.description} on:input={() => {
                textAreaGrowContainer.dataset.replicatedValue = page.description;
            }}/>
        {/if}
    </div>


    
    <div class="post-control-bar">
        <div class="format-controls">
            <div class="control insert">
                +
            </div>
            

        </div>
        <Button name={"Add Page"} cssClass="blue" onClickFunc={newPage} />
            <Button name={"Save Page"} cssClass="blue" onClickFunc={savePage} />
            <Button name={"Delete Page"} cssClass="blue" onClickFunc={deletePage} />
        <div class="controls">
            <!-- <button on:click={createPost}>Post</button> -->
            
            <Button name={"Post"} cssClass="blue" onClickFunc={createPost} />
        </div>
    </div>

</div>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');
    .post-content {
        max-width: 750px;
        min-width: 350px;
        margin: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        height: calc(100% - 2rem);
    }
    .grow-wrap {
        display: grid;
        max-height: 100%;
        min-height: 200px;
    }
    .grow-wrap::after {
        /* Note the weird space! Needed to preventy jumpy behavior */
        content: attr(data-replicated-value) " ";

        /* This is how textarea text behaves */
        white-space: pre-wrap;

        /* Hidden from view, clicks, and screen readers */
        visibility: hidden;
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        resize: none;
        height: 100%;
        border: 0px solid black;
        padding: 0.5rem;
        font: inherit;
        grid-area: 1/1/2/2;
        height: 100%;
        max-height: calc(100%);
        box-sizing: border-box;
    }

    .grow-wrap > textarea,
    .grow-wrap::after {
        border: 2px solid #52505814;
        border-bottom: none;
        padding: 0.5rem;
        font: inherit;
        grid-area: 1/1/2/2;
        height: 100%;
        max-height: calc(100%);
        box-sizing: border-box;
        overflow: auto;
        background-color: var(--mainThemePanelAreaColor);
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
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
    :global(pre code) {
        font-family: 'Roboto Mono', monospace;
    }
    :global(#split-0) {
        overflow-y: hidden !important;
        padding-left: 0 !important;
    }
    .post-control-bar {
        padding: 6px;
        border-radius: 6px;
        height: 36px;
        background-color: #ffffff;
        font-size: 16px;
        box-shadow: 0 1px 6px 0px #bebebe40;
        display: flex;
        justify-content: space-between;
        min-height: 36px;

        .format-controls {
            .control {
                &.insert {
                    font-size: 2rem;
                    font-weight: 200;
                    line-height: 2rem;
                    height: 2rem;

                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }

        .controls {
            // display:
            :global(button.blue) {
                z-index: 10000;
                background-color: #198BFF;
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
        }
    }
    
    hr {
        width: 100%;
        height: 10px;
        min-height: 10px;
        background-color: var(--mainThemeBackgroundColor);
        border-style: none;
        border-radius: 3px;
        margin: 2rem 0;
        margin-top: 0;
        transition: all .2s ease;
    }
    hr.showPostDetails {
        margin-top: 2rem;
    }
    .description-body {
        height: 200px;
        min-height: 200px;
        border: 2px solid #52505814;
        border-radius: 6px;
    }
    label {
        display: flex;
        flex-direction: column;
        span {
            color: #525058;
            font-weight: 500;
            padding-bottom: 3px;
        }
    }
    input {
        color: #525058;
        background: #fbfbfb;
        font-size: 16px;
        border: 2px solid #52505814;
        font: inherit;
        padding: 5px;
        outline: inherit;
        background-color: rgb(255, 255, 255, 0.9);
        border-radius: 6px;
        height: 30px;
    }
    
</style>