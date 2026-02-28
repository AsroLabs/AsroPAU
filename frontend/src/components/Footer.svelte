<script lang="ts">
  import { MailIcon, InstagramIcon, BookOpen, Calculator, Wand2, ExternalLink } from "@lucide/svelte";
</script>

<footer class="bg-white border-t border-slate-100 pt-16 pb-10 px-6 max-md:px-4 relative overflow-hidden">
  <!-- Top decoration -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" aria-hidden="true"></div>

  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

      <!-- Brand column -->
      <div class="md:col-span-4">
        <a href="/" class="flex items-center gap-2 mb-5 group w-fit">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-100 transition-transform group-hover:scale-105">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <span class="text-xl font-bold text-slate-800 tracking-tight">AsroPAU</span>
        </a>
        <p class="text-slate-400 text-sm leading-relaxed mb-7 max-w-xs">
          La plataforma definitiva para el estudiante pre-universitario. Todo lo que necesitas para tu acceso a la universidad en un solo lugar.
        </p>

        <div class="flex items-center gap-3">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer"
            aria-label="Instagram"
          >
            <InstagramIcon size={16} />
          </a>
          <a
            href="mailto:hola@asropau.es"
            class="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer"
            aria-label="Email"
          >
            <MailIcon size={16} />
          </a>
        </div>
      </div>

      <!-- Resources column -->
      <div class="md:col-span-2">
        <h5 class="font-bold text-xs text-slate-800 uppercase tracking-widest mb-5">
          Recursos
        </h5>
        <ul class="space-y-3.5 text-sm">
          <li>
            <a href="/examen" class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group">
              <BookOpen size={13} class="opacity-60 group-hover:opacity-100" />
              Archivo de Exámenes
            </a>
          </li>
          <li>
            <a href="/media" class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group">
              <Calculator size={13} class="opacity-60 group-hover:opacity-100" />
              Calculadora de Notas
            </a>
          </li>
          <li>
            <a href="/examenes-ia" class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group">
              <Wand2 size={13} class="opacity-60 group-hover:opacity-100" />
              Corrector IA
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group">
              <ExternalLink size={13} class="opacity-60 group-hover:opacity-100" />
              Notas de Corte
            </a>
          </li>
        </ul>
      </div>

      <!-- Community column -->
      <div class="md:col-span-3">
        <h5 class="font-bold text-xs text-slate-800 uppercase tracking-widest mb-5">
          Comunidad
        </h5>
        <ul class="space-y-3.5 text-sm">
          <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">Blog de Selectividad</a></li>
          <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">Guía de Universidades</a></li>
          <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">Foro de Dudas</a></li>
          <li><a href="#" class="text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">Colaboradores</a></li>
        </ul>
      </div>

      <!-- Newsletter / CTA column -->
      <div class="md:col-span-3">
        <h5 class="font-bold text-xs text-slate-800 uppercase tracking-widest mb-5">
          Mantente al día
        </h5>
        <p class="text-sm text-slate-400 mb-4 leading-relaxed">
          Recibe avisos de nuevos exámenes y recursos exclusivos.
        </p>
        <div class="flex gap-2">
          <input
            type="email"
            placeholder="Tu email"
            class="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            aria-label="Email para newsletter"
          />
          <button
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Unirse
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
      <p>© 2026 AsroPAU. Todos los derechos reservados.</p>
      <div class="flex gap-5 uppercase tracking-widest">
        <a href="#" class="hover:text-blue-600 transition-colors cursor-pointer">Términos</a>
        <a href="#" class="hover:text-blue-600 transition-colors cursor-pointer">Privacidad</a>
        <a href="#" class="hover:text-blue-600 transition-colors cursor-pointer">Cookies</a>
        <a href="#" class="hover:text-blue-600 transition-colors cursor-pointer">Contacto</a>
      </div>
    </div>
  </div>
</footer>
