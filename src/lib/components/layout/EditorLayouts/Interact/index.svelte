<!-- <script>
    export splitPaneContainer;
</script>

<div class:showLoader bind:this={splitPaneContainer} class="split-container">
    <SplitPane panes={['#split-2', '#split-3']} vertical={value}>
        <section id="split-2">
            <SplitPane panes={['#split-html', '#split-css', '#split-js']} vertical={!value}>
                <section id="split-html" class="section-panel" style="overflow-x: visible;">
                    {#if html}
                        <Editor code={html} />
                    {/if}
                </section>
                <section id="split-css" class="section-panel" style="overflow-x: visible;">
                    <Editor code={css} />
                </section>
                <section id="split-js" class="section-panel" style="overflow-x: visible;">
                    <Editor code={js} />
                </section>
            </SplitPane>
        </section>
        <section id="split-3">
            <SplitPane panes={['#split-output', '#split-console']} vertical={!value} sizes={[100, 0]}>
                <section id="split-output" class="section-panel">
                    <Output {srcdoc} />
                </section>
                <section id="split-console" class="section-panel">
                    <Console {logs} />
                </section>
            </SplitPane>
        </section>
    </SplitPane>
</div> -->