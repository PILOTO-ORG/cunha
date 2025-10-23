// ESTE ARQUIVO É GERADO AUTOMATICAMENTE.
// NÃO EDITE MANUALMENTE. ATUALIZE shared/reservaSchema.json E EXECUTE scripts/sync-reserva-schema.js

export const reservaSchema = {
  "orcamento": {
    "status": [
      "Criado",
      "Aprovado",
      "Cancelado"
    ],
    "defaults": {
      "status": "Criado"
    }
  },
  "reserva": {
    "status": [
      "Confirmado",
      "Preparado",
      "Enviado",
      "Locado",
      "Devolvido",
      "Faturado",
      "Encerrado",
      "Cancelado"
    ],
    "defaults": {
      "status": "Confirmado"
    }
  },
  "eventFields": {
    "eventoInicio": "evento_inicio",
    "eventoFim": "evento_fim",
    "eventoEntrega": "evento_entrega",
    "eventoRecolha": "evento_recolha"
  },
  "itemFields": {
    "diasLocacao": "dias_locacao",
    "quantidade": "quantidade",
    "valorUnitario": "valor_unitario",
    "valorTotal": "valor_total"
  }
} as const;

export type OrcamentoStatus = typeof reservaSchema.orcamento.status[number];
export type ReservaStatus = typeof reservaSchema.reserva.status[number];
export type OrcamentoDefaultStatus = typeof reservaSchema.orcamento.defaults.status;
export type ReservaDefaultStatus = typeof reservaSchema.reserva.defaults.status;
export type ReservaItemDiasField = typeof reservaSchema.itemFields.diasLocacao;
