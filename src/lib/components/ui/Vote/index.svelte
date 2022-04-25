<script lang="ts">
import { afterUpdate, onMount } from "svelte";
import { get as getUtil, post as postUtil } from '$lib/utils';

    export let itemID: string;
    export let isPost: boolean;
    let count:number = 0;

    const createVote = async (tag) => {
        const url = `../../api/vote/createVote.json`;
        await postUtil(url, {
            itemID,
            isPost,
            tag
        }).then(() => {
            getCurrentVote();
        })
    }

    const getCurrentVote = async () => {
        const url = `../../api/vote/getVoteCount/${itemID}.json`;
        const response = await getUtil(url);
        let res = await response.json();
        count = res.data;
    }

    onMount(() => {
        getCurrentVote();
    });

    afterUpdate(() => {
        getCurrentVote();
    });
</script>

<div class="vote-container">
    <span class="no-selection" on:click={() => {createVote(["Positive"])}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="upvote" d="M7 15C7 15.5523 7.44772 16 8 16C8.55228 16 9 15.5523 9 15L7 15ZM8.70711 0.292893C8.31658 -0.0976314 7.68342 -0.0976315 7.29289 0.292893L0.928933 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 15L9 1L7 1L7 15L9 15Z" fill="#ffffff"/>
        </svg>
            
    </span>
    <span class="no-selection">{count}</span>
    <span class="no-selection" on:click={() => {createVote(["Negative"])}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="downvote" d="M9 1C9 0.447715 8.55228 2.41411e-08 8 0C7.44772 -2.41411e-08 7 0.447715 7 1L9 1ZM7.29289 15.7071C7.68342 16.0976 8.31658 16.0976 8.70711 15.7071L15.0711 9.34315C15.4616 8.95262 15.4616 8.31946 15.0711 7.92893C14.6805 7.53841 14.0474 7.53841 13.6569 7.92893L8 13.5858L2.34315 7.92893C1.95262 7.53841 1.31946 7.53841 0.928932 7.92893C0.538407 8.31946 0.538407 8.95262 0.928932 9.34315L7.29289 15.7071ZM7 1L7 15L9 15L9 1L7 1Z" fill="#ffffff"/>
        </svg>            
    </span>
</div>

<style lang="scss">
    .vote-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: row;
        width: 80px;
        padding: 3px 0 0 6px;

        span:hover {
            cursor: pointer;
        }
    }
    svg path {
        fill: var(--mainThemePrimaryTextColor);
        transition: all 150ms ease;
    }
    svg:hover > path.upvote {
        fill: #198BFF;
    }
    svg:hover > path.downvote {
        fill: #d730ac96;
    }
</style>