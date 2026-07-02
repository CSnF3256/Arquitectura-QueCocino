CREATE TABLE IF NOT EXISTS recetas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  descripcion TEXT,
  tiempo INT,
  dificultad VARCHAR(50),
  costo_estimado NUMERIC(10,2)
);
CREATE TABLE IF NOT EXISTS receta_ingredientes (
  id SERIAL PRIMARY KEY,
  receta_id INT REFERENCES recetas(id),
  ingrediente VARCHAR(100) NOT NULL,
  cantidad NUMERIC(10,2),
  unidad VARCHAR(20),
  obligatorio BOOLEAN DEFAULT true,
  UNIQUE(receta_id, ingrediente)
);
CREATE INDEX IF NOT EXISTS idx_recetas_nombre ON recetas(nombre);
CREATE INDEX IF NOT EXISTS idx_receta_ingrediente ON receta_ingredientes(ingrediente);
CREATE INDEX IF NOT EXISTS idx_receta_ingrediente_lower ON receta_ingredientes(lower(ingrediente));

INSERT INTO recetas(nombre, descripcion, tiempo, dificultad, costo_estimado) VALUES
('Arroz con pollo rápido', 'Receta económica usando arroz y pollo.', 30, 'facil', 4.50),
('Ensalada de atún', 'Receta fría y rápida con atún y vegetales.', 15, 'facil', 3.50),
('Tortilla de papa', 'Plato casero con papa y huevo.', 25, 'media', 2.80),
('Pasta al pomodoro', 'Pasta con salsa de tomate fresco y albahaca.', 20, 'facil', 3.20),
('Sopa de verduras', 'Caldo reconfortante con zanahoria, papa y apio.', 35, 'facil', 2.50),
('Tortilla española', 'Clásico ibérico de papa y huevo.', 25, 'media', 2.80),
('Pollo al curry', 'Pechugas en salsa de curry con leche de coco.', 40, 'media', 5.50),
('Crema de brócoli', 'Sopa crema suave con brócoli y queso.', 30, 'facil', 3.00),
('Lomo saltado', 'Salteado latino de carne, tomate y papa frita.', 25, 'media', 6.50)
ON CONFLICT(nombre) DO NOTHING;

INSERT INTO receta_ingredientes(receta_id, ingrediente, cantidad, unidad, obligatorio)
SELECT r.id, v.ingrediente, v.cantidad, v.unidad, v.obligatorio
FROM (VALUES
('Arroz con pollo rápido','arroz',1,'taza',true),
('Arroz con pollo rápido','pollo',300,'g',true),
('Arroz con pollo rápido','cebolla',1,'unidad',false),
('Ensalada de atún','atun',1,'lata',true),
('Ensalada de atún','lechuga',1,'unidad',false),
('Ensalada de atún','tomate',1,'unidad',false),
('Tortilla de papa','papa',3,'unidad',true),
('Tortilla de papa','huevo',2,'unidad',true),
('Pasta al pomodoro','pasta',200,'g',true),
('Pasta al pomodoro','tomate',3,'unidad',true),
('Pasta al pomodoro','ajo',2,'unidad',false),
('Sopa de verduras','zanahoria',2,'unidad',true),
('Sopa de verduras','papa',2,'unidad',true),
('Sopa de verduras','apio',1,'tallo',false),
('Tortilla española','papa',3,'unidad',true),
('Tortilla española','huevo',3,'unidad',true),
('Tortilla española','cebolla',1,'unidad',false),
('Pollo al curry','pollo',300,'g',true),
('Pollo al curry','cebolla',1,'unidad',true),
('Pollo al curry','ajo',3,'unidad',false),
('Crema de brócoli','brocoli',2,'unidad',true),
('Crema de brócoli','queso',50,'g',false),
('Lomo saltado','carne',300,'g',true),
('Lomo saltado','papa',2,'unidad',true),
('Lomo saltado','tomate',2,'unidad',true)
) AS v(receta_nombre, ingrediente, cantidad, unidad, obligatorio)
JOIN recetas r ON r.nombre = v.receta_nombre
ON CONFLICT(receta_id, ingrediente) DO NOTHING;
