<script lang="ts">
	import buildDoc from '$lib/srcdoc';
	import { thumbnailStore } from '$lib/stores/postStore';
	import { showCaptureThumbnail } from '$lib/stores/codeStore.js';
	import { htmlStore, cssStore, jsStore } from '$lib/stores/codeStore.js';
	// import { dataURLtoFile, saveFile } from '$lib/utils';
	// ../../node_modules/html2canvas
	import html2canvas from '../../../../../node_modules/html2canvas';
import { onDestroy } from 'svelte';
	
	export let srcdoc: any;
	let html;
	let css;
	let js;

	const htmlSub = htmlStore.subscribe((x) => {
        html = x;
    });
    const cssSub = cssStore.subscribe((x) => {
        css = x;
    });
    const jsSub = jsStore.subscribe((x) => {
        js = x;
    });

	$: srcdoc = { 
		html,
		css,
		js,
	};

	let iframe: HTMLIFrameElement;
	$: srcdocBuild = buildDoc(srcdoc?.html?.source, srcdoc?.css?.source, srcdoc?.js?.source);

	$: if (iframe) {
		// We can just update srcdoc for now
		iframe.srcdoc = srcdocBuild;

		// Left here if for some reason we need to re-use a document writing approach
		// iframe.contentWindow.location.reload();
		// const doc = iframe.contentWindow.document;
		// doc.open();
		// doc.write(srcdoc);
		// doc.close();
	}

	// let doc = document.getElementById("#output-iframe");
	$: showCap = $showCaptureThumbnail;

	onDestroy(() => {
		htmlSub();
		cssSub();
		jsSub();
	})
</script>

<div style="height: 100%;">
	{#if showCap}
		<span
			class="capture"
			on:click={() => {
				let doc = iframe?.contentDocument ?? iframe?.contentWindow?.document;
				html2canvas(doc?.body).then((canvas) => {
					const dataURL = canvas.toDataURL('image/png', 1.0); // send this to server

					//THIS STUFF GOES IN API
					// const file = dataURLtoFile(dataURL, "screenshot_1");
					if (dataURL) thumbnailStore.set(dataURL.replace(/^data:image\/(png|jpg);base64,/, ''));

					// saveFile(file);
					// upload to the gist
				});
			}}>Capture Thumbnail</span
		>
	{/if}
	<iframe
		id="output-iframe"
		style="border-radius: 6px; -webkit - mask - image: -webkit - radial - gradient(white, black);"
		title="result"
		bind:this={iframe}
		sandbox="allow-popups-to-escape-sandbox allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-modals allow-same-origin"
	/>
</div>

<style lang="scss">
	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
	.capture {
		position: absolute;
		padding: 10px;
		background: #ffffffbf;
		border-radius: 6px 0;
		font-weight: 500;
		transition: 0.6s cubic-bezier(0.075, 0.82, 0.165, 1);

		&:hover {
			cursor: pointer;
			background: #ffffff88;
		}
	}
</style>
