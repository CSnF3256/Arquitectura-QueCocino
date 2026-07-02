CREATE TABLE IF NOT EXISTS proveedor (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  as2_id VARCHAR(50) UNIQUE,
  activo BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS mensaje_as2 (
  id SERIAL PRIMARY KEY,
  proveedor_id INT REFERENCES proveedor(id),
  message_id VARCHAR(150) UNIQUE,
  checksum VARCHAR(100),
  estado VARCHAR(30),
  fecha_recepcion TIMESTAMP DEFAULT now(),
  mdn_status VARCHAR(30)
);
CREATE TABLE IF NOT EXISTS catalogo_vigente (
  id SERIAL PRIMARY KEY,
  supplier_id VARCHAR(50),
  external_product_code VARCHAR(100),
  canonical_ingredient VARCHAR(100),
  category VARCHAR(50),
  unit VARCHAR(20),
  price NUMERIC(10,2),
  stock NUMERIC(10,2),
  valid_from DATE,
  valid_to DATE
);
INSERT INTO proveedor(nombre, as2_id, activo) VALUES ('Proveedor Demo', 'SUP-001', true) ON CONFLICT DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_catalogo_supplier ON catalogo_vigente(supplier_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_ingredient ON catalogo_vigente(canonical_ingredient);
