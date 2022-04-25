<script>
  import { onMount } from 'svelte';
  import {
    changingPage,
    cssStore,
    htmlStore,
    initialPostData,
    jsStore,
    localCodeStoreCSS,
    localCodeStoreHTML,
    localCodeStoreJS,
    projectStore
  } from '$lib/stores/codeStore';
  import {
    currentPost,
    currentPostPage,
    currentPostPageId,
    currentPostPageRevert
  } from '$lib/stores/postStore';
  import NewComment from '../Comment/NewComment.svelte';
  import { session } from '$app/stores';
  import UpdateComment from '../Comment/updateComment.svelte';
  import Vote from '$lib/components/ui/Vote/index.svelte';

  export let expanded = false;
  export let postComment;
  export let name;
  export let mods;
  export let slug;
  export let isPostPage = false;
  export let fetchComments;

  const setRepl = async (id) => {
    const url = `../../api/project/getAllProjectsForComment/${id}.json`;

    try {
      const response = await fetch(url, {
        method: 'GET'
      });

      let res = await response.json();

      const commentCode = res.data.map((x) => {
        let components;
        const rBody = x.replBody;
        if (
          typeof rBody != 'undefined' &&
          rBody.hasOwnProperty('files') &&
          typeof rBody.files != 'undefined'
        ) {
          components = Object.keys(rBody.files).map((key) => {
            const n = rBody.files[key].name;
            const joinerIndex = n.indexOf('.');
            const type = n.includes('.') ? n.slice(joinerIndex + 1, n.length) : n;
            const name = n.includes('.') ? n.slice(0, joinerIndex) : 'index';
            const s = rBody.files[key].source;
            const source = s.replace(/&lt;/gi, '<') || '';
            return {
              type,
              name,
              source
            };
          });
        }

        let html;
        let css;
        let js;
        let id = x.id;
        let pid = x.post;

        components.forEach((x) => {
          if (x.type === 'html') {
            html = {
              source: x.source,
              type: 'html'
            };
          }
          if (x.type === 'css') {
            css = {
              source: x.source,
              type: 'css'
            };
          }
          if (x.type === 'typescript') {
            js = {
              source: x.source,
              type: 'typescript'
            };
          }
        });

        return {
          id,
          pid,
          pageTitle: x.title,
          description: res.count > 1 ? x.description : '',
          html,
          css,
          js
        };
      });

      if (commentCode) {
        projectStore.set(commentCode);

        currentPostPageRevert.set(JSON.parse(JSON.stringify($currentPostPage)));

        setTimeout(() => {
          htmlStore.set(commentCode[0].html);
          cssStore.set(commentCode[0].css);
          jsStore.set(commentCode[0].js);
          changingPage.set(true);
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetPost = () => {
    currentPost.set($initialPostData);
    htmlStore.set($currentPostPageRevert.html);
    cssStore.set($currentPostPageRevert.css);
    jsStore.set($currentPostPageRevert.js);

    changingPage.set(true);
  };

  $: comments = postComment;
  $: userProfilePic = `https://storage.googleapis.com/omni-thumbnails/${
    $session?.user?.photo || $session?.photo
  }.png`;
</script>

{#if comments}
  {#if comments.hasOwnProperty('length') && comments.length > 0}
    {#each comments as item, i (item.id)}
      <div
        class="reply {item.hasOwnProperty('root') && item.root === true
          ? 'parentReply'
          : 'childReply'}"
        style="
        width: calc(100% - 5px); float: right;
    
        "
      >
        <div class="info_left">
          {#if item.photo && item.photo !== 'no-photo.jpg'}
            <img
              class="avatar"
              src={'https://storage.googleapis.com/omni-thumbnails/' + item.photo + '.png'}
              alt="profile pic"
            />
          {:else}
            <img class="avatar" src="https://picsum.photos/30" alt="profile pic" />
          {/if}
          <div
            class="guides"
            on:click={() => {
              item.replyToggle = !item.replyToggle;
            }}
          >
            <div class="line" />
          </div>
        </div>

        <div class="info_container">
          <a href="/profiles/u/{item.user}">
            {#if item.user.toString() === '000000000000000000000000'}
              <span class="info">@deleted</span>
            {:else}
              <span class="info">@{item.username}</span>
            {/if}
          </a>

          <!-- {#if item.isMember}<span class="isMember">member</span>{:else}
                <span class="isMember">not member</span>
            {/if} -->
          <span
            class="hide"
            on:click={() => {
              item.replyToggle = !item.replyToggle;
              //   selectedItem = item._id;
            }}
          >
            {#if item.replyToggle}
              Show
            {:else}
              Hide
            {/if}
          </span>
          {#if !item.replyToggle}
            <div class="post_cont_container">
              <div
                class:updateToggle={item.editToggle}
                class="post_cont_container"
                class:replyHighlight={item.newReplyToggle === true}
              >
                <div class="post_cont">
                  {#if item.editToggle === true}
                    {#if $session}
                      <br />
                      <UpdateComment
                        comment={item}
                        setCode={setRepl}
                        bind:editing={item.editToggle}
                      />
                      <br />
                    {/if}
                  {:else}
                    <p class="reg_text" style="">{item.text}</p>
                  {/if}
                </div>

                <!-- testing -->
                <!-- {#if $session.token}
                            <hr class="postDivider" />
                        {/if} -->
                <ul class="commentMenu">
                  <!-- {#if $session.token} -->
                  <li class="vote">
                    <Vote itemID={item.id} isPost={false} />
                  </li>
                  <li>
                    <button
                      class="showRepl custom-button"
                      on:click={() => {
                        // if (item.newReplyToggle === true) {
                        // newReplyStore.set("");
                        // }
                        // if ($width < 768) {
                        // if (item.newReplyToggle === true) {
                        //     item.newReplyToggle = false;
                        // }
                        // item.newReplyToggle = !item.newReplyToggle;
                        //     isNewCommentBooleanStore.set(false);

                        // }

                        item.newReplyToggle = !item.newReplyToggle;
                        // if ($width < 768) {
                        // isNewReplyBooleanStore.set(!$isNewReplyBooleanStore);
                        // passNewReplyData(item.newReplyToggle, slug, $user.uid, item._id, mods);
                        // }
                        // selectedItem = item._id;
                        // if (item.newReplyToggle === true) {
                        //   dispatch("new_reply_open", {
                        //     text: "the new reply text box is open",
                        //   });
                        // }
                      }}
                    >
                      <!-- {#if $width < 768}
                                    {#if item.newReplyToggle === true && $isNewReplyBooleanStore === true}
                                    Cancel Reply
                                    {:else}
                                    Reply
                                    {/if}
                                {:else} -->
                      {#if item.newReplyToggle === true}
                        Cancel Reply
                      {:else}
                        Reply
                      {/if}
                      <!-- {/if} -->
                    </button>
                  </li>

                  {#if $session}
                    <li>
                      <button
                        class="showRepl custom-button"
                        on:click={() => {
                          item.editToggle = !item.editToggle;
                          // selectedItem = item._id;
                        }}
                      >
                        {#if item.editToggle === true}
                          Cancel Edit
                        {:else}
                          Edit
                        {/if}
                      </button>
                    </li>
                  {/if}

                  <!-- <li>
                                {#if $user.uid === item.user}
                                <DeleteReply PID={slug} CID={item._id} {mods} />
                                {/if}
                            </li> -->
                  <!-- {#if item.user !== "000000000000000000000000"} -->

                  <!-- {/if} -->
                  <!-- {/if} -->
                  {#if item.hasOwnProperty('withRepl') && item.withRepl === true}
                    <li>
                      <button
                        class="showRepl custom-button"
                        on:click={() => {
                          setRepl(item.id);
                        }}
                      >
                        View Code
                      </button>
                    </li>
                  {/if}
                </ul>

                <div class="reply_indent">
                  {#if item.newReplyToggle === true}
                    <NewComment
                      postId={$currentPost.id}
                      parentId={item.id}
                      tag={['Reply']}
                      on:commentPosted={() => {
                        fetchComments();
                      }}
                    />
                  {/if}

                  {#if item.hasOwnProperty('children')}
                    <svelte:self {mods} postComment={item.children} {slug} {fetchComments} />
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      no comments found
    {/each}
  {/if}
{/if}

<style>
  .reply {
    margin-bottom: 30px;
    padding-top: 0px;
    padding-bottom: 0px;
    display: flex;
  }
  .reply_indent {
    width: calc(100% - -35px);
    float: right;
    height: 100%;
    margin-top: 30px;
  }
  .commentMenu {
    display: flex;
    flex-wrap: wrap-reverse;
    justify-content: flex-start;
    padding: 0 10px;
    margin: 0;
    grid-gap: 10px;
  }
  li {
    display: block;
  }
  .post_cont p {
    color: var(--mainThemePrimaryTextColor);
    padding: 0 14px;
  }
  span {
    color: #00000096;
    font-size: 16px;
    font-style: italic;
  }
  .showRepl {
    position: relative;
  }
  .showRepl:hover {
    cursor: pointer;
  }
  .showRepl label {
    background: #a5d6a7;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
  .showRepl label:hover {
    cursor: pointer;
  }
  .getRepl {
    background: red !important;
    color: #111111;
  }
  .hidden {
    opacity: 0;
    position: absolute;
  }
  .isMember {
    font: inherit;
    background: #000000;
    line-height: 1em;
    color: #ffffff;
    padding: 4px;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Karla', sans-serif;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
  .custom-button {
    z-index: 10000;
    background: transparent;
    font-weight: 600;
    height: 40px;
    display: flex;
    align-items: center;
    color: var(--body_text_color);
    border-radius: 3px;
    border: none;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  .custom-button:focus {
    outline: inherit;
  }
  .custom-button:hover {
    cursor: pointer;
    color: #12121275;
  }
  .post_cont_container {
    /* border: 1px solid hsl(0deg 0% 31%);
      border-radius: 3px;
      background-color: var(--feed_bgColor); */
    background-color: var(--mainThemePanelAreaColor);
    padding: 5px;
    border-radius: 6px;
    /* background-color: hsl(261deg 2% 24%); */
    margin-top: 5px;
  }
  .updateToggle {
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    border: none;
  }
  .commentMenu li {
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  .commentMenu li:hover {
    color: #12121275;
    cursor: pointer;
  }
  .avatar {
    display: flex;
    height: 30px;
    width: 30px;
    border-radius: 3px;
    background-color: #121212;
    position: relative;
    top: -5px;
  }
  .info_container {
    margin-left: 30px;
    flex: 1;
  }
  .info_left {
    flex-direction: column;
    display: flex;
    margin-right: -10px;
  }
  .guides {
    width: 15px;
    background-color: transparent;
    height: 10px;
    text-align: center;
    margin: auto;
    flex: 1;
    flex-direction: column;
    display: flex;
    /* z-index: 1000000000; */
  }
  .guides:hover {
    cursor: pointer;
  }

  .guides:hover > .line {
    background-color: var(--mainThemeAccentHoverColor);
  }
  .line {
    width: 2px;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    background: var(--mainThemeAccentColor);
    height: 10px;
    text-align: center;
    margin: auto;
    flex: 1;
  }
  .hide {
    z-index: 10000;
    background: transparent;
    font-weight: 600;
    font-style: normal;
    color: var(--post_text_sample);
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    font-size: 0.83em;
  }
  .hide:hover {
    color: var(--body_text_color);
    cursor: pointer;
  }
  .postDivider {
    height: 2px;
    background: var(--pd_bg);
    border: none;
    margin-block-end: 0px;
    margin-inline-start: 15px;
    margin-inline-end: 15px;
  }
  .vote {
    display: flex;
    align-items: center;
    position: relative;
    top: 2px;
  }

  /* @media (max-width: 768px) {
      .avatar {
        display: none;
      }
    } */
  .info {
    font: inherit;
    line-height: 1em;
    color: var(--user_text_info);
    padding: 4px;
    font-size: 12px;
    font-weight: 600;
    /* font-family: "Karla", sans-serif; */
  }
  .post_cont_container.replyHighlight {
    background: hsl(47deg 100% 89%);
  }
  .post_cont_container.replyHighlight .reg_text {
    color: var(--mainThemePrimaryTextColor);
  }
</style>
