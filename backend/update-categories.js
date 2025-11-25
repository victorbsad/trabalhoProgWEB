require('dotenv').config();
const { Client } = require('pg');

async function updateCategories() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.PG_PASSWORD || '1234',
    database: 'produtos_db',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco produtos_db');

    // Limpar produtos antigos
    await client.query('DELETE FROM produtos');
    console.log('🗑️  Produtos antigos removidos');

    // Inserir novos produtos com categorias corretas
    const produtos = [
      // Eletrônicos (categoria_id = 1)
      ['Smart TV Samsung 50"', 'Smart TV 4K UHD 50 polegadas com HDR', 2499.90, 10, 1],
      ['Soundbar JBL', 'Soundbar 2.1 com subwoofer wireless 300W', 899.90, 15, 1],
      ['Console PlayStation 5', 'Console de videogame nova geração com SSD ultra-rápido', 4299.90, 5, 1],
      ['Câmera Canon EOS', 'Câmera DSLR 24MP com lente 18-55mm', 3499.90, 8, 1],

      // Informática (categoria_id = 2)
      ['Notebook Dell Inspiron', 'Notebook Intel Core i5, 8GB RAM, SSD 256GB', 3499.90, 15, 2],
      ['Mouse Logitech MX Master', 'Mouse ergonômico sem fio com precisão avançada', 399.90, 50, 2],
      ['Teclado Mecânico Redragon', 'Teclado mecânico RGB com switches blue', 299.90, 30, 2],
      ['Monitor LG 24"', 'Monitor Full HD IPS 24 polegadas 75Hz', 899.90, 20, 2],
      ['SSD Samsung 500GB', 'SSD NVMe M.2 velocidade 3500 MB/s', 449.90, 60, 2],
      ['Memória RAM 16GB', 'Memória DDR4 3200MHz Kingston HyperX', 349.90, 35, 2],

      // Smartphones (categoria_id = 3)
      ['iPhone 14 Pro', 'Smartphone Apple 256GB com câmera 48MP', 7999.90, 12, 3],
      ['Samsung Galaxy S23', 'Smartphone Android 5G 256GB', 4499.90, 18, 3],
      ['Xiaomi Redmi Note 12', 'Smartphone 128GB com carregamento rápido', 1799.90, 25, 3],
      ['Motorola Edge 40', 'Smartphone 5G com tela OLED 144Hz', 2299.90, 20, 3],

      // Acessórios (categoria_id = 4)
      ['Webcam Logitech C920', 'Webcam Full HD 1080p com microfone embutido', 499.90, 25, 4],
      ['Headset HyperX Cloud', 'Headset gamer com som surround 7.1', 349.90, 40, 4],
      ['Carregador Wireless', 'Carregador sem fio 15W compatível com iPhone e Samsung', 129.90, 50, 4],
      ['Capa Protetora Universal', 'Capa de silicone premium para smartphones', 49.90, 100, 4],
      ['Suporte para Notebook', 'Suporte ergonômico ajustável de alumínio', 149.90, 30, 4]
    ];

    for (const [nome, descricao, preco, estoque, categoria_id] of produtos) {
      await client.query(
        'INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id) VALUES ($1, $2, $3, $4, $5)',
        [nome, descricao, preco, estoque, categoria_id]
      );
    }

    console.log(`✅ ${produtos.length} produtos inseridos com categorias corretas`);

    // Verificar por categoria
    const categorias = ['Eletrônicos', 'Informática', 'Smartphones', 'Acessórios'];
    for (let i = 1; i <= 4; i++) {
      const result = await client.query('SELECT COUNT(*) as total FROM produtos WHERE categoria_id = $1', [i]);
      console.log(`📦 Categoria ${i} (${categorias[i-1]}): ${result.rows[0].total} produtos`);
    }

    await client.end();
    console.log('\n🎉 Categorias atualizadas com sucesso!');
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

updateCategories();
