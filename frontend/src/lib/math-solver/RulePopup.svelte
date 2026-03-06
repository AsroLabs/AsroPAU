<script lang="ts">
  import { fade, scale } from 'svelte/transition'
  import { backOut, cubicOut } from 'svelte/easing'
  import MathRenderer from './MathRenderer.svelte'
  import { getRuleExample } from './ruleExamples'

  interface Props {
    ruleName: string
    explanation?: string
    onClose: () => void
  }

  let { ruleName, explanation, onClose }: Props = $props()

  const example = $derived(getRuleExample(ruleName))

  // Close on Escape
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  // Trap focus inside dialog (client-only — $effect can run during SSR)
  let dialogEl: HTMLDivElement | undefined = $state()
  $effect(() => {
    if (typeof window === 'undefined') return
    if (dialogEl) {
      const first = dialogEl.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      first?.focus()
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4"
  role="presentation"
>
  <!-- Overlay -->
  <div
    in:fade={{ duration: 180, easing: cubicOut }}
    out:fade={{ duration: 140, easing: cubicOut }}
    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
    onclick={onClose}
    role="presentation"
  ></div>

  <!-- Panel -->
  <div
    bind:this={dialogEl}
    in:scale={{ duration: 260, easing: backOut, start: 0.9 }}
    out:scale={{ duration: 160, easing: cubicOut, start: 0.95 }}
    role="dialog"
    aria-modal="true"
    aria-label="Explicación de la regla {ruleName}"
    class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20 border border-gray-200 overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span class="text-sm font-bold leading-none">?</span>
        </div>
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-widest opacity-70 leading-none mb-0.5">¿Por qué?</p>
          <p class="text-sm font-bold leading-tight">{example?.title ?? ruleName}</p>
        </div>
      </div>
      <button
        type="button"
        onclick={onClose}
        aria-label="Cerrar explicación"
        class="w-7 h-7 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/30 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="px-5 py-5 space-y-4">

      {#if example}
        <!-- Regla en LaTeX -->
        <div class="rounded-xl bg-orange-50 border border-orange-200 px-4 py-4">
          <p class="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">Fórmula</p>
          <div class="text-lg overflow-x-auto">
            <MathRenderer latex={example.latex} inline={false} />
          </div>
        </div>

        <!-- Explicación en prosa -->
        <p class="text-sm text-gray-600 leading-relaxed">{example.prose}</p>
      {/if}

      <!-- Explicación del paso concreto (si viene del backend) -->
      {#if explanation}
        <div class="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">En este paso</p>
          <p class="text-sm text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      {/if}

      {#if !example && !explanation}
        <p class="text-sm text-gray-400 text-center py-2">No hay información adicional para esta regla.</p>
      {/if}

    </div>
  </div>
</div>
