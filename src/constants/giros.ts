// Giros del SII (actividad económica) agrupados igual que las categorías de la empresa.
// Se guarda el texto visible con el código: "Restaurantes y servicio móvil de comidas (561000)".
// afectoIva queda como referencia: hoy no se muestra ni se usa en cálculos.
export interface GiroSII {
  codigo: string;
  nombre: string;
  afectoIva: boolean;
}

export interface GiroGroup {
  id: string;
  label: string;
  giros: readonly GiroSII[];
}

export const GIROS_SII: readonly GiroGroup[] = [
  {
    id: 'gastronomia',
    label: 'Gastronomía, Sabores y Vida Nocturna',
    giros: [
      { codigo: '561000', nombre: 'Restaurantes y servicio móvil de comidas', afectoIva: true },
      { codigo: '563001', nombre: 'Discotecas y pubs nocturnos', afectoIva: true },
      { codigo: '563009', nombre: 'Bares, cervecerías y servicio de bebidas', afectoIva: true },
      { codigo: '562100', nombre: 'Banquetería y comidas por encargo', afectoIva: true },
      { codigo: '472105', nombre: 'Panaderías y pastelerías (Local comercial)', afectoIva: true },
      { codigo: '107100', nombre: 'Elaboración de panadería y pastelería', afectoIva: true },
    ],
  },
  {
    id: 'comercio-retail',
    label: 'Tiendas, Productores y Comercio Minorista',
    giros: [
      { codigo: '014901', nombre: 'Apicultura (Miel y derivados)', afectoIva: true },
      { codigo: '477396', nombre: 'Recuerdos, artesanías y artículos típicos', afectoIva: true },
      { codigo: '472101', nombre: 'Almacenes, minimarkets y emporios', afectoIva: true },
      { codigo: '472102', nombre: 'Carnicerías y cecinas', afectoIva: true },
      { codigo: '472103', nombre: 'Verdulerías y fruterías', afectoIva: true },
      { codigo: '472104', nombre: 'Pescaderías y mariscos', afectoIva: true },
      { codigo: '472109', nombre: 'Confiterías y abarrotes especializados', afectoIva: true },
      { codigo: '472200', nombre: 'Botillerías', afectoIva: true },
      { codigo: '477102', nombre: 'Vestuario, boutiques y accesorios', afectoIva: true },
      { codigo: '477101', nombre: 'Calzado y zapaterías', afectoIva: true },
      { codigo: '477103', nombre: 'Maletería y marroquinería', afectoIva: true },
      { codigo: '475100', nombre: 'Telas, lanas y cordonería', afectoIva: true },
      { codigo: '475201', nombre: 'Ferreterías y materiales', afectoIva: true },
      { codigo: '475901', nombre: 'Mueblerías y colchonerías', afectoIva: true },
      { codigo: '476101', nombre: 'Librerías', afectoIva: true },
      { codigo: '476103', nombre: 'Papelerías y artículos de oficina', afectoIva: true },
      { codigo: '477397', nombre: 'Viveros, flores y plantas', afectoIva: true },
      { codigo: '477391', nombre: 'Pet shops (Alimentos y accesorios)', afectoIva: true },
      { codigo: '477394', nombre: 'Joyerías y relojerías', afectoIva: true },
      { codigo: '474100', nombre: 'Tecnología, accesorios y telefonía', afectoIva: true },
    ],
  },
  {
    id: 'turismo-experiencias',
    label: 'Turismo, Experiencias y Tiempo Libre',
    giros: [
      { codigo: '791100', nombre: 'Agencias de viajes', afectoIva: true },
      { codigo: '791200', nombre: 'Operadores turísticos (Excursiones guiadas)', afectoIva: true },
      { codigo: '492240', nombre: 'Transporte de turistas', afectoIva: false },
      { codigo: '551001', nombre: 'Hoteles', afectoIva: true },
      { codigo: '551003', nombre: 'Hostales y residenciales', afectoIva: true },
      { codigo: '551009', nombre: 'Cabañas y lodges turísticos', afectoIva: true },
      { codigo: '552000', nombre: 'Campings y sitios de motorhome', afectoIva: true },
      { codigo: '772100', nombre: 'Arriendo de equipamiento outdoor y deportivo', afectoIva: true },
      { codigo: '110200', nombre: 'Viñas con degustación (Enoturismo)', afectoIva: true },
    ],
  },
  {
    id: 'panoramas-eventos',
    label: 'Panoramas, Cultura y Espacios de Eventos',
    giros: [
      { codigo: '823000', nombre: 'Centros de eventos, convenciones y ferias', afectoIva: true },
      { codigo: '772900', nombre: 'Arriendo de mobiliario y vajilla para eventos', afectoIva: true },
      { codigo: '900001', nombre: 'Producción de espectáculos y obras de teatro', afectoIva: false },
      { codigo: '910200', nombre: 'Museos y centros de interpretación cultural', afectoIva: false },
      { codigo: '931102', nombre: 'Salas de billar y bowling', afectoIva: true },
      { codigo: '931109', nombre: 'Canchas deportivas y gimnasios', afectoIva: true },
      { codigo: '932100', nombre: 'Parques temáticos y atracciones', afectoIva: true },
      { codigo: '932901', nombre: 'Juegos electrónicos y pool', afectoIva: true },
      { codigo: '478100', nombre: 'Puestos de feria de alimentos y productos', afectoIva: true },
      { codigo: '478900', nombre: 'Puestos de feria artesanal y bazares', afectoIva: true },
    ],
  },
  {
    id: 'bienestar-belleza',
    label: 'Bienestar, Belleza y Cuidado Personal',
    giros: [
      { codigo: '960200', nombre: 'Peluquerías, barberías y estética', afectoIva: false },
      { codigo: '960902', nombre: 'Spas, masajes y saunas', afectoIva: true },
      { codigo: '477201', nombre: 'Farmacias', afectoIva: true },
      { codigo: '477203', nombre: 'Perfumerías y cosméticos', afectoIva: true },
      { codigo: '477393', nombre: 'Ópticas', afectoIva: true },
      { codigo: '862021', nombre: 'Centros médicos ambulatorios', afectoIva: false },
      { codigo: '862022', nombre: 'Clínicas odontológicas', afectoIva: false },
    ],
  },
  {
    id: 'servicios-barrio',
    label: 'Servicios Profesionales y Técnicos de Barrio',
    giros: [
      { codigo: '452002', nombre: 'Talleres mecánicos automotrices', afectoIva: true },
      { codigo: '452001', nombre: 'Lavado de vehículos', afectoIva: true },
      { codigo: '454003', nombre: 'Taller de reparación de motos', afectoIva: true },
      { codigo: '951100', nombre: 'Reparación de computadores y laptops', afectoIva: true },
      { codigo: '951200', nombre: 'Reparación de celulares y pantallas', afectoIva: true },
      { codigo: '952300', nombre: 'Reparación de calzado', afectoIva: true },
      { codigo: '802000', nombre: 'Cerrajerías', afectoIva: true },
      { codigo: '821900', nombre: 'Fotocopiado e impresiones rápidas', afectoIva: true },
      { codigo: '181109', nombre: 'Imprentas y letreros publicitarios', afectoIva: true },
      { codigo: '742001', nombre: 'Estudios y fotos carnet / revelado', afectoIva: true },
      { codigo: '750001', nombre: 'Clínicas veterinarias', afectoIva: true },
      { codigo: '682000', nombre: 'Corredoras de propiedades', afectoIva: false },
      { codigo: '532000', nombre: 'Agencias de encomiendas y envíos', afectoIva: true },
    ],
  },
];

export const giroLabel = (giro: GiroSII) => `${giro.nombre} (${giro.codigo})`;

// Grupos con el formato que espera el select del perfil.
export const GIRO_SELECT_GROUPS = GIROS_SII.map((group) => ({ label: group.label, options: group.giros.map(giroLabel) }));

export const GIRO_OPTIONS: string[] = GIRO_SELECT_GROUPS.flatMap((group) => group.options);

// Un giro escrito a mano antes de esta lista no es válido: hay que elegirlo de nuevo.
export function isGiroOption(value: string | null | undefined): boolean {
  return GIRO_OPTIONS.includes(value ?? '');
}
