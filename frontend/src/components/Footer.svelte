<script lang="ts">
  import { MailIcon, InstagramIcon, BookOpen, Calculator, Wand2, ExternalLink, Sigma } from "@lucide/svelte";
</script>

<footer class="bg-[#431407] text-white pt-16 pb-10 px-6 max-md:px-4 relative overflow-hidden">
  <!-- Top gradient line -->
  <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" aria-hidden="true"></div>

  <!-- Background decoration -->
  <div
    class="absolute inset-0 opacity-[0.03]"
    style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 32px 32px;"
    aria-hidden="true"
  ></div>
  <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" aria-hidden="true"></div>

  <div class="max-w-6xl mx-auto relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">

      <!-- Brand column -->
      <div class="md:col-span-4">
        <a href="/" class="flex items-center gap-2.5 mb-5 group w-fit">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/40 transition-transform group-hover:scale-105"
            style="background: linear-gradient(135deg, #EA580C, #f97316); border-bottom: 3px solid #9a3412;"
          >
            <span class="text-white font-extrabold text-base">A</span>
          </div>
          <span class="text-xl font-extrabold text-white tracking-tight">AsroPAU</span>
        </a>
        <p class="text-orange-300 text-sm leading-relaxed mb-7 max-w-xs">
          La plataforma definitiva para el estudiante pre-universitario. Todo lo que necesitas para tu acceso a la universidad en un solo lugar.
        </p>

        <div class="flex items-center gap-3">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-orange-300 hover:bg-orange-500 hover:text-white transition-all duration-200 cursor-pointer border border-white/10 hover:border-orange-400"
            aria-label="Instagram"
          >
            <InstagramIcon size={16} />
          </a>
          <a
            href="mailto:hola@asropau.es"
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-orange-300 hover:bg-orange-500 hover:text-white transition-all duration-200 cursor-pointer border border-white/10 hover:border-orange-400"
            aria-label="Email"
          >
            <MailIcon size={16} />
          </a>
        </div>
      </div>

      <!-- Resources column -->
      <div class="md:col-span-3">
        <h5 class="font-bold text-xs text-orange-300/70 uppercase tracking-widest mb-5">
          Recursos
        </h5>
        <ul class="space-y-3.5 text-sm">
          <li>
            <a href="/examen" class="flex items-center gap-2 text-orange-200/80 hover:text-white transition-colors cursor-pointer group">
              <BookOpen size={13} class="opacity-60 group-hover:opacity-100 text-orange-400" />
              Archivo de Exámenes
            </a>
          </li>
          <li>
            <a href="/resolutor" class="flex items-center gap-2 text-orange-200/80 hover:text-white transition-colors cursor-pointer group">
              <Sigma size={13} class="opacity-60 group-hover:opacity-100 text-orange-400" />
              Resolutor Matemáticas
            </a>
          </li>
          <li>
            <a href="/media" class="flex items-center gap-2 text-orange-200/80 hover:text-white transition-colors cursor-pointer group">
              <Calculator size={13} class="opacity-60 group-hover:opacity-100 text-orange-400" />
              Calculadora de Notas
            </a>
          </li>
          <li>
            <a href="/examenes-ia" class="flex items-center gap-2 text-orange-200/80 hover:text-white transition-colors cursor-pointer group">
              <Wand2 size={13} class="opacity-60 group-hover:opacity-100 text-orange-400" />
              Corrector IA
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">NEW</span>
            </a>
          </li>
          <li>
            <a href="#" class="flex items-center gap-2 text-orange-200/80 hover:text-white transition-colors cursor-pointer group">
              <ExternalLink size={13} class="opacity-60 group-hover:opacity-100 text-orange-400" />
              Notas de Corte
            </a>
          </li>
        </ul>
      </div>

      <!-- Community column -->
      <div class="md:col-span-2">
        <h5 class="font-bold text-xs text-orange-300/70 uppercase tracking-widest mb-5">
          Comunidad
        </h5>
        <ul class="space-y-3.5 text-sm">
          <li><a href="#" class="text-orange-200/80 hover:text-white transition-colors cursor-pointer">Blog de Selectividad</a></li>
          <li><a href="#" class="text-orange-200/80 hover:text-white transition-colors cursor-pointer">Guía de Universidades</a></li>
          <li><a href="#" class="text-orange-200/80 hover:text-white transition-colors cursor-pointer">Foro de Dudas</a></li>
          <li><a href="#" class="text-orange-200/80 hover:text-white transition-colors cursor-pointer">Colaboradores</a></li>
        </ul>
      </div>

      <!-- Newsletter / CTA column -->
      <div class="md:col-span-3">
        <h5 class="font-bold text-xs text-orange-300/70 uppercase tracking-widest mb-5">
          Mantente al día
        </h5>
        <p class="text-sm text-orange-300/70 mb-4 leading-relaxed">
          Recibe avisos de nuevos exámenes y recursos exclusivos.
        </p>
        <div class="flex gap-2">
          <input
            type="email"
            name="newsletter-email"
            autocomplete="email"
            placeholder="tu@email.com"
            class="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all"
            aria-label="Email para newsletter"
          />
          <button
            type="button"
            class="px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap hover:-translate-y-0.5"
            style="background-color: #EA580C; border-bottom: 3px solid #9a3412;"
          >
            Unirse
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-orange-300/50 font-medium">
      <p>© 2026 AsroPAU. Todos los derechos reservados.</p>
      <div class="flex gap-5 uppercase tracking-widest">
        <a href="#" class="hover:text-orange-200 transition-colors cursor-pointer">Términos</a>
        <a href="#" class="hover:text-orange-200 transition-colors cursor-pointer">Privacidad</a>
        <a href="#" class="hover:text-orange-200 transition-colors cursor-pointer">Cookies</a>
        <a href="#" class="hover:text-orange-200 transition-colors cursor-pointer">Contacto</a>
      </div>
    </div>
  </div>
</footer>
