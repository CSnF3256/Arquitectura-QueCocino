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
  {id: 8, nombre: 'Lomo saltado', descripcion: 'Inspiración casera con papas y vegetales.', tiempo: 45, costo_estimado: 6.5, dificultad: 'media', ingredientes: ['carne', 'papa', 'tomate', 'cebolla'], etiquetas: ['para hoy']},
  {id: 9, nombre: 'Bowl vegetariano de arroz', descripcion: 'Arroz, brócoli y zanahoria con toque fresco.', tiempo: 22, costo_estimado: 3.2, dificultad: 'facil', ingredientes: ['arroz', 'brócoli', 'zanahoria', 'tomate'], etiquetas: ['saludable', 'vegetariano']},
  {id: 10, nombre: 'Shakshuka casera', descripcion: 'Huevos cocidos en salsa de tomate y cebolla.', tiempo: 24, costo_estimado: 3.6, dificultad: 'media', ingredientes: ['huevo', 'tomate', 'cebolla'], etiquetas: ['rápida', 'para hoy']},
  {id: 11, nombre: 'Papas doradas con queso', descripcion: 'Guarnición contundente con papa y queso.', tiempo: 32, costo_estimado: 2.9, dificultad: 'facil', ingredientes: ['papa', 'queso', 'cebolla'], etiquetas: ['económica']},
  {id: 12, nombre: 'Arroz salteado con huevo', descripcion: 'Salteado rápido para aprovechar arroz y verduras.', tiempo: 18, costo_estimado: 2.7, dificultad: 'facil', ingredientes: ['arroz', 'huevo', 'zanahoria', 'cebolla'], etiquetas: ['rápida', 'económica']},
  {id: 13, nombre: 'Pasta con brócoli', descripcion: 'Pasta ligera con brócoli y ajo.', tiempo: 23, costo_estimado: 3.3, dificultad: 'facil', ingredientes: ['pasta', 'brócoli', 'ajo'], etiquetas: ['vegetariano', 'rápida']},
  {id: 14, nombre: 'Tomates rellenos de arroz', descripcion: 'Tomates horneados con arroz especiado.', tiempo: 38, costo_estimado: 3.1, dificultad: 'media', ingredientes: ['tomate', 'arroz', 'cebolla'], etiquetas: ['vegetariano', 'saludable']},
  {id: 15, nombre: 'Ensalada tibia de papa', descripcion: 'Papa, huevo y zanahoria en versión casera.', tiempo: 26, costo_estimado: 3.0, dificultad: 'facil', ingredientes: ['papa', 'huevo', 'zanahoria'], etiquetas: ['económica']},
  {id: 16, nombre: 'Pollo con papas al horno', descripcion: 'Receta familiar de bandeja con verduras.', tiempo: 50, costo_estimado: 5.8, dificultad: 'media', ingredientes: ['pollo', 'papa', 'cebolla', 'zanahoria'], etiquetas: ['familiar']},
  {id: 17, nombre: 'Sopa de tomate', descripcion: 'Sopa suave y aromática con tomate y cebolla.', tiempo: 25, costo_estimado: 2.4, dificultad: 'facil', ingredientes: ['tomate', 'cebolla', 'ajo'], etiquetas: ['saludable', 'económica']},
  {id: 18, nombre: 'Arepitas de queso', descripcion: 'Bocados rápidos con queso para acompañar.', tiempo: 20, costo_estimado: 3.8, dificultad: 'facil', ingredientes: ['queso', 'huevo'], etiquetas: ['rápida']},
  {id: 19, nombre: 'Curry vegetal', descripcion: 'Verduras con arroz y especias suaves.', tiempo: 35, costo_estimado: 4.2, dificultad: 'media', ingredientes: ['arroz', 'brócoli', 'zanahoria', 'cebolla'], etiquetas: ['vegetariano', 'saludable']},
  {id: 20, nombre: 'Frittata de verduras', descripcion: 'Huevos al horno con verduras disponibles.', tiempo: 30, costo_estimado: 3.5, dificultad: 'facil', ingredientes: ['huevo', 'tomate', 'brócoli', 'cebolla'], etiquetas: ['saludable']},
  {id: 21, nombre: 'Bowl de quinua y verduras', descripcion: 'Quinua con tomate, zanahoria y brócoli para una comida fresca.', tiempo: 28, costo_estimado: 4.1, dificultad: 'facil', ingredientes: ['quinua', 'tomate', 'zanahoria', 'brócoli'], etiquetas: ['saludable', 'vegetariano', 'ligera']},
  {id: 22, nombre: 'Lentejas guisadas', descripcion: 'Guiso nutritivo con lentejas, zanahoria y cebolla.', tiempo: 40, costo_estimado: 2.9, dificultad: 'facil', ingredientes: ['lenteja', 'zanahoria', 'cebolla', 'tomate'], etiquetas: ['saludable', 'económica', 'vegetariano']},
  {id: 23, nombre: 'Wrap de pollo y verduras', descripcion: 'Tortilla suave con pollo, tomate y vegetales crujientes.', tiempo: 18, costo_estimado: 4.8, dificultad: 'facil', ingredientes: ['pollo', 'tomate', 'lechuga', 'zanahoria'], etiquetas: ['rápida', 'para hoy']},
  {id: 24, nombre: 'Ensalada de garbanzos', descripcion: 'Garbanzos con tomate, pepino y cebolla en version fresca.', tiempo: 15, costo_estimado: 3.2, dificultad: 'facil', ingredientes: ['garbanzo', 'tomate', 'pepino', 'cebolla'], etiquetas: ['saludable', 'vegetariano', 'rápida']},
  {id: 25, nombre: 'Omelette de espinaca', descripcion: 'Huevos suaves con espinaca y tomate.', tiempo: 14, costo_estimado: 2.7, dificultad: 'facil', ingredientes: ['huevo', 'espinaca', 'tomate'], etiquetas: ['saludable', 'rápida', 'económica']},
  {id: 26, nombre: 'Pasta primavera', descripcion: 'Pasta con zanahoria, brócoli y tomate.', tiempo: 26, costo_estimado: 3.9, dificultad: 'facil', ingredientes: ['pasta', 'zanahoria', 'brócoli', 'tomate'], etiquetas: ['vegetariano', 'saludable']},
  {id: 27, nombre: 'Arroz con lentejas', descripcion: 'Arroz rendidor con lentejas y cebolla dorada.', tiempo: 32, costo_estimado: 2.6, dificultad: 'facil', ingredientes: ['arroz', 'lenteja', 'cebolla'], etiquetas: ['económica', 'vegetariano']},
  {id: 28, nombre: 'Tacos de frijol y tomate', descripcion: 'Tacos caseros con frijol, tomate y cebolla.', tiempo: 20, costo_estimado: 3.4, dificultad: 'facil', ingredientes: ['frijol', 'tomate', 'cebolla'], etiquetas: ['vegetariano', 'rápida', 'económica']},
  {id: 29, nombre: 'Pollo con arroz y zanahoria', descripcion: 'Plato casero suave para aprovechar arroz y pollo.', tiempo: 35, costo_estimado: 4.6, dificultad: 'facil', ingredientes: ['pollo', 'arroz', 'zanahoria', 'cebolla'], etiquetas: ['familiar', 'para hoy']},
  {id: 30, nombre: 'Sopa de lentejas', descripcion: 'Sopa caliente, nutritiva y economica.', tiempo: 38, costo_estimado: 2.8, dificultad: 'facil', ingredientes: ['lenteja', 'zanahoria', 'cebolla', 'tomate'], etiquetas: ['saludable', 'económica']},
  {id: 31, nombre: 'Ensalada de pasta fria', descripcion: 'Pasta fria con tomate, zanahoria y atun.', tiempo: 16, costo_estimado: 3.8, dificultad: 'facil', ingredientes: ['pasta', 'tomate', 'zanahoria', 'atún'], etiquetas: ['rápida', 'para hoy']},
  {id: 32, nombre: 'Calabacin salteado con arroz', descripcion: 'Arroz con calabacin y cebolla salteada.', tiempo: 22, costo_estimado: 3.1, dificultad: 'facil', ingredientes: ['arroz', 'calabacin', 'cebolla'], etiquetas: ['saludable', 'vegetariano', 'rápida']},
  {id: 33, nombre: 'Pescado al tomate', descripcion: 'Filete de pescado con tomate y cebolla.', tiempo: 24, costo_estimado: 5.4, dificultad: 'media', ingredientes: ['pescado', 'tomate', 'cebolla'], etiquetas: ['saludable', 'ligera']},
  {id: 34, nombre: 'Crepes de verduras', descripcion: 'Crepes suaves rellenos con verduras salteadas.', tiempo: 34, costo_estimado: 4.0, dificultad: 'media', ingredientes: ['huevo', 'leche', 'zanahoria', 'brócoli'], etiquetas: ['vegetariano']},
  {id: 35, nombre: 'Garbanzos al curry', descripcion: 'Garbanzos especiados con arroz y verduras.', tiempo: 30, costo_estimado: 3.7, dificultad: 'facil', ingredientes: ['garbanzo', 'arroz', 'cebolla', 'tomate'], etiquetas: ['saludable', 'vegetariano']},
  {id: 36, nombre: 'Bowl de atun y arroz', descripcion: 'Arroz con atun, tomate y zanahoria.', tiempo: 15, costo_estimado: 3.9, dificultad: 'facil', ingredientes: ['arroz', 'atún', 'tomate', 'zanahoria'], etiquetas: ['rápida', 'para hoy']},
  {id: 37, nombre: 'Sopa minestrone simple', descripcion: 'Sopa de pasta pequeña con verduras y frijoles.', tiempo: 36, costo_estimado: 3.3, dificultad: 'facil', ingredientes: ['pasta', 'tomate', 'zanahoria', 'frijol'], etiquetas: ['saludable', 'vegetariano']},
  {id: 38, nombre: 'Avena salada con huevo', descripcion: 'Avena cremosa salada con huevo y tomate.', tiempo: 12, costo_estimado: 2.2, dificultad: 'facil', ingredientes: ['avena', 'huevo', 'tomate'], etiquetas: ['saludable', 'rápida', 'económica']},
  {id: 39, nombre: 'Papas rellenas de verduras', descripcion: 'Papas horneadas con brócoli, zanahoria y cebolla.', tiempo: 42, costo_estimado: 3.6, dificultad: 'media', ingredientes: ['papa', 'brócoli', 'zanahoria', 'cebolla'], etiquetas: ['vegetariano', 'económica']},
  {id: 40, nombre: 'Arroz mediterraneo', descripcion: 'Arroz con tomate, garbanzo y verduras frescas.', tiempo: 27, costo_estimado: 3.5, dificultad: 'facil', ingredientes: ['arroz', 'tomate', 'garbanzo', 'pepino'], etiquetas: ['saludable', 'vegetariano']},
  {id: 41, nombre: 'Pollo a la plancha con ensalada', descripcion: 'Pollo sencillo con tomate, lechuga y zanahoria.', tiempo: 22, costo_estimado: 5.0, dificultad: 'facil', ingredientes: ['pollo', 'tomate', 'lechuga', 'zanahoria'], etiquetas: ['saludable', 'rápida']},
  {id: 42, nombre: 'Salteado de verduras con huevo', descripcion: 'Verduras salteadas con huevo para una cena rapida.', tiempo: 17, costo_estimado: 2.9, dificultad: 'facil', ingredientes: ['huevo', 'brócoli', 'zanahoria', 'cebolla'], etiquetas: ['saludable', 'rápida', 'económica']}
];

export const serviceMap = [
  'API Gateway', 'Servicio Usuario', 'Servicio Recetas', 'Servicio Menú',
  'Servicio Notificaciones', 'AS2 Adapter', 'RabbitMQ', 'Redis', 'PostgreSQL', 'Prometheus'
];
