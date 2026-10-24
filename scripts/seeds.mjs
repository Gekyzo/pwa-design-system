// The apps that scripts/shots.mjs captures: for each, the localStorage it starts from and the screens
// it shoots. A seed value that is not a string is stored as its JSON. Each screen is reached from a
// fresh load by clicking `clicks` in order. Text is in Spanish, as the apps are used.

const item = (id, name, { list = 'active', bought = false, recurrent = false, shops = [], quantity = '' } = {}) =>
  ({ id, name, recurrent, list, bought, shops, quantity, aisle: '' });

const garment = (id, name, slot, season, color, brand) => ({ id, name, slot, season, color, brand, link: '', images: [] });

const nav = (view) => `.nav-item[data-view="${view}"]`;

// The default projects of pwa-nexus, with their labels, and the roadmap that the cache holds for each.
const PROJECTS = {
  'Gekyzo/shopping-list': 'Bodega',
  'Gekyzo/pwa-wardrobe': 'Attire',
  'Gekyzo/pwa-financial-calculator': 'Compound',
  'Gekyzo/pwa-shifts': 'Rota',
  'Gekyzo/pwa-nexus': 'Nexus',
  'Gekyzo/pwa-lists': 'Stash',
};

const roadmap = (sections) => `# Roadmap\n\n${Object.entries(sections)
  .map(([heading, items]) => `${heading}\n\n${items.map((entry) => `- ${entry}`).join('\n')}\n`).join('\n')}`;

const ROADMAPS = {
  'Gekyzo/shopping-list': roadmap({
    '## Planificado': ['**Lista por pasillos.** Ordenar los productos según el pasillo de cada supermercado.', '**Precios por tienda.** Guardar el último precio visto en cada tienda.', '**Compartir lista.** Enviar la lista por enlace a otra persona de casa.'],
    '## En curso': ['**Modo compra con una mano.** Botones grandes y gesto para tachar.'],
    '## Hecho': ['**Sugerencias de productos.** Los productos frecuentes salen primero.', '**Exportar a JSON.**'],
  }),
  'Gekyzo/pwa-wardrobe': roadmap({
    '## Planificado': ['**Conjuntos por estación.** Filtrar las prendas de verano o de invierno.', '**Fotos sin fondo.** Recortar el fondo de la foto de cada prenda.'],
    '### Ideas': ['**Calendario de uso.** Ver qué prendas no se usan desde hace meses.'],
    '## Hecho': ['**Etiquetas de color.**', '**Búsqueda por tipo de prenda.** Camisas, pantalones, calzado y accesorios.'],
  }),
  'Gekyzo/pwa-financial-calculator': roadmap({
    '## Planificado': ['**Aportaciones variables.** Permitir un importe distinto cada año.', '**Inflación ajustada.** Mostrar el capital final en euros de hoy.', '**Gráfico comparativo.** Dos escenarios en la misma gráfica.'],
    '## Hecho': ['**Interés compuesto mensual.**', '**Tabla anual exportable.** Exportar la tabla a CSV.'],
  }),
  'Gekyzo/pwa-shifts': roadmap({
    '## Planificado': ['**Turnos rotativos.** Patrones de mañana, tarde y noche que se repiten.', '**Avisos antes del turno.** Una notificación una hora antes.'],
    '## En curso': ['**Horas extra del mes.** Sumar las horas que pasan de la jornada.'],
    '## Hecho': ['**Vista de calendario mensual.**', '**Festivos nacionales.**'],
  }),
  'Gekyzo/pwa-nexus': roadmap({
    '## Planificado': ['**Deshacer un borrado durante la sincronización.** Descartar el borrado si aún no llegó a GitHub.', '**Varios ficheros por proyecto.** Leer también CHANGELOG.md.'],
    '### Diseño': ['**Arrastrar elementos entre secciones.** Mover un elemento con un gesto largo.'],
    '## En curso': ['**Búsqueda en todos los proyectos.** Un solo campo que busca en cada roadmap.'],
    '## Hecho': ['**Cola sin conexión.** Los cambios esperan hasta que vuelve la red.', '**Modo zurdo.**'],
  }),
  'Gekyzo/pwa-lists': roadmap({
    '## Planificado': ['**Listas anidadas.** Una lista dentro de otra, hasta dos niveles.', '**Plantillas.** Lista de viaje, de mudanza y de cumpleaños.'],
    '## Hecho': ['**Reordenar con arrastre.**', '**Tema oscuro.**'],
  }),
};

export const APPS = [
  {
    name: 'pwa-shopping-list',
    title: 'Bodega',
    seed: {
      'shopping.lang': 'es',
      'shopping.onboarded': '1',
      'shopping.v1': {
        version: 9,
        items: [
          item('seed-1', 'Leche', { recurrent: true, shops: ['Mercadona'], quantity: '6' }),
          item('seed-2', 'Pan', { recurrent: true }),
          item('seed-3', 'Huevos', { shops: ['Mercadona'], quantity: '12' }),
          item('seed-4', 'Patatas', { shops: ['Mercadona', 'Frutería'], quantity: '2 kg' }),
          item('seed-5', 'Tomates', { shops: ['Frutería'], quantity: '1 kg', bought: true }),
          item('seed-6', 'Aceite de oliva', { recurrent: true, shops: ['Mercadona'] }),
          item('seed-7', 'Lentejas', { shops: ['Mercadona'] }),
          item('seed-8', 'Chorizo', { shops: ['Carnicería'], quantity: '1' }),
          item('seed-9', 'Café', { bought: true }),
          item('seed-10', 'Papel de cocina'),
        ],
        recipes: [
          { id: 'seed-r1', name: 'Tortilla de patatas', products: ['Patatas', 'Huevos', 'Cebolla', 'Aceite de oliva'], url: '' },
          { id: 'seed-r2', name: 'Lentejas con chorizo', products: ['Lentejas', 'Chorizo', 'Zanahoria', 'Pimiento'], url: '' },
          { id: 'seed-r3', name: 'Ensalada César', products: ['Lechuga', 'Pollo', 'Parmesano', 'Picatostes'], url: '' },
          { id: 'seed-r4', name: 'Gazpacho', products: ['Tomates', 'Pepino', 'Pimiento', 'Ajo', 'Aceite de oliva'], url: '' },
        ],
        sent: [],
        group: 'none',
        sort: 'custom',
        menu: [
          { day: 0, meal: 'lunch', recipe: 'seed-r2' },
          { day: 0, meal: 'dinner', recipe: 'seed-r1' },
          { day: 1, meal: 'dinner', recipe: 'seed-r3' },
          { day: 2, meal: 'lunch', recipe: 'seed-r4' },
          { day: 3, meal: 'dinner', recipe: 'seed-r1' },
        ],
        aisles: [],
      },
    },
    screens: [
      { slug: 'list', clicks: [] },
      { slug: 'add', clicks: ['#fab'] },
      { slug: 'recipes', clicks: [nav('recipes')] },
      { slug: 'menu', clicks: [nav('menu')] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
  {
    name: 'pwa-template',
    title: 'Template',
    seed: {
      'pwa-template.lang': 'es',
      'pwa-template.onboarded': '1',
      'pwa-template.notes': {
        version: 1,
        notes: [
          { id: 'n-01', text: 'Comprar pan, leche y huevos para el desayuno del sábado' },
          { id: 'n-02', text: 'Llamar al dentista para pedir cita el martes por la tarde' },
          { id: 'n-03', text: 'Revisar la presión de las ruedas antes del viaje a Valencia' },
          { id: 'n-04', text: 'Regar las plantas del balcón y cambiar la tierra de la albahaca' },
          { id: 'n-05', text: 'Devolver el libro «Cien años de soledad» a la biblioteca' },
          { id: 'n-06', text: 'Pagar la factura de la luz antes del día 5' },
          { id: 'n-07', text: 'Reservar mesa para cuatro el viernes a las 21:00' },
        ],
      },
    },
    screens: [
      { slug: 'notes', clicks: [] },
      { slug: 'add', clicks: ['#fab'] },
      { slug: 'detail', clicks: ['#note-list .item-row:first-child .item-row-name'] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
  {
    name: 'pwa-wardrobe',
    title: 'Attire',
    // Outfits and palettes are not stored: the app works them out from the colours of the garments.
    seed: {
      'wardrobe.lang': 'es',
      'wardrobe.onboarded': '1',
      'wardrobe.garments': {
        version: 2,
        garments: [
          garment('g01', 'Camisa Oxford celeste', 'top', 'all', 112, 'Massimo Dutti'),
          garment('g02', 'Camiseta de algodón crema', 'top', 'warm', 38, 'Uniqlo'),
          garment('g03', 'Jersey de punto gris', 'top', 'cold', 156, 'COS'),
          garment('g04', 'Sobrecamisa color teja', 'top', 'all', 13, 'Zara'),
          garment('g05', 'Jersey de lana rojo', 'top', 'cold', 22, 'Mango'),
          garment('g06', 'Vaqueros azul oscuro', 'bottom', 'all', 129, "Levi's"),
          garment('g07', 'Pantalón negro de pinzas', 'bottom', 'all', 158, 'Zara'),
          garment('g08', 'Pantalón de lino crudo', 'bottom', 'warm', 41, 'Mango'),
          garment('g09', 'Chinos gris pizarra', 'bottom', 'all', 157, 'Dockers'),
          garment('g10', 'Cazadora vaquera', 'outer', 'all', 120, "Levi's"),
          garment('g11', 'Zapatillas blancas', 'shoes', 'all', 153, 'Veja'),
          garment('g12', 'Botines de ante marrón', 'shoes', 'cold', 82, 'Camper'),
        ],
      },
    },
    screens: [
      { slug: 'wardrobe', clicks: [] },
      { slug: 'garment', clicks: ['#garment-list li[data-id="g07"] .item-row-name'] },
      { slug: 'edit', clicks: ['#garment-list li[data-id="g07"] .item-row-name', '#garment-edit'] },
      { slug: 'palettes', clicks: [nav('combinations'), '#combination-wearable'] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
  {
    name: 'pwa-nexus',
    title: 'Nexus',
    // No token: the app renders the cache and asks GitHub for nothing.
    seed: {
      'pwa-nexus.lang': 'es',
      'pwa-nexus.onboarded': '1',
      'pwa-nexus.doc': {
        version: 1,
        projects: Object.entries(PROJECTS).map(([repo, label]) => ({ repo, label })),
        queue: [],
        defaults: Object.keys(PROJECTS),
      },
      'pwa-nexus.cache': Object.fromEntries(Object.keys(PROJECTS).map((repo, i) => [repo, {
        text: ROADMAPS[repo],
        sha: String(i + 1).repeat(40),
        fetchedAt: Date.UTC(2026, 9, 24, 7, 30) - i * 60_000,
      }])),
    },
    screens: [
      { slug: 'projects', clicks: [] },
      { slug: 'roadmap', clicks: ['#project-list li:nth-child(5) .item-row-name'] },
      { slug: 'item', clicks: ['#project-list li:nth-child(5) .item-row-name', '#roadmap-list .item-row-name'] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
  {
    name: 'pwa-shifts',
    title: 'Turnos',
    // Today comes from the clock of the browser; the cycle repeats, so any month has shifts.
    seed: {
      'pwa-shifts.lang': 'es',
      'pwa-shifts.onboarded': '1',
      'pwa-shifts.shifts': {
        version: 1,
        types: [
          { id: 't-manana', code: 'M', name: 'Mañana', color: 'orange', kind: 'work', start: '07:00', end: '15:00', breakMin: 30 },
          { id: 't-tarde', code: 'T', name: 'Tarde', color: 'blue', kind: 'work', start: '15:00', end: '23:00', breakMin: 30 },
          { id: 't-noche', code: 'N', name: 'Noche', color: 'purple', kind: 'work', start: '23:00', end: '07:00', breakMin: 45 },
          { id: 't-libre', code: 'L', name: 'Libre', color: 'grey', kind: 'off', start: '', end: '', breakMin: 0 },
          { id: 't-vacaciones', code: 'V', name: 'Vacaciones', color: 'teal', kind: 'leave', start: '', end: '', breakMin: 0 },
        ],
        cycles: [
          { from: '2026-09-11', steps: ['t-manana', 't-manana', 't-tarde', 't-tarde', 't-noche', 't-noche', 't-libre', 't-libre', 't-libre', 't-libre'] },
        ],
        days: {
          '2026-10-09': { type: 't-tarde', note: 'Cambio con Lucía' },
          '2026-10-16': { note: 'Revisión médica 9:30' },
          '2026-10-24': { note: 'Reunión de equipo a las 14:00' },
          '2026-10-28': { note: 'Formación PRL' },
          '2026-11-02': { type: 't-vacaciones' },
          '2026-11-03': { type: 't-vacaciones' },
          '2026-11-04': { type: 't-vacaciones', note: 'Viaje a Granada' },
        },
      },
    },
    screens: [
      { slug: 'month', clicks: [] },
      { slug: 'day', clicks: ['#month-grid .month-day[data-today]'] },
      { slug: 'agenda', clicks: [nav('agenda')] },
      { slug: 'plan', clicks: [nav('plan')] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
  {
    name: 'pwa-financial-calculator',
    title: 'Calculadora',
    seed: {
      'pwa-financial-calculator.lang': 'es',
      'pwa-financial-calculator.format': 'es-ES',
      'pwa-financial-calculator.onboarded': '1',
      'pwa-financial-calculator.inputs': {
        version: 1,
        format: 'es-ES',
        inputs: {
          loan: { amount: '200.000', rate: '3', years: '25' },
          deposit: { amount: '20.000', rate: '2,5', months: '12', compounding: 'maturity', tax: '19' },
          savings: { initial: '5.000', monthly: '250', rate: '4', years: '15' },
          interest: { solve: 'interest', principal: '10.000', rate: '3,5', years: '2', interest: '700' },
        },
      },
    },
    screens: [
      { slug: 'loan', clicks: [] },
      { slug: 'deposit', clicks: [nav('deposit')] },
      { slug: 'savings', clicks: [nav('savings')] },
      { slug: 'interest', clicks: [nav('interest')] },
      { slug: 'settings', clicks: [nav('settings')] },
    ],
  },
];
