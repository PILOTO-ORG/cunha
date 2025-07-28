
const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const pool = require('../db');

// GET /api/dashboard
router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const [orcamentosPendentes, reservasAtivas, viagensHoje, totalClientes, totalLocais, totalProdutos, produtosCamposFaltando, reservasFimHoje, reservasConcluidas] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM erp.reservas WHERE status = 'iniciada'"),
      pool.query("SELECT COUNT(*) FROM erp.reservas WHERE status = 'ativa'"),
      pool.query(`SELECT COUNT(*) FROM erp.reservas WHERE status = 'ativa' AND CURRENT_DATE BETWEEN data_inicio AND data_fim`),
      pool.query("SELECT COUNT(*) FROM erp.clientes"),
      pool.query("SELECT COUNT(*) FROM erp.locais"),
      pool.query("SELECT COUNT(*) FROM erp.produtos"),
      pool.query(`SELECT COUNT(*) FROM erp.produtos WHERE quantidade_total IS NULL OR valor_locacao IS NULL OR valor_danificacao IS NULL OR tempo_limpeza IS NULL`),
      pool.query(`SELECT COUNT(*) FROM erp.reservas WHERE data_fim = CURRENT_DATE`),
      pool.query("SELECT COUNT(*) FROM erp.reservas WHERE status = 'concluída'")
    ]);
    res.json({
      success: true,
      data: {
        orcamentos_pendentes: parseInt(orcamentosPendentes.rows[0].count),
        reservas_ativas: parseInt(reservasAtivas.rows[0].count),
        viagens_hoje: parseInt(viagensHoje.rows[0].count),
        total_clientes: parseInt(totalClientes.rows[0].count),
        total_locais: parseInt(totalLocais.rows[0].count),
        total_produtos: parseInt(totalProdutos.rows[0].count),
        produtos_campos_faltando: parseInt(produtosCamposFaltando.rows[0].count),
        reservas_fim_hoje: parseInt(reservasFimHoje.rows[0].count),
        reservas_concluidas: parseInt(reservasConcluidas.rows[0].count)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar indicadores do dashboard', error: err.message });
  }
});

// GET /api/dashboard/reservas-ativas
router.get('/reservas-ativas', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM erp.reservas WHERE status = 'ativa'");
    res.json({ success: true, data: { total: parseInt(result.rows[0].count) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar reservas ativas', error: err.message });
  }
});

// GET /api/dashboard/faturamento-mensal
router.get('/faturamento-mensal', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`SELECT COALESCE(SUM(p.valor_locacao * r.quantidade),0) AS total
      FROM erp.reservas r
      JOIN erp.produtos p ON r.id_produto = p.id_produto
      WHERE EXTRACT(MONTH FROM r.data_inicio) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM r.data_inicio) = EXTRACT(YEAR FROM NOW())
        AND r.status = 'ativa'`);
    res.json({ success: true, data: { total: parseFloat(result.rows[0].total) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar faturamento mensal', error: err.message });
  }
});

// GET /api/dashboard/produtos-disponiveis
router.get('/produtos-disponiveis', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT COALESCE(SUM(quantidade_total),0) AS total FROM erp.produtos");
    res.json({ success: true, data: { total: parseInt(result.rows[0].total) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos disponíveis', error: err.message });
  }
});

// GET /api/dashboard/clientes-ativos
router.get('/clientes-ativos', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM erp.clientes");
    res.json({ success: true, data: { total: parseInt(result.rows[0].count) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes ativos', error: err.message });
  }
});

// GET /api/dashboard/orcamentos-pendentes
router.get('/orcamentos-pendentes', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM erp.reservas WHERE status = 'iniciada'");
    res.json({ success: true, data: { total: parseInt(result.rows[0].count) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar orçamentos pendentes', error: err.message });
  }
});

// GET /api/dashboard/alertas-estoque
router.get('/alertas-estoque', jwtMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM erp.produtos WHERE quantidade_total < 1");
    res.json({ success: true, data: { total: parseInt(result.rows[0].count) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar alertas de estoque', error: err.message });
  }
});

module.exports = router;
