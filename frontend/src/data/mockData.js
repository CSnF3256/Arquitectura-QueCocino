export const mockUsers = [
  {id: 101, nombre: 'Ana Torres', email: 'ana@demo.com', tipo_dieta: 'normal', alergias: 'ninguna', presupuesto: 5, tiempo_disponible: 30},
  {id: 102, nombre: 'Luis Méndez', email: 'luis@demo.com', tipo_dieta: 'vegetariano', alergias: 'mariscos', presupuesto: 4, tiempo_disponible: 20},
  {id: 103, nombre: 'Camila Ruiz', email: 'camila@demo.com', tipo_dieta: 'sin lactosa', alergias: 'lactosa', presupuesto: 6, tiempo_disponible: 45}
];

export const mockIngredients = [
  {id: 1, nombre: 'arroz', cantidad: 1, unidad: 'kg', fecha_vencimiento: '2026-07-07', categoria: 'granos'},
  {id: 2, nombre: 'pollo', cantidad: 1, unidad: 'kg', fecha_vencimiento: '2026-07-04', categoria: 'proteina'},
  {id: 3, nombre: 'tomate', cantidad: 4, unidad: 'unidad', fecha_vencimiento: '2026-07-03', categoria: 'verduras'},
  {id: 4, nombre: 'cebolla', cantidad: 2, unidad: 'unidad', fecha_vencimiento: '2026-07-08', categoria: 'verduras'},
  {id: 5, nombre: 'papa', cantidad: 3, unidad: 'unidad', fecha_vencimiento: '2026-07-10', categoria: 'tuberculos'},
  {id: 6, nombre: 'huevo', cantidad: 6, unidad: 'unidad', fecha_vencimiento: '2026-07-12', categoria: 'proteina'},
  {id: 7, nombre: 'atún', cantidad: 2, unidad: 'lata', fecha_vencimiento: '2026-08-01', categoria: 'proteina'},
  {id: 8, nombre: 'pasta', cantidad: 500, unidad: 'g', fecha_vencimiento: '2026-08-12', categoria: 'granos'},
  {id: 9, nombre: 'brócoli', cantidad: 1, unidad: 'unidad', fecha_vencimiento: '2026-07-05', categoria: 'verduras'},
  {id: 10, nombre: 'leche', cantidad: 1, unidad: 'l', fecha_vencimiento: '2026-07-04', categoria: 'lacteos'},
  {id: 11, nombre: 'queso', cantidad: 250, unidad: 'g', fecha_vencimiento: '2026-07-09', categoria: 'lacteos'},
  {id: 12, nombre: 'zanahoria', cantidad: 4, unidad: 'unidad', fecha_vencimiento: '2026-07-11', categoria: 'verduras'}
];

export const mockRecipes = [
  {id: 1, nombre: 'Arroz con pollo rápido', descripcion: 'Clásico casero con verduras y arroz.', tiempo: 30, costo_estimado: 4.5, dificultad: 'media', ingredientes: ['arroz', 'pollo', 'tomate', 'cebolla'], etiquetas: ['para hoy', 'familiar']},
  {id: 2, nombre: 'Tortilla de papa', descripcion: 'Rendidora, dorada y económica.', tiempo: 25, costo_estimado: 2.8, dificultad: 'facil', ingredientes: ['papa', 'huevo', 'cebolla'], etiquetas: ['económica', 'rápida']},
  {id: 3, nombre: 'Pasta al pomodoro', descripcion: 'Salsa fresca de tomate con pasta.', tiempo: 20, costo_estimado: 3.1, dificultad: 'facil', ingredientes: ['pasta', 'tomate', 'cebolla', 'queso'], etiquetas: ['rápida']},
  {id: 4, nombre: 'Ensalada de atún', descripcion: 'Ligera, fresca y práctica.', tiempo: 12, costo_estimado: 3.4, dificultad: 'facil', ingredientes: ['atún', 'tomate', 'cebolla', 'zanahoria'], etiquetas: ['saludable', 'ligera']},
  {id: 5, nombre: 'Sopa de verduras', descripcion: 'Reconfortante y perfecta para aprovechar vegetales.', tiempo: 35, costo_estimado: 2.6, dificultad: 'facil', ingredientes: ['papa', 'zanahoria', 'cebolla', 'brócoli'], etiquetas: ['saludable']},
  {id: 6, nombre: 'Pollo al curry', descripcion: 'Pollo especiado con base cremosa.', tiempo: 40, costo_estimado: 5.6, dificultad: 'media', ingredientes: ['pollo', 'leche', 'cebolla', 'arroz'], etiquetas: ['gourmet']},
  {id: 7, nombre: 'Crema de brócoli', descripcion: 'Cremosa y suave para una cena ligera.', tiempo: 28, costo_estimado: 3.7, dificultad: 'facil', ingredientes: ['brócoli', 'leche', 'queso', 'cebolla'], etiquetas: ['saludable']},
  {id: 8, nombre: 'Lomo saltado', descripcion: 'Inspiración casera con papas y vegetales.', tiempo: 45, costo_estimado: 6.5, dificultad: 'media', ingredientes: ['papa', 'tomate', 'cebolla'], etiquetas: ['para hoy']}
];

export const serviceMap = [
  'API Gateway', 'Servicio Usuario', 'Servicio Recetas', 'Servicio Menú',
  'Servicio Notificaciones', 'AS2 Adapter', 'RabbitMQ', 'Redis', 'PostgreSQL', 'Prometheus'
];
