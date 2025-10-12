// ESTE ARQUIVO É GERADO AUTOMATICAMENTE.
// NÃO EDITE MANUALMENTE. ATUALIZE shared/reservaSchema.json E EXECUTE scripts/sync-reserva-schema.js

export const reservaSchema = {
  "status": [
    "orcamento",
    "aprovado",
    "pendente",
    "confirmada",
    "em_andamento",
    "concluida",
    "cancelada"
  ],
  "defaults": {
    "orcamentoStatus": "orcamento",
    "reservaStatus": "pendente"
  },
  "itemFields": {
    "diasLocacao": "dias_locacao",
    "quantidade": "quantidade",
    "valorUnitario": "valor_unitario",
    "valorTotal": "valor_total"
  }
} as const;

export type ReservaStatus = typeof reservaSchema.status[number];
export type OrcamentoDefaultStatus = typeof reservaSchema.defaults.orcamentoStatus;
export type ReservaDefaultStatus = typeof reservaSchema.defaults.reservaStatus;
export type ReservaItemDiasField = typeof reservaSchema.itemFields.diasLocacao;
