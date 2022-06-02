<script lang="ts">
  // import GoogleAuth from '@beyonk/svelte-social-auth/src/google-auth/GoogleAuth.svelte';
  import { GoogleAuth } from '@beyonk/svelte-social-auth';
  import Form from '$lib/components/ui/Form/index.svelte';
  import Button from '$lib/components/ui/Button/index.svelte';
  import TextButton from '$lib/components/ui/Button/TextButton.svelte';
  import Input from '$lib/components/ui/Input/index.svelte';
  import { clientWidth } from '$lib/stores/layoutStore';

  export let login;
  export let email: string = '';
  export let password: string = '';
  export let credential: string = '';

  const handleForgotPassword = () => {};
</script>

<Form
  handle={() => {
    login();
  }}
>
  <div class="form-split">
    {#if $clientWidth > 900}
      <h2>Sign In</h2>
    {/if}

    <div class="form-content-container">
      <Input
        inputClass={'email'}
        type={'email'}
        label={'Email'}
        name={'email'}
        placeholder={'Email'}
        bind:value={email}
        required={true}
      />
      <br />
      <Input
        inputClass={'password'}
        type={'password'}
        label={'Password'}
        name={'password'}
        placeholder={'Password'}
        bind:value={password}
        required={true}
      />
      <TextButton name="Forgot Password?" onClickFunc={handleForgotPassword} />
      <br />
      <br />
      <Button name="Sign In" />
      <h4 style="text-align: center; font-weight: 300;">or</h4>

      <GoogleAuth
        clientId="761947555347-tuf0jpans20bbaok49jhlu419r7ocdka.apps.googleusercontent.com"
        on:auth-success={(e) => {
          const gCred = JSON.parse(JSON.stringify(e.detail.user));
          console.log(gCred);

          // now that we got a success, we can send the token to our server
          // login(gCred?.wc?.id_token);
        }}
      />
      <br />
      <br />
    </div>
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
    padding: 2rem 2rem 0 2rem;

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
    padding: 2rem 2rem 0 2rem;
    padding-top: 5px;
    width: 100%;
  }
  .more-auth-info {
    width: 40%;
    background-color: #4a64bc;
  }
  :global(.google-auth img) {
    display: none;
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

  :global(.google-auth) {
    font-weight: bold;
    height: 40px !important;
    font-family: Karla, sans-serif;
    color: #ffffff;
    box-sizing: border-box;
    font-size: 0.9em;
    border: none;
    padding: 5px !important;
    border-radius: 4px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(button) {
    background: none;
  }

  :global(.auth-form.modal-auth form) {
    height: fit-content !important;
  }
</style>
