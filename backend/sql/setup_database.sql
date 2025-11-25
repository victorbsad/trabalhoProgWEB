-- ========================================
-- SCRIPT COMPLETO DE SETUP DO BANCO
-- Execute este script no SQL Server
-- ========================================

-- 1. Criar o banco de dados (se não existir)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'produtos_db')
BEGIN
    CREATE DATABASE produtos_db;
    PRINT 'Banco de dados produtos_db criado com sucesso!';
END
ELSE
BEGIN
    PRINT 'Banco de dados produtos_db já existe.';
END
GO

-- 2. Usar o banco de dados
USE produtos_db;
GO

-- 3. Criar a tabela produtos (se não existir)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'produtos')
BEGIN
    CREATE TABLE produtos (
        id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        nome NVARCHAR(255) NOT NULL,
        descricao NVARCHAR(MAX),
        preco DECIMAL(10, 2) NOT NULL,
        estoque INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
        categoria_id INT,
        criado_em DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
        atualizado_em DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_produtos PRIMARY KEY (id)
    );
    PRINT 'Tabela produtos criada com sucesso!';
END
ELSE
BEGIN
    PRINT 'Tabela produtos já existe.';
END
GO

-- 4. Inserir dados de exemplo
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id) VALUES
('Notebook Dell Inspiron', 'Notebook com processador Intel Core i5, 8GB RAM, SSD 256GB', 3499.90, 15, 1),
('Mouse Logitech MX Master', 'Mouse ergonômico sem fio com precisão avançada', 399.90, 50, 2),
('Teclado Mecânico Redragon', 'Teclado mecânico RGB com switches blue', 299.90, 30, 2),
('Monitor LG 24"', 'Monitor Full HD IPS 24 polegadas 75Hz', 899.90, 20, 3),
('Webcam Logitech C920', 'Webcam Full HD 1080p com microfone embutido', 499.90, 25, 4),
('Headset HyperX Cloud', 'Headset gamer com som surround 7.1', 349.90, 40, 5),
('SSD Samsung 500GB', 'SSD NVMe M.2 com velocidade de leitura de 3500 MB/s', 449.90, 60, 6),
('Memória RAM 16GB', 'Memória DDR4 3200MHz Kingston HyperX', 349.90, 35, 6);
GO

-- 5. Verificar os dados inseridos
SELECT 
    id,
    nome,
    descricao,
    preco,
    estoque,
    categoria_id,
    criado_em,
    atualizado_em
FROM produtos
ORDER BY criado_em DESC;
GO

PRINT 'Setup completo! Total de produtos cadastrados:';
SELECT COUNT(*) as total FROM produtos;
GO
