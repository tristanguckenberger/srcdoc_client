<script>
    import { isVertical, editorContainerHeight, editorOutContainerHeight } from '$lib/stores/layoutStore';
    import { hover } from '$lib/actions/hover';
    import { fade } from 'svelte/transition';

    export let id;
    export let label;

    let split;
    let splitClientWidth;
    let splitClientHeight;
    let showPaneOptions = false;

    $: showOptionsObserved = showPaneOptions;
    $: value = $isVertical;

    $: if ((splitClientWidth <= 30) || (splitClientHeight <= 30)) {
        if (split) {
            let splitModel = split?.querySelector('.slot-control-bar .container');
            splitModel.style.borderRadius = '6px';
        }
    } else {
        if (split) {
            let splitModel = split?.querySelector('.slot-control-bar .container');
            splitModel.style.borderRadius = '6px 6px 0 0';
        }
    }

    $: if ((splitClientWidth <= 30)) {
        if (split) {
            let splitModel = split?.querySelector('.slot-control-bar .container');
            splitModel.style.transform = 'rotate(90deg)';

            if (id?.includes('output') || id?.includes('console')) {
                split.style.minHeight = `${100}px`;
            } else {
                split.style.minHeight = `${50}px`;
            }
        }
    } else {
        if (split) {
            let splitModel = split?.querySelector('.slot-control-bar .container');
            splitModel.style.transform = 'rotate(0deg)';
            split.style.minHeight = `${30}px`;
        }
    }

     $: isOutput = $editorOutContainerHeight <= 30;
     $: isEditor = $editorContainerHeight <= 30;

     $: if ((isEditor || isOutput) && $isVertical) {
        if (split) {
            let splitModel = split?.querySelector('.slot-control-bar .container');


            if (id?.includes('output') || id?.includes('console')) {
                if (isOutput) {
                    split.style.minWidth = `${80}px`;
                } else {
                    split.style.minWidth = `${30}px`;
                }
                
            } else {
                if (isEditor) {
                    split.style.minWidth = `${80}px`;
                }
            }
        }
     } else if ($isVertical) {
        split.style.minWidth = `${30}px`;
     }

    const maximize = async (currentChild, isVertical = false) => {
		const { target } = currentChild;
		const parentSplit = target.closest('.split');
		const parentSection = target.closest('section');
		const children = parentSplit?.children;
		const childCountTotal = parentSplit?.childElementCount;
		const gutterCount =
			[...children].filter((child) => child?.classList?.contains('gutter'))?.length ?? 0;
		const adjustedChildCount = childCountTotal - gutterCount;

		[...children]?.forEach((child) => {
			if (parentSection == child) {
				child.style[`${isVertical ? 'height' : 'width'}`] = `calc(100% - ${((isVertical ?  30 : 30)*(adjustedChildCount - 1)) + (((adjustedChildCount - 1))*10)}px)`;
				if (!isVertical) {
					child.querySelector('.slot-control-bar .container').style.transform = 'rotate(0deg)';
				}
			} else if (parentSection != child && !child?.classList?.contains('gutter')) {
				child.style[`${isVertical ? 'height' : 'width'}`] = `calc(${(isVertical ? 30 : 30)}px)`;
				if (!isVertical && !isEditor) {
                    if (!isOutput) {
                        child.querySelector('.slot-control-bar .container').style.transform = 'rotate(90deg)';
                    }
				} 
			}
		});
	};

</script>

<section
    id="{id}"
    class="section-panel"
    style="overflow-x: visible;"
    bind:this={split}
    bind:clientWidth={splitClientWidth}
    bind:clientHeight={splitClientHeight}
    >
    <div
        class="slot-control-bar"
        on:dblclick={(e) => {
            maximize(e, !value);
        }}
    >
        <div class="container no-selection" use:hover on:hovered={() => (showPaneOptions = !(splitClientWidth <= 30) ? true : false)} on:mouseleave={() => (showPaneOptions = false)}>    
            {label}
            {#if showOptionsObserved}
                <div class="pane-options" in:fade|local="{{ delay: 50, duration: 100 }}" out:fade|local="{{ delay: 0, duration: 200 }}">
                    option
                </div>
            {/if}
        </div>
    </div>
    <slot name="pane-content" />
</section>

<style lang="scss">
    .slot-control-bar {
		position: relative;

		.container {
			border-radius: 6px 6px 0px 0px;
			padding: 0 10px 0 10px;
			z-index: 1;
			width: calc(100% - 20px);
			height: 30px;
			position: absolute;
			display: flex;
			align-items: center;
            transition: background-color 300ms cubic-bezier(0.215, 0.610, 0.355, 1);

            &:hover {
                background-color: var(--mainThemePanelColor);
            }
		}
		&:hover {
			cursor: pointer;
		}
	}
    .section-panel {
        background-color: var(--mainThemePanelColor);
        border-radius: 6px;
        // overflow: hidden;
    }
    :global(.split.vertical) {
        display: flex !important;
        flex-direction: column !important;
    }
</style>