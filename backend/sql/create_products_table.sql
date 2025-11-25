-- Tabela de produtos para PostgreSQL
CREATE TABLE IF NOT EXISTS produtos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    categoria_id INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dados de exemplo
-- Categoria 1: Eletrônicos
-- Categoria 2: Informática  
-- Categoria 3: Smartphones
-- Categoria 4: Acessórios

INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id) VALUES
-- Eletrônicos (categoria_id = 1)
('Smart TV Samsung 50"', 'Smart TV 4K UHD 50 polegadas com HDR', 2499.90, 10, 1),
('Soundbar JBL', 'Soundbar 2.1 com subwoofer wireless 300W', 899.90, 15, 1),
('Console PlayStation 5', 'Console de videogame nova geração com SSD ultra-rápido', 4299.90, 5, 1),
('Câmera Canon EOS', 'Câmera DSLR 24MP com lente 18-55mm', 3499.90, 8, 1),

-- Informática (categoria_id = 2)
('Notebook Dell Inspiron', 'Notebook Intel Core i5, 8GB RAM, SSD 256GB', 3499.90, 15, 2),
('Mouse Logitech MX Master', 'Mouse ergonômico sem fio com precisão avançada', 399.90, 50, 2),
('Teclado Mecânico Redragon', 'Teclado mecânico RGB com switches blue', 299.90, 30, 2),
('Monitor LG 24"', 'Monitor Full HD IPS 24 polegadas 75Hz', 899.90, 20, 2),
('SSD Samsung 500GB', 'SSD NVMe M.2 velocidade 3500 MB/s', 449.90, 60, 2),
('Memória RAM 16GB', 'Memória DDR4 3200MHz Kingston HyperX', 349.90, 35, 2),

-- Smartphones (categoria_id = 3)
('iPhone 14 Pro', 'Smartphone Apple 256GB com câmera 48MP', 7999.90, 12, 3),
('Samsung Galaxy S23', 'Smartphone Android 5G 256GB', 4499.90, 18, 3),
('Xiaomi Redmi Note 12', 'Smartphone 128GB com carregamento rápido', 1799.90, 25, 3),
('Motorola Edge 40', 'Smartphone 5G com tela OLED 144Hz', 2299.90, 20, 3),

-- Acessórios (categoria_id = 4)
('Webcam Logitech C920', 'Webcam Full HD 1080p com microfone embutido', 499.90, 25, 4),
('Headset HyperX Cloud', 'Headset gamer com som surround 7.1', 349.90, 40, 4),
('Carregador Wireless', 'Carregador sem fio 15W compatível com iPhone e Samsung', 129.90, 50, 4),
('Capa Protetora Universal', 'Capa de silicone premium para smartphones', 49.90, 100, 4),
('Suporte para Notebook', 'Suporte ergonômico ajustável de alumínio', 149.90, 30, 4)
ON CONFLICT DO NOTHING;
