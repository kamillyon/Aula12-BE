// server.js — Integração Express + Supabase (Aula 12: CRUD - Create)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./src/config/supabaseClient');

const app = express();
const PORT = process.env.PORT || 3011;

// =========================================================================
// MIDDLEWARES ESSENCIAIS
// =========================================================================
app.use(cors());
// CRÍTICO: Sem express.json(), o req.body chega como 'undefined'!
app.use(express.json());

// Rota de saúde da API
app.get('/', (req, res) => {
  res.json({ status: 'API Online 🚀', aula: '12 - CRUD Create (POST)' });
});

// =========================================================================
// [R] READ — Rota da Aula 11 (Para conferir os produtos cadastrados)
// =========================================================================
app.get('/api/lanches', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lanches')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao buscar produtos.' });
  }
});

// =========================================================================
// [C] CREATE — Rota Principal da Aula 12 (Inserção na Nuvem)
// =========================================================================
app.post('/api/lanches', async (req, res) => {
  try {
    // 1. Desempacotando o payload JSON enviado pelo cliente
    const { nome, ingredientes, preco } = req.body;

    // 2. Validação básica antes de acionar o banco na nuvem
    if (!nome || !ingredientes || preco === undefined) {
      return res.status(400).json({
        erro: 'Os campos "nome", "ingredientes" e "preco" são obrigatórios no JSON!'
      });
    }

    // 3. Persistindo no Supabase e aplicando o Efeito Bumerangue (.select())
    const { data, error } = await supabase
      .from('lanches')
      .insert([
        {
          "nome": nome,
          "ingredientes": ingredientes,
          "preco": preco
        }
      ])
      .select(); // Força o retorno do registro recém-criado com ID e created_at

    // 4. Tratamento de erro retornado pelo Supabase/PostgreSQL
    if (error) {
      return res.status(400).json({ erro: error.message });
    }

    // 5. Resposta padrão RESTful para criação bem-sucedida: 201 Created
    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso na nuvem!',
      registro: data[0]
    });

  } catch (err) {
    console.error('Erro inesperado:', err);
    return res.status(500).json({ erro: 'Falha interna no servidor.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}/api/lanches`);
});