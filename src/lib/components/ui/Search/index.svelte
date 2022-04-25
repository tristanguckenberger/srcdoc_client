<script>
    import Input from '$lib/components/ui/Input/index.svelte';
    let query;
</script>
<div class="search-input-container">
    <Input
        inputClass={"search"}
        type={"search"}
        name={"search"}
        placeholder={"Search"}
        bind:value={query}
        required={true}
    />
</div>
<style lang="scss">
    :global(div .search) {
        width: 100%;
        display: inline-block;
        text-align: start;
        cursor: text;
        margin: 0em;
        padding: 10px;
        border: none;
        border-style: none;
        border-image: none;
        border-radius: 6px;
        height: 100%;
        font-size: 16px;
        color: var(--mainThemePrimaryTextColor);
    }
    :global(:focus-visible) {
        outline: none;
    }
    .search-input-container {
        height: calc(100% - 20px);
        border-radius: 6px;
        overflow: hidden;
        :global(input) {
            background-color: var(--mainThemePanelColor);
        }
    }


    :global(.search)::placeholder {
        color: var(--mainThemeFadedTextColor);
    }  
</style>