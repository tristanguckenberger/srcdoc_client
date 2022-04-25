<script lang="ts">
    import Form from "$lib/components/ui/Form/index.svelte";
    import Button from "$lib/components/ui/Button/index.svelte";
    import TextButton from "$lib/components/ui/Button/TextButton.svelte";
    import Input from "$lib/components/ui/Input/index.svelte";
    import { onMount, afterUpdate} from "svelte";
    import { clientWidth } from "$lib/stores/layoutStore";
    import { get as getUtil } from '$lib/utils.js';
    
    export let verify;
    export let error;
    export let verificationCode: string = "";

    $: vis = (error !== "*" && error !== "" );


    onMount(async () => {
        const logout = await getUtil(`../../api/auth/signout.json`);
    });

    afterUpdate(async () => {
        const logout = await getUtil(`../../api/auth/signout.json`);
    });


    </script>
    
    <Form handle={verify}>
        
        <div class="form-split">
                <h2 class="verify">Verify Email</h2>
                <p>
                    A 6-digit verification code has been sent to the email 
                    associated with this account. Please enter the code below 
                    to verify your email. 
                </p>
                <br>
                <br>
            <div class="form-content-container">
                <Input
                    inputClass={"email"}
                    type={"text"}
                    label={"Verification Code"}
                    name={"code"}
                    placeholder={"6-digit Code"}
                    bind:value={verificationCode}
                    required={true}
                />
                <br>
                <Button name="Sign In" />
                <p>
                    {#if error && error.includes("*")}
                        {error}
                        {:else}
                        <span class="verify-error" class:vis>{error}</span>
                    {/if}
                </p>
            </div>
        </div>
        
        
    </Form>
    

    <style lang="scss">
        .verify-error {
            color: var(--mainThemePanelColor);
        }
        .verify-error.vis {
            color: #c21a98;
            font-weight: 500;
        }
        .verify {
            margin-block-end: 0;
            margin-block-start: 0;
        }
        .form-split {
            width: calc(100% - 4rem);
            min-height: 350px;
            height: calc(100% - 4rem);
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: var(--mainThemeModalFormBlur);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            backdrop-filter: saturate(180%) blur(20px);
            padding: 2rem;

            h2 {
                align-self: flex-start;
            }

            :global(label) {
                text-align: left;
            }
        }
        .form-content-container {
            display: flex;
            justify-content: flex-end;
            flex-direction: column;
            padding: 2rem;
            padding-top: 5px;
            width: 100%;
        }
        .more-auth-info {
            width: 40%;
            background-color: #4a64bc;
        }

        @media screen and (max-width: 900px) {
            .form-split {
           
                height: unset !important;
                width: calc(100% - 4rem);
                min-height: 350px;
                // height: calc(100%);
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                background-color: var(--mainThemeModalFormBlur);
                -webkit-backdrop-filter: saturate(180%) blur(20px);
                backdrop-filter: saturate(180%) blur(20px);
                padding: 0 2rem;
          
            }
            .form-content-container.s-4Z7kTaL9IT8f {
                padding-bottom: 0.5rem;
            }
        }
    </style>