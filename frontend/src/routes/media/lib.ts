export const TRONCALES_OPTIONS = [
  'Biología',
  'Química',
  'Matemáticas II',
  'Física',
  'Economía',
  'Lengua Extranjera',
  'Geografía',
  'Geología'
];

export const ADMISION_OPTIONS = [
  'Biología',
  'Química',
  'Matemáticas II',
  'Física',
  'Economía',
  'Lengua Extranjera',
  'Geografía',
  'Geología',
  'Artes Plásticas',
  'Dibujo Técnico'
];

export const UNIVERSITIES = [
  {
    degree: 'Grado en Medicina',
    city: 'Madrid',
    university: 'Universidad Complutense',
    cutOff: 13.310,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeahq6GdB-e40HQPDZ0x4QL5IPvzm43c4hmSk4yQn0V4sZhcGZTwPl-8XBYLttVXg0E3lraC2w2aZprEHuOuw1aeimr__HJXO0y20s2Io6NYPNWsLlu0MAHfSUEJU-DAzmr_UM95NC5jAaRN0EfUKqSkdEaspcfiQ444nHnYO5rChL6Y7yIy4fisr2aEw6jWCxpyo_tR9R5Fx0dQg0nIP3zuiYlxn_ENvpYn3rvQDM1FeWSvjDcpThX-2PKHZg9JpoEwYBVtaretk',
    status: 'fuera',
    diff: -1.125,
    note: 'Alta competitividad'
  },
  {
    degree: 'Grado en Ingeniería Biomédica',
    city: 'Barcelona',
    university: 'Univ. de Barcelona',
    cutOff: 12.100,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3S5-7IyfyQiZ8yPqlfCDHQtKmI2YZp52ZiJMA7QCRYfE0U9zjaMFWzdU3th_7wDaXnfAX6IxC_4kpaDnAulpCGb20lgje1Vf36CchC9R38B4ac39xCPBjrgfnty4PuFqUoE2Cihs9WJ2ibUMIONrNAUyfr7Cx5IHcpsOzvq6ZKfse5mXYg_gA5PMQzfMix4YKIP3IAmh7O_YTl2-qaUgEZrIEssAucngyDvKZVG9X-8PlVB0e0wI-eJpCAwMngqpqiTkqtv_nziI',
    status: 'dentro',
    diff: 0.085,
    note: 'Plazas limitadas'
  },
  {
    degree: 'Grado en Biotecnología',
    city: 'Valencia',
    university: 'Univ. Politécnica de Valencia',
    cutOff: 11.890,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmT8BuulaEbBBAsVYeTKVbUcuYWYFVqCO-L5Pft7t9ipEM7d9e3_jWtGOhNuGn8dJGLp7OQpfl0rRdJpy29ns8ETynuBBW-IQQ2GYPpGQs7ExRjmJut3ca_kKG9SuDhzAIb6OseKXRMiUDqJgMlLP8gzGXGloEDhAT7z6DNVGhD4V6e_9R-5DI48bhvjGTtU9EV71zwOBTlRX6r4xO2s46gyXUBYcY5xZBouhnN9dtHbNjsHN25cbz72JVBVG0ZWd1ClGqeQUoJMA',
    status: 'dentro',
    diff: 0.295,
    note: 'Probabilidad alta'
  }
];

export function formatGrade(n: number) {
  if(n < 0)
    n = 0;
  if(n > 14)
    n = 14;
  return n.toFixed(3).replace('.', ',');
}
