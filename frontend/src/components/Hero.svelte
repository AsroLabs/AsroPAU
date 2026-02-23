<script>
  import ToggleDark from "./ToggleDark.svelte";
  import grid from "$lib/assets/grid.png";
  import spain from "$lib/assets/spain.svg";
  import hat from "$lib/assets/hat.svg";
  import printer from "$lib/assets/printer.svg";
  import calculator from "$lib/assets/calculator.svg";
  import exams from "$lib/assets/exams.svg";
</script>

<!-- DESKTOP HERO SECTION WITH ROTATED TEXT -->
<section
  class="hero-desktop hidden md:relative md:block w-full h-screen pt-20 pb-16 text-center overflow-hidden"
>
  <h1
    class="prevent-select hero-title-left ubuntu text-5xl max-xl:text-4xl max-xl:left-[20%] max-lg:left-[10%] mb-4 absolute left-[15%] top-[18%] z-10 rotate-y-55 -rotate-x-[23.5deg]"
  >
    Supera la <span class="text-orange-300">Selectividad </span> <br /> con éxito
  </h1>
  <h1
    class="prevent-select hero-title-right ubuntu text-5xl max-xl:text-4xl max-xl:right-[25%] max-lg:right-[15%] mb-4 absolute right-[22.5%] top-[20%] z-10 -rotate-y-55 -rotate-x-23"
  >
    Toda la PAU <br /> <span class="text-orange-300">centralizada.</span>
  </h1>
  <div
    class="relative flex justify-center items-center w-full h-screen overflow-hidden"
  >
    <img
      src={hat}
      alt="Graduation hat"
      class="hero-icon-hat absolute top-[20%] max-xl:top-[25%] max-lg:top-[30%] right-[30%] w-[12vw] aspect-square drop-shadow-2xl hover:-translate-y-2 transition-transform"
    />

    <img
      src={printer}
      alt="printer AI"
      class="hero-icon-printer absolute top-[25%] max-xl:top-[30%] max-lg:top-[35%] left-[27.5%] w-[10vw] aspect-square drop-shadow-2xl hover:-translate-y-2 transition-transform"
    />

    <img
      src={exams}
      alt="official exams"
      class="hero-icon-exams absolute bottom-[20%] max-xl:bottom-[25%] max-lg:bottom-[30%] right-[35%] w-[11vw] aspect-square drop-shadow-2xl hover:-translate-y-2 transition-transform"
    />

    <img
      src={calculator}
      alt="calculator"
      class="hero-icon-calc absolute bottom-[25%] max-xl:bottom-[30%] max-lg:bottom-[35%] left-[27.5%] w-[9vw] aspect-square drop-shadow-2xl hover:-translate-y-2 transition-transform"
    />

    <img src={spain} alt="Spain map" class="hero-spain w-2/4 object-contain" />
  </div>

  <div
    class="absolute top-0 flex justify-center items-center w-full h-full -z-10"
  >
    <img
      src={grid}
      alt="Grid background"
      class="inset-0 w-full h-full object-cover"
    />
  </div>
  <div
    class="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex justify-between max-w-3/6 gap-6"
  >
    <button class="btn p-3 bg-orange-300 hover:bg-blue-[#2563EB]">
      Comenzar ahora
    </button>
    <button class="btn border-black border hover:bg-blue-[#2563EB]">
      Comenzar ahora
    </button>
  </div>
</section>

<!-- MOBILE HERO SECTION - SIMPLE TEXT WITHOUT ROTATION -->

<!-- SPAIN MAP SECTION -->
<section
  class="hidden max-md:flex w-full h-screen relative flex-col items-center justify-between px-6 py-20"
>
  <div class="text-center">
    <h2 class="text-[clamp(2rem,6vw,4rem)] font-bold mb-4">
      Domina toda la <span class="text-[#2563EB]">PAU de España</span>
    </h2>
    <p class="text-[clamp(1rem,2vw,1.5rem)] text-gray-600 max-w-2xl">
      Acceso a recursos de selectividad de todas las comunidades autónomas en
      una sola plataforma.
    </p>
  </div>
  <div class="absolute -translate-y-1/2 bottom-50 -z-10">
    <img src={spain} alt="spain" />
  </div>

  <div class="flex justify-between w-full gap-6">
    <button class="btn p-3 bg-orange-300 hover:bg-blue-[#2563EB]">
      Comenzar ahora
    </button>
    <button class="btn border-black border hover:bg-blue-[#2563EB]">
      Comenzar ahora
    </button>
  </div>
</section>

<!-- Keep absolute positioning on container, use vw for all sizes -->

<style>
  /* 1440px and above - Desktop Large */
  @media (min-width: 1440px) {
    :global(.hero-desktop .hero-title-left) {
      font-size: 3rem;
      left: 15%;
      top: 18%;
    }

    :global(.hero-desktop .hero-title-right) {
      font-size: 3rem;
      right: 22.5%;
      top: 20%;
    }

    :global(.hero-desktop .hero-icon-hat) {
      width: 12vw;
      top: 20%;
      right: 30%;
    }

    :global(.hero-desktop .hero-icon-printer) {
      width: 10vw;
      top: 25%;
      left: 27.5%;
    }

    :global(.hero-desktop .hero-icon-exams) {
      width: 11vw;
      bottom: 20%;
      right: 35%;
    }

    :global(.hero-desktop .hero-icon-calc) {
      width: 9vw;
      bottom: 25%;
      left: 27.5%;
    }

    :global(.hero-desktop .hero-spain) {
      width: 50%;
    }
  }

  /* 1440px to 1200px */
  @media (min-width: 1200px) and (max-width: 1439px) {
    :global(.hero-desktop .hero-title-left) {
      font-size: 2.75rem;
      left: 16%;
      top: 20%;
    }

    :global(.hero-desktop .hero-title-right) {
      font-size: 2.75rem;
      right: 24%;
      top: 22%;
    }

    :global(.hero-desktop .hero-icon-hat) {
      width: 11.5vw;
      top: 22%;
      right: 31%;
    }

    :global(.hero-desktop .hero-icon-printer) {
      width: 9.5vw;
      top: 27%;
      left: 28%;
    }

    :global(.hero-desktop .hero-icon-exams) {
      width: 10.5vw;
      bottom: 22%;
      right: 36%;
    }

    :global(.hero-desktop .hero-icon-calc) {
      width: 8.5vw;
      bottom: 27%;
      left: 28%;
    }

    :global(.hero-desktop .hero-spain) {
      width: 50%;
    }
  }

  /* 1200px to 1080px */
  @media (min-width: 1080px) and (max-width: 1199px) {
    :global(.hero-desktop .hero-title-left) {
      font-size: 2.5rem;
      left: 14%;
      top: 22%;
    }

    :global(.hero-desktop .hero-title-right) {
      font-size: 2.5rem;
      right: 20%;
      top: 24%;
    }

    :global(.hero-desktop .hero-icon-hat) {
      width: 11vw;
      top: 24%;
      right: 32%;
    }

    :global(.hero-desktop .hero-icon-printer) {
      width: 9vw;
      top: 29%;
      left: 29%;
    }

    :global(.hero-desktop .hero-icon-exams) {
      width: 10vw;
      bottom: 24%;
      right: 37%;
    }

    :global(.hero-desktop .hero-icon-calc) {
      width: 8vw;
      bottom: 29%;
      left: 29%;
    }

    :global(.hero-desktop .hero-spain) {
      width: 48%;
    }
  }

  /* 1024px (iPad landscape / tablets) */
  @media (min-width: 1024px) and (max-width: 1079px) {
    :global(.hero-desktop .hero-title-left) {
      font-size: 2.25rem;
      left: 12%;
      top: 24%;
    }

    :global(.hero-desktop .hero-title-right) {
      font-size: 2.25rem;
      right: 18%;
      top: 26%;
    }

    :global(.hero-desktop .hero-icon-hat) {
      width: 10.5vw;
      top: 26%;
      right: 33%;
    }

    :global(.hero-desktop .hero-icon-printer) {
      width: 8.5vw;
      top: 31%;
      left: 30%;
    }

    :global(.hero-desktop .hero-icon-exams) {
      width: 9.5vw;
      bottom: 26%;
      right: 38%;
    }

    :global(.hero-desktop .hero-icon-calc) {
      width: 7.5vw;
      bottom: 31%;
      left: 30%;
    }

    :global(.hero-desktop .hero-spain) {
      width: 46%;
    }
  }

  /* 800-1024px (Large tablets / small desktops) */
  @media (min-width: 800px) and (max-width: 1023px) {
    :global(.hero-desktop .hero-title-left) {
      font-size: 2rem;
      left: 8%;
      top: 26%;
    }

    :global(.hero-desktop .hero-title-right) {
      font-size: 2rem;
      right: 12%;
      top: 28%;
    }

    :global(.hero-desktop .hero-icon-hat) {
      width: 10vw;
      top: 28%;
      right: 34%;
    }

    :global(.hero-desktop .hero-icon-printer) {
      width: 8vw;
      top: 33%;
      left: 31%;
    }

    :global(.hero-desktop .hero-icon-exams) {
      width: 9vw;
      bottom: 28%;
      right: 39%;
    }

    :global(.hero-desktop .hero-icon-calc) {
      width: 7vw;
      bottom: 33%;
      left: 31%;
    }

    :global(.hero-desktop .hero-spain) {
      width: 44%;
    }
  }

  .prevent-select {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .ubuntu {
    font-family: "Ubuntu-bold", sans-serif;
  }
</style>
