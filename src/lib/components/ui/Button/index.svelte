<script lang="ts">
    export let name: string = "";
    export let cssClass: string = "";
</script>
<button type="submit" class={cssClass}>
    {name}
</button>
<style lang="scss">
    button {
        z-index: 10000;
        background-color: #c21997;
        font-weight: bold;
        height: 30px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        padding-right: 10px;
        font-family: Karla, sans-serif;
        color: #ffffff;
        border-radius: 4px;
        padding: 5px;
        border: none;
        box-sizing: content-box;
        justify-content: center;
        font-size: .9em;

        &:focus {
            outline: inherit;
        }
        &:hover {
            // background-color: #4a64bc !important;
            cursor: pointer;
        }
    }
    @media screen and (max-width: 900) {
        button {
            height: 40px !important;
        }
    }
</style>
