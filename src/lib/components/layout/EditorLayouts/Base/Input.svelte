<script>
import SplitPane from '$lib/components/layout/SplitPane/index.svelte';
import Editor from '$lib/components/ui/Editor/index.svelte';
import Pane from '$lib/components/layout/EditorLayouts/Base/Pane.svelte';
import { clientWidth, isVertical, editorContainerHeight, editorContainerWidth, editorOutContainerWidth, editorOutContainerHeight } from '$lib/stores/layoutStore';
import {
		htmlStore,
		cssStore,
		jsStore,
	} from '$lib/stores/codeStore.js';
import { onDestroy, onMount, tick } from 'svelte';
import { currentPost, currentPostPageId } from '$lib/stores/postStore';
import { postHydrator, projectsHydrator } from '$lib/stores/hydrator';

const htmlBackup = {"source": "", "type": "html"};
const cssBackup = {"source": "", "type": "css"};
const jsBackup = {"source": "", "type": "typescript"};
let html;
let css;
let js;

let projectSub;
	const projectSubscription = projectsHydrator.subscribe((x) => {
		projectSub = x;
	});
    const htmlSub = htmlStore.subscribe((x) => {
        html = x;
    })
    const cssSub = cssStore.subscribe((x) => {
        css = x;
    })
    const jsSub = jsStore.subscribe((x) => {
        js = x;
    })

onDestroy(() => {
    projectSubscription();
    htmlSub();
    cssSub();
    jsSub();
})

</script>
{#await $projectsHydrator}
<h1>
    waiting...
</h1>
{:then}
<section id="split-2" bind:clientWidth={$editorContainerWidth} bind:clientHeight={$editorContainerHeight}>
    <SplitPane panes={['#split-html', '#split-css', '#split-js']} vertical={!$isVertical}>
        <Pane id={'split-html'} label={'html'}>
            <Editor slot="pane-content" code={html}/>
        </Pane>
        <Pane id={'split-css'} label={'css'}>
            <Editor slot="pane-content" code={css}/>
        </Pane>
        <Pane id={'split-js'} label={'js'}>
            <Editor slot="pane-content" code={js}/>
        </Pane>
    </SplitPane>
</section>
{/await}