<script lang="ts">
    import { clearSplit, splitStore } from '$lib/stores/splitStore';

    export let toggle:boolean;
    export let notLayoutToggle = false;
</script>
<div class="toggle-clicker-container">
    <div class="toggle_clicker" class:toggle on:click={() => {
        toggle = !toggle;
        if (!notLayoutToggle) clearSplit.set(true);
        }}>
        <div class="toggle_wrapper">
            <div class="toggle_cir" class:toggle>
              
            </div>
          </div>
    </div>
</div>


<style>
    .toggle-clicker-container {
        border-radius: 25px;
        overflow: hidden;
        height: 30px;
        width: 60px;
    }
    .toggle_clicker {
        position: relative;
        background-color: var(--mainThemeBackgroundColor);
        padding: 0 0.5rem;
        display: flex;
        font-family: Karla, sans-serif;
        color: #ffffff;
        font-weight: bold;
        width: 100%;
        height: 100%;
    }
    .toggle_clicker.toggle {
        color: #ffffff;
    }
    .toggle_clicker.toggle .toggle_wrapper {
        transform: translateX(calc(100% - 47px));
        -webkit-transform: translateX(calc(100% - 47px));
    }

    .toggle_clicker.toggle .toggle_cir {
        /* background: #198BFF; */
    }
    .toggle_wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        transition: all 300ms cubic-bezier(0.45, 0.62, 0, 1.07);
        display: flex;
        top: 0;
        left: 0;
        align-items: center;
    }
    .toggle_clicker:hover {
        cursor: pointer;
    }
    .toggle_cir {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background-color: var(--mainThemePanelColor);
        position: absolute;
        left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>