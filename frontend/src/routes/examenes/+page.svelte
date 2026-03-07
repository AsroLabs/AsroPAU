<script lang="ts">
  import { 
    Search, 
    Map as MapIcon, 
    BookOpen, 
    Calendar, 
    Download, 
    Eye, 
    Filter, 
    LayoutGrid, 
    List, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    Lightbulb, 
    Facebook, 
    Globe,
    CheckCircle2
  } from '@lucide/svelte';

  // Types
  interface Exam {
    id: number;
    region: string;
    subject: string;
    year: number;
    session: string;
    type: 'Ordinaria' | 'Extraordinaria';
  }

  const EXAMS: Exam[] = [
    { id: 1, region: 'Madrid', subject: 'Historia de España', year: 2024, session: 'Convocatoria Ordinaria', type: 'Ordinaria' },
    { id: 2, region: 'Andalucía', subject: 'Historia de España', year: 2024, session: 'Convocatoria Ordinaria', type: 'Ordinaria' },
    { id: 3, region: 'Cataluña', subject: 'Historia de España', year: 2024, session: 'Extraordinaria', type: 'Extraordinaria' },
    { id: 4, region: 'Galicia', subject: 'Historia de España', year: 2023, session: 'Convocatoria Ordinaria', type: 'Ordinaria' },
    { id: 5, region: 'C. Valenciana', subject: 'Historia de España', year: 2023, session: 'Convocatoria Ordinaria', type: 'Ordinaria' },
    { id: 6, region: 'Castilla y León', subject: 'Historia de España', year: 2023, session: 'Extraordinaria', type: 'Extraordinaria' },
  ];

  let selectedYear = $state(2024);
  let viewMode = $state<'grid' | 'list'>('grid');

  const subjects = ['Matemáticas II', 'Historia de España', 'Lengua y Literatura', 'Inglés', 'Física', 'Química', 'Biología'];
  const years = [2024, 2023, 2022, 2021, 2020, 'Anteriores'];
</script>

<div class="min-h-screen flex flex-col">

  <main class="max-w-[1440px] mx-auto w-full flex gap-8 p-6 flex-1">
    <!-- Sidebar -->
    <aside class="w-80 flex-shrink-0 hidden lg:block space-y-6">
      <!-- Community Filter -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapIcon size={18} class="text-orange-600" />
          Comunidad Autónoma
        </h3>
        <select class="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm py-2.5 px-3 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all text-slate-700">
          <option>Todas las comunidades</option>
          <option>Madrid</option>
          <option>Andalucía</option>
          <option>Cataluña</option>
          <option>Galicia</option>
        </select>
      </section>

      <!-- Subject Filter -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} class="text-orange-600" />
          Asignatura
        </h3>
        <div class="relative mb-4">
          <input 
            type="text" 
            placeholder="Buscar asignatura..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm pl-10 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-slate-700 placeholder:text-slate-400"
          />
          <Search size={16} class="absolute left-3.5 top-3 text-slate-400" />
        </div>
        <div class="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {#each subjects as subject}
            <label class="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer group transition-colors">
              <input 
                type="checkbox" 
                checked={subject === 'Historia de España'}
                class="w-4 h-4 rounded border-slate-300 accent-orange-600 focus:ring-orange-400" 
              />
              <span class="text-sm {subject === 'Historia de España' ? 'text-orange-600 font-semibold' : 'text-slate-600 group-hover:text-slate-900'}">
                {subject}
              </span>
            </label>
          {/each}
        </div>
      </section>

      <!-- Year Filter -->
      <section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={18} class="text-orange-600" />
          Año del Examen
        </h3>
        <div class="grid grid-cols-2 gap-2">
          {#each years as year}
            <button 
              onclick={() => typeof year === 'number' && (selectedYear = year)}
              class="text-xs py-2.5 px-3 rounded-xl border font-bold transition-all {
                selectedYear === year 
                  ? 'bg-orange-50 border-orange-400 text-orange-600' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-600'
              }"
            >
              {year}
            </button>
          {/each}
        </div>
      </section>

      <!-- Ad Banner -->
      <div class="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4">Patrocinado</span>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 class="text-orange-600" size={24} />
          </div>
          <p class="text-xs font-bold text-slate-800 mb-1">Cursos Intensivos 2026</p>
          <p class="text-[10px] text-slate-500 mb-4">Prepara tu acceso con los mejores</p>
          <button class="w-full py-2 bg-orange-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-orange-700 transition-colors shadow-sm shadow-orange-300/40" style="border-bottom: 2px solid #9a3412;">
            Saber más
          </button>
        </div>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1">
      <!-- Top Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display text-2xl font-bold text-slate-900">Exámenes Encontrados</h2>
          <p class="text-slate-500 text-sm mt-1">
            Mostrando 42 resultados para <span class="text-orange-600 font-semibold">Historia de España</span> en <span class="text-orange-600 font-semibold">{selectedYear}</span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <Filter size={16} />
            Limpiar Filtros
          </button>
          <div class="h-8 w-px bg-slate-200 mx-1"></div>
          <div class="flex bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onclick={() => (viewMode = 'grid')}
              class="p-1.5 rounded-lg transition-all {viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onclick={() => (viewMode = 'list')}
              class="p-1.5 rounded-lg transition-all {viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <!-- Promo Banner -->
      <div 
        class="mb-8 p-6 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 rounded-3xl shadow-lg shadow-orange-300/30 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div class="relative z-10 flex items-center gap-6">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
            <Lightbulb class="text-white" size={32} />
          </div>
          <div>
            <h3 class="text-white font-display font-bold text-xl">¿Quieres subir tu nota?</h3>
            <p class="text-white/80 text-sm max-w-md">Consigue los mejores apuntes y resúmenes validados por profesores expertos en cada materia.</p>
          </div>
        </div>
        <button class="relative z-10 bg-white text-orange-600 font-bold px-8 py-3 rounded-full text-sm shadow-xl hover:scale-105 transition-transform active:scale-95 hover:shadow-orange-200/60">
          Ver Apuntes
        </button>
        <!-- Decorative circles -->
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute top-0 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <!-- Exam Grid -->
      <div class="grid gap-6 {viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}">
        {#each EXAMS as exam}
          <div 
            class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-200 transition-all duration-300"
          >
            <div class="p-6">
              <div class="flex justify-between items-start mb-5">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{exam.region}</span>
                  <h4 class="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-lg">{exam.subject}</h4>
                </div>
                <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <FileText class="text-orange-500" size={28} />
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-8">
                <span class="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">{exam.year}</span>
                <span class="px-3 py-1 rounded-lg text-[10px] font-bold {
                  exam.type === 'Ordinaria' ? 'bg-orange-50 text-orange-600' : 'bg-amber-50 text-amber-600'
                }">
                  {exam.session}
                </span>
              </div>

              <div class="flex gap-2">
                <button class="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-all shadow-sm shadow-orange-300/30 active:scale-95" style="border-bottom: 2px solid #9a3412;">
                  <Download size={16} />
                  Descargar
                </button>
                <button class="px-4 py-3 border border-slate-200 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all active:scale-95">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      <div class="mt-12 flex items-center justify-center gap-2">
        <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all">
          <ChevronLeft size={20} />
        </button>
        <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-md shadow-orange-300/40" style="border-bottom: 2px solid #9a3412;">1</button>
        <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">2</button>
        <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">3</button>
        <span class="px-2 text-slate-400 font-medium">...</span>
        <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all">8</button>
        <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-200 py-16 mt-12">
    <div class="max-w-[1440px] mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-9 h-9 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-300/50" style="border: 2px solid #f97316;">
              <span class="font-display font-bold text-white text-sm leading-none">A</span>
            </div>
            <h1 class="font-display text-xl font-bold text-slate-800 tracking-tight">AsroPAU</h1>
          </div>
          <p class="text-sm text-slate-500 max-w-sm leading-relaxed mb-8">
            La mayor base de datos abierta de exámenes EvAU y PAU de España. Ayudamos a miles de estudiantes a preparar su acceso a la universidad con recursos gratuitos y de calidad.
          </p>
          <div class="flex gap-4">
            <a href="#" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all">
              <Facebook size={20} />
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all">
              <Globe size={20} />
            </a>
          </div>
        </div>
        
        <div>
          <h4 class="font-bold text-slate-900 mb-6">Enlaces rápidos</h4>
          <ul class="space-y-4 text-sm text-slate-500">
            <li><a href="#" class="hover:text-orange-600 transition-colors">Todos los Exámenes</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Notas de Corte 2026</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Calculadora de EvAU</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Blog de Orientación</a></li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-slate-900 mb-6">Soporte</h4>
          <ul class="space-y-4 text-sm text-slate-500">
            <li><a href="#" class="hover:text-orange-600 transition-colors">Contacto</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Preguntas Frecuentes</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Privacidad</a></li>
            <li><a href="#" class="hover:text-orange-600 transition-colors">Cookies</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} AsroPAU — Buscador de Exámenes Selectividad. Todos los derechos reservados.
        </p>
        <div class="flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <img src="https://picsum.photos/seed/edu1/100/40" alt="Ministerio" class="h-8" referrerPolicy="no-referrer" />
          <img src="https://picsum.photos/seed/univ1/100/40" alt="Universidad" class="h-8" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #fed7aa;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #fdba74;
  }
</style>