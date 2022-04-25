<script lang="ts">
    import Form from "$lib/components/ui/Form/index.svelte";
    import Button from "$lib/components/ui/Button/index.svelte";
    import TextButton from "$lib/components/ui/Button/TextButton.svelte";
    import Input from "$lib/components/ui/Input/index.svelte";
import { clientWidth } from "$lib/stores/layoutStore";
    
    export let register;
    export let username: string = "";
    export let email: string = "";
    export let password: string = "";
    export let passwordConf: string = "";
    
    const handleForgotPassword = () => {};
    </script>
    
    <Form handle={register}>
        <div class="form-split">
            {#if $clientWidth > 900}
                <h2>Sign Up</h2>
            {/if}
            
            <div class="form-content-container">
                <Input
                    inputClass={"email"}
                    type={"text"}
                    label={"Username"}
                    name={"username"}
                    placeholder={"Username"}
                    bind:value={username}
                    required={true}
                />
                <br>
                <Input
                    inputClass={"email"}
                    type={"email"}
                    label={"Email"}
                    name={"email"}
                    placeholder={"Email"}
                    bind:value={email}
                    required={true}
                />
                <br>
                <Input
                    inputClass={"password"}
                    type={"password"}
                    label={"Password"}
                    name={"password"}
                    placeholder={"Password"}
                    bind:value={password}
                    required={true}
                />
                <br>
                <Input
                    inputClass={"password"}
                    type={"password"}
                    label={"Confirm Password"}
                    name={"password_conf"}
                    placeholder={"Password"}
                    bind:value={passwordConf}
                    required={true}
                />
                <br>
                <br>
                <Button name="Sign Up" />
                <!-- <TextButton name="Forgot Password?" onClickFunc={handleForgotPassword} /> -->
            </div>
            <!-- <div class="more-auth-info">
                
            </div> -->
        </div>
        
        
    </Form>
    

    <style lang="scss">
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
        @media screen and (max-width: 900px) {
            .form-split {
                width: calc(100% - 20px);
                padding: 0 10px;
            }
            .form-content-container {
                padding: 10px;
            }
        }
    </style>