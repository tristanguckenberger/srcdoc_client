<script lang="ts">
import { showAuthModal, showPreferences } from "$lib/stores/layoutStore";
import { showCreationModal } from "$lib/stores/modalStore";

    export let showEditorSettings:boolean;
    export let showUserEditModal:boolean;
    export let isCustomModal: boolean;
    export let isAuth: boolean;
    export let isSignUp: boolean;
    export let modalCreationBool: boolean;

    const handleClick = (event) => {
        if (event.target.classList.contains('modal-container')) {
            showAuthModal.set(false);
            showPreferences.set(false);
            showCreationModal.set(false);
            showEditorSettings = false;
            showUserEditModal = false;
            modalCreationBool = false;
        };
        
    };

    let itemSelection = 0;

</script>
<svelte:window on:click={(e) => {handleClick(e)}}/>
<div class="modal-container">
    <div class="modal" class:isCustomModal class:isAuth class:isSignUp>
        {#if isCustomModal}
            <slot name="custom_modal"/>
        {:else}
            <nav class="menu-selection">
                <ul>
                    <li class="selection-item" on:click="{() => {itemSelection = 0;}}">General</li>
                    <li class="selection-item" on:click="{() => {itemSelection = 1;}}">Editor</li>
                </ul>
            </nav>
            <div class="item-grid">

                {#if itemSelection === 0}
                    <div class="item">
                        <span>Layout Selection</span>
                        <slot name="toggle" />
                    </div>
                {:else}
                    <span>Code stuff</span>
                {/if}
            </div>
        {/if}
       
    </div>
</div>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
    .modal-container {
        position: absolute;
        margin: 10px;
        margin-top: 20px;
        border-radius: 6px;
        z-index: 10000000000000000000000000000000000000000000000;
        width: calc(100% - 20px);
        min-height: calc(100vh - 78px);
        top: 48px;
        /* background-color: #5250580f; */
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal {
        position: relative;
        width: 50vw;
        height: 55vh;
        background-color: var(--mainThemeBackgroundColor);
        border-radius: 6px;
        display: grid;
        /* box-shadow: 1px 1px 2px 2px #3434340a; */
        grid-template-columns: 1fr 15px 3fr;
        grid-gap: 1rem;

        box-shadow: 0px 0px 4px 0px var(--boxShadowColor);
    }
    .item-grid {
        width: 100%;
        grid-column: 3;
        border-bottom-right-radius: 6px;
        -webkit-border-bottom-right-radius: 6px;
        border-top-right-radius: 10px;
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        grid-gap: .5rem;
    }
    .item {
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        grid-gap: 1rem;
        max-height: 100px;
    }
    .selection-item {
        list-style: none;
    }
    .selection-item:hover {
        cursor: pointer;
        color: #5250588c;
    }
    .menu-selection ul {
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        grid-gap: 1rem;
        padding: 2rem 0 0 3rem;
    }
    .menu-selection ul:hover {
        cursor: pointer;
    }
    .menu-selection ul li{
        text-align: left;
        font-size: 1.4em;
        padding: 0 0 0 1rem;
        color: var(--mainThemePrimaryTextColor);
        font-weight: 400;
        font-family: 'Inter', sans-serif;
        transition: all 200ms cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    .isCustomModal.isAuth {
        /* background: linear-gradient(-60deg, #c21997 0%, #4f19c2 100%) !important; */
    }
    .modal.isCustomModal {
        display: unset !important;
        width: 30vw;
        overflow: hidden;
    }

    .modal.isCustomModal.isAuth {
        display: unset !important;
    }
    :global(.wavesBG::after) {
        content: '';
        display: inline-block;
        cursor: pointer;
        width: 100%;
        height: 50px;
        background-color: var(--mainThemeBackgroundColor) !important;
    }

    @media screen and (min-width: 900px) {
        .modal.isAuth {
            width: 510px;
            height: 706px;
        }
        .modal.isAuth.isSignUp {
            width: 510px;
            height: 710px;
        }
    }
</style>