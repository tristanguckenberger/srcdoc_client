<script lang="ts">
    export let name: string = "";
    export let cssClass: string = "";
    export let onClickFunc: any;
</script>
<button class={cssClass} on:click|preventDefault={() => {onClickFunc()}}>
    {name}
</button>
<style lang="scss">
    button {
        z-index: 10000;
        background-color: transparent;
        font-weight: 600;
        height: 30px;
        display: flex;
        align-items: center;
        font-family: Karla, sans-serif;
        color: #525058a8;
        padding: 5px;
        border: none;
        box-sizing: content-box;
        justify-content: left;
        font-size: .9rem;

        &:focus {
            outline: inherit;
        }
        &:hover {
            // background-color: #4a64bc !important;
            cursor: pointer;
        }
    }
</style>
