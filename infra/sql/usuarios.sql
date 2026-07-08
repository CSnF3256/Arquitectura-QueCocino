CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  tipo_dieta VARCHAR(50) DEFAULT 'normal',
  alergias TEXT DEFAULT '',
  tiempo_disponible INT DEFAULT 30,
  presupuesto NUMERIC(10,2) DEFAULT 5
);
CREATE TABLE IF NOT EXISTS despensa (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  nombre VARCHAR(100) NOT NULL,
  cantidad NUMERIC(10,2) DEFAULT 1,
  unidad VARCHAR(20) DEFAULT 'unidad',
  fecha_vencimiento DATE
);
CREATE INDEX IF NOT EXISTS idx_despensa_usuario ON despensa(usuario_id);
CREATE INDEX IF NOT EXISTS idx_despensa_nombre ON despensa(nombre);

INSERT INTO usuarios(nombre,email,tipo_dieta,alergias,tiempo_disponible,presupuesto) VALUES
('Ana Torres', 'ana@demo.com', 'normal', 'ninguna', 30, 5.00),
('Luis Méndez', 'luis@demo.com', 'vegetariano', 'mariscos', 20, 4.00),
('Camila Ruiz', 'camila@demo.com', 'sin lactosa', 'lactosa', 45, 6.00)
ON CONFLICT(email) DO NOTHING;
