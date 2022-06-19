<script>
import { browser } from "$app/env";
import { changingPage, cssStore, htmlStore, initialPostData, jsStore, pageStore, selectedValue } from "$lib/stores/codeStore";
import { isDarkModeStore } from "$lib/stores/layoutStore";
import { currentPost, currentPostPage, currentPostPageId } from "$lib/stores/postStore";


      $: if (browser) {
    htmlStore.useLocalStorage();
    cssStore.useLocalStorage();
    jsStore.useLocalStorage();
    currentPost.useLocalStorage();
    currentPostPage.useLocalStorage();
    pageStore.useLocalStorage();
    // codeToSave.useLocalStorage();
    // dropWidth.useLocalStorage();
    // rightPanelWidth.useLocalStorage();
    changingPage.useLocalStorage();
    initialPostData.useLocalStorage();
    // currentPostPageRevert.useLocalStorage();
    currentPostPageId.useLocalStorage();
    isDarkModeStore.useLocalStorage();
    // isCreationStore.useLocalStorage();
    selectedValue.useLocalStorage();
  }
</script>
<slot />
