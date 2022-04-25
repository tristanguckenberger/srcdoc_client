<script>
import { goto } from "$app/navigation";
import { authOption } from "$lib/stores/authStore";
import { changingPage } from "$lib/stores/codeStore";
import { redirected, showAuthModal } from "$lib/stores/layoutStore";
import { onMount } from 'svelte';

    onMount(() => {
        // authOption.set(0);
        // showAuthModal.set(true);
        redirected.set(true);
        changingPage.set(true);
        goto("/");
    });
</script>