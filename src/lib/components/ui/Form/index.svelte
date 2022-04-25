<script lang="ts">
    import Button from "$lib/components/ui/Button/index.svelte";

    export let handle: any;
</script>

<form on:submit|preventDefault={handle} method="post">
    <div>
        <slot />
    </div>
</form>
