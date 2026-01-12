-- ============================================
-- GymWear Shop - Script de inicialización
-- ============================================
-- Este script se ejecuta automáticamente en PostgreSQL
-- Solo se usa si ddl-auto=none, de lo contrario Hibernate crea las tablas

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    base_price DECIMAL(10, 2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    grand_total DECIMAL(10, 2),
    shipping_address_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de orden
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_variant_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2),
    line_total DECIMAL(10, 2)
);

-- ============================================
-- Datos de ejemplo
-- ============================================

-- Insertar categorías de ejemplo
INSERT INTO categories (name, slug, description) VALUES 
    ('Camisetas', 'camisetas', 'Camisetas deportivas'),
    ('Pantalones', 'pantalones', 'Pantalones y shorts deportivos'),
    ('Calzado', 'calzado', 'Zapatillas deportivas'),
    ('Accesorios', 'accesorios', 'Accesorios de gimnasio')
ON CONFLICT DO NOTHING;

-- Insertar usuario admin de ejemplo
INSERT INTO users (name, email, password_hash, role) VALUES 
    ('Admin', 'admin@gymwear.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (category_id, name, slug, description, base_price, active) VALUES 
    (1, 'Camiseta Dry-Fit Pro', 'camiseta-dry-fit-pro', 'Camiseta deportiva con tecnología Dry-Fit', 29.99, true),
    (1, 'Tank Top Training', 'tank-top-training', 'Tank top para entrenamiento intenso', 24.99, true),
    (2, 'Short Flex', 'short-flex', 'Short elástico para máxima movilidad', 34.99, true),
    (2, 'Jogger Sport', 'jogger-sport', 'Jogger cómodo para gimnasio', 44.99, true),
    (3, 'Zapatillas Cross-Training', 'zapatillas-cross-training', 'Zapatillas versátiles para todo tipo de ejercicio', 89.99, true),
    (4, 'Guantes Gym Pro', 'guantes-gym-pro', 'Guantes con soporte de muñeca', 19.99, true)
ON CONFLICT DO NOTHING;
