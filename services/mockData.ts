export interface MockEvent {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  fullDescription?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  images?: string[];
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const mockEvents: MockEvent[] = [
  {
    id: '1',
    name: 'SANTALAND 2025',
    subtitle: 'Evento navideño inolvidable en Barranquilla',
    description: 'Celebra la Navidad en el evento más mágico del año. SANTALAND 2025 te espera con sorpresas, música y diversión para toda la familia.',
    fullDescription: 'SANTALAND 2025 es el evento navideño más esperado del año en Barranquilla. Disfruta de tres días llenos de magia, música en vivo, actividades para niños, shows especiales y la presencia de Papá Noel. Un espacio único para crear recuerdos inolvidables con tus seres queridos durante la temporada navideña.',
    date: '2025-12-12',
    time: '18:00',
    location: 'Barranquilla',
    price: 85000,
    category: 'Music',
    images: [
      'https://example.com/images/santaland-1.jpg',
      'https://example.com/images/santaland-2.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Llegar con 30 minutos de anticipación',
      'Presentar identificación al ingreso',
      'Evento familiar, recomendado para todas las edades',
      'Se permiten cámaras y celulares',
      'Prohibido ingresar con alimentos o bebidas',
    ],
    availableTickets: 1000,
    soldTickets: 350,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
    subtitle: 'El festival más importante de la música colombiana',
    description: 'Celebra la música colombiana con los mejores compositores del país en San Juan del Cesar.',
    fullDescription: 'El Festival Nacional de Compositores es un evento único que reúne a los mejores compositores y músicos de Colombia. Durante tres días, disfrutarás de conciertos, talleres, conversatorios y presentaciones especiales. Un espacio para honrar la riqueza musical de nuestro país y descubrir nuevos talentos en el corazón de La Guajira.',
    date: '2025-12-12',
    time: '19:00',
    location: 'San Juan del Cesar, La Guajira',
    price: 120000,
    category: 'Music',
    images: [
      'https://example.com/images/festival-compositores-1.jpg',
      'https://example.com/images/festival-compositores-2.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Llegar con anticipación debido al aforo esperado',
      'Presentar identificación al ingreso',
      'Se permiten cámaras para uso personal',
      'Espacio al aire libre, traer protección solar',
      'No se permite el ingreso de alimentos',
    ],
    availableTickets: 800,
    soldTickets: 420,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
    subtitle: 'Comedia navideña en vivo',
    description: 'Una noche llena de risas y diversión navideña. La comedia más esperada de la temporada en Barranquilla.',
    fullDescription: 'QUIÉN SE LLEVÓ LA NAVIDAD? es un espectáculo cómico navideño que promete hacerte reír durante toda la función. Con un elenco de reconocidos comediantes, esta obra combina humor, música y momentos emotivos para toda la familia. Una experiencia única que hará que tu temporada navideña sea aún más especial.',
    date: '2025-11-29',
    time: '20:00',
    location: 'Barranquilla',
    price: 75000,
    category: 'Comedy',
    images: [
      'https://example.com/images/quien-se-llevo-1.jpg',
      'https://example.com/images/quien-se-llevo-2.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Llegar con 30 minutos de anticipación',
      'Presentar identificación al ingreso',
      'Evento apto para toda la familia',
      'No se permiten grabaciones durante la función',
      'Prohibido ingresar con alimentos o bebidas',
      'Duración aproximada: 90 minutos',
    ],
    availableTickets: 600,
    soldTickets: 280,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'CONCIERTO DE ROCK NACIONAL',
    subtitle: 'Los mejores exponentes del rock colombiano',
    description: 'Una noche épica con las bandas más reconocidas del rock nacional.',
    fullDescription: 'Disfruta de un concierto inolvidable con las bandas más destacadas del rock colombiano. Un evento que reúne a varios artistas en una sola noche llena de energía, música en vivo y ambiente festivo.',
    date: '2025-12-20',
    time: '20:00',
    location: 'Bogotá',
    price: 95000,
    category: 'Music',
    images: [
      'https://example.com/images/rock-nacional-1.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Evento para mayores de 18 años',
      'Presentar identificación al ingreso',
      'No se permite el ingreso de cámaras profesionales',
    ],
    availableTickets: 500,
    soldTickets: 200,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'FESTIVAL DE ARTE URBANO',
    subtitle: 'Grafiti, música y cultura urbana',
    description: 'Celebra el arte urbano con este festival multidisciplinario.',
    fullDescription: 'Un festival que celebra todas las expresiones del arte urbano: grafiti en vivo, conciertos de hip-hop, breakdance y más. Un espacio para disfrutar y aprender sobre la cultura urbana.',
    date: '2025-12-15',
    time: '14:00',
    location: 'Medellín',
    price: 65000,
    category: 'Arts',
    images: [
      'https://example.com/images/arte-urbano-1.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Evento al aire libre',
      'Traer protección solar',
      'Se permiten cámaras',
    ],
    availableTickets: 700,
    soldTickets: 350,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'MARATÓN DE LA CIUDAD',
    subtitle: 'Corre por una causa',
    description: 'Participa en la maratón más importante de la ciudad.',
    fullDescription: 'Una maratón abierta a todos los niveles, desde principiantes hasta corredores experimentados. El evento incluye diferentes categorías y distancias, además de actividades para toda la familia.',
    date: '2025-12-10',
    time: '06:00',
    location: 'Cali',
    price: 50000,
    category: 'Sports',
    images: [
      'https://example.com/images/maraton-1.jpg',
    ],
    videoUrl: null,
    promoter: 'Eventu',
    instructions: [
      'Llegar 1 hora antes del inicio',
      'Traer hidratación personal',
      'Presentar certificado médico si es requerido',
    ],
    availableTickets: 2000,
    soldTickets: 800,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
