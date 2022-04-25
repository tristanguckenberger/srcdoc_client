<script lang="ts">
    export let inputClass: string = "";
    export let type: string = "text";
    export let label: string = "";
    export let name: string = "";
    export let placeholder:string = "";
    export let required: boolean = false;
    export let value: string = "";

    /* 
    in lieu of two-way binding 
    (if we have a "type" property
    two way binding becomes unavailable), 
    we can add an eventlistener 
    and manually "bind" the value
    */
    const handleInput = (e: any) => value = e.target.value;
</script>

{#if label !== ""}
<label class={inputClass} for={name}>
  <span>{label}</span>
</label>
{/if}
<input
  class={inputClass}
  {type}
  {name}
  {placeholder}
  {required}
  on:input={handleInput}
/>

<style>
  label {
    color: var(--mainThemePrimaryTextColor);
    font-weight: 500;
    padding-bottom: 3px;
  }
  input {
    color: var(--mainThemePrimaryTextColor);
    background: var(--inputBG);
    font-size: 16px;
    border: none;
    /* border-bottom: 2px solid #52505841; */
    font: inherit;
    padding: 5px;
    outline: inherit;
    border-radius: 4px !important;
    height: 30px;
  }
  @media screen and (max-width: 900) {
    input {
      height: 40px !important;
    }
  }
</style>