<script lang="ts">
    import { browser } from "$app/env";
    import type { editor } from "monaco-editor/esm/vs/editor/editor.api.js";
	import { htmlStore, cssStore, jsStore } from '$lib/stores/codeStore.js';
	import MonacoEditorScripts from "./MonacoEditorScripts.svelte";
	import { isDarkModeStore } from "$lib/stores/layoutStore";

	export let code;

	let options: editor.IStandaloneEditorConstructionOptions = {
		theme: "omni-light",
		language: code.type,
		fontSize: 16,
		padding: {top: 30},
		showFoldingControls: "always",
		tabCompletion: "on",
		wordWrap: "on",
		scrollBeyondLastLine: true,
		autoClosingBrackets: "languageDefined",
		autoClosingQuotes: "beforeWhitespace",
		autoIndent: "full",
		autoSurround: "languageDefined",
		automaticLayout: true,
		minimap: {
			enabled: false,
		},
		wrappingIndent: "same",
		highlightActiveIndentGuide: true,
		fontLigatures: true,
		// fontWeight: "500",
		// formatOnType: true,
		// formatOnPaste: true,
		// lineNumbersMinChars: 2,
	};

	// $: options.theme = $isDarkModeStore ? "omni-dark" : "omni-light";

	// $: optionListener = {...options};
	
</script>

<div style="height:100%;">
	<div style="height:100%;">
			
		<MonacoEditorScripts
			IFTitle={code.type}
			bind:value={code.source}
			{options}
			on:update={(e) => {
				if (code.type === 'html') {
					htmlStore.set({source: e.detail.value, type: 'html'});
				}
				if (code.type === 'css') {
					cssStore.set({source: e.detail.value, type: 'css'});
				}
				if (code.type === 'typescript') {
					jsStore.set({source: e.detail.value, type: 'typescript'});
				}
			}}
		/>
					
			
			
	</div>
</div>
