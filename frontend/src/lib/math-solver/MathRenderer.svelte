<script>
  import { onMount, afterUpdate } from 'svelte'
  import katex from 'katex'

  export let latex = ''
  export let inline = false

  let container

  function render() {
    if (!container || !latex) return
    try {
      katex.render(latex, container, {
        throwOnError: false,
        displayMode: !inline,
        output: 'html'
      })
    } catch (e) {
      container.textContent = latex
    }
  }

  onMount(render)
  afterUpdate(render)
</script>

<span bind:this={container} class={inline ? 'inline' : 'block overflow-x-auto'}></span>
