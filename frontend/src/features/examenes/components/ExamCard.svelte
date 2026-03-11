<script lang="ts">
  import { Download, Eye, FileText } from '@lucide/svelte'

  interface Exam {
    id: number
    region: string
    subject: string
    year: number
    session: string
    type: 'Ordinaria' | 'Extraordinaria'
  }

  interface Props {
    exam: Exam
  }

  let { exam }: Props = $props()
</script>

<div class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-200 transition-all duration-300">
  <div class="p-6">
    <div class="flex justify-between items-start mb-5">
      <div class="flex flex-col">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">
          {exam.region}
        </span>
        <h4 class="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-lg">
          {exam.subject}
        </h4>
      </div>
      <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
        <FileText class="text-orange-500" size={28} />
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-8">
      <span class="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
        {exam.year}
      </span>
      <span
        class="px-3 py-1 rounded-lg text-[10px] font-bold {exam.type === 'Ordinaria'
          ? 'bg-orange-50 text-orange-600'
          : 'bg-amber-50 text-amber-600'}"
      >
        {exam.session}
      </span>
    </div>

    <div class="flex gap-2">
      <a
        href="http://localhost:3000/exams/{exam.id}/download"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-all shadow-sm shadow-orange-300/30 active:scale-95"
        style="border-bottom: 2px solid #9a3412;"
      >
        <Download size={16} />
        Descargar
      </a>
      <button
        class="px-4 py-3 border border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95"
      >
        <Eye size={18} />
      </button>
    </div>
  </div>
</div>
