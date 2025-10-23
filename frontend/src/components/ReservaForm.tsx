import React, { useEffect, useState } from 'react';
import ReservaCheckoutForm from './ReservaCheckoutForm';
import ReservaService from '../services/reservaService';
import ProdutoService from '../services/produtoService';
import type { Reserva, Produto, CriarReservaRequest, AtualizarReservaRequest } from '../types/api';

interface ReservaFormProps {
  reserva?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onSuccess, onCancel }) => {
  const [items, setItems] = useState<Array<{ produto: Produto; quantidade: number }>>([]);

  useEffect(() => {
    let mounted = true;
    const loadItems = async () => {
      if (!reserva) {
        setItems([]);
        return;
      }

  // start loading
      try {
        const itens = await ReservaService.buscarItensReserva(reserva.id_reserva);

        // buscar lista de produtos para popular nomes/valores
        const produtosResp = await ProdutoService.listarProdutos({ limit: 1000 });
        const produtos = Array.isArray(produtosResp)
          ? produtosResp
          : (produtosResp && (produtosResp as any).data) || [];

        const mapped = (itens || []).map((i: any) => {
          const produto = produtos.find((p: any) => p.id_produto === i.id_produto) || {
            id_produto: i.id_produto,
            nome: i.produto_nome || `Produto ${i.id_produto}`,
            valor_locacao: Number(i.valor_unitario || 0),
            valor_danificacao: 0,
            quantidade_total: 0,
            descricao: ''
          };

          return { produto, quantidade: Number(i.quantidade || 1) };
        });

        if (mounted) setItems(mapped);
      } catch (err) {
        console.error('Erro ao carregar itens da reserva:', err);
        if (mounted) setItems([]);
      } finally {
        // finished loading
      }
    };

    loadItems();
    return () => {
      mounted = false;
    };
  }, [reserva]);

  // Reuse the OrcamentoCheckoutForm for identical UI. We pass reservation dates + items mapped above.
  return (
    <ReservaCheckoutForm
      items={items}
      onSuccess={onSuccess}
      onCancel={onCancel}
      idOrcamento={reserva?.id_orcamento}
      eventoInicio={reserva?.evento_inicio}
      eventoFim={reserva?.evento_fim}
      onSave={async ({ idOrcamento, data, items: itemsData }) => {
        // calcular valor_total a partir dos items
        const valor_total = (itemsData || []).reduce((sum: number, it: any) => sum + Number(it.valor_total || 0), 0);

        const payload: any = {
          ...data,
          valor_total,
          itens: itemsData
        };

        if (reserva) {
          // atualizar reserva existente
          return await ReservaService.atualizarReserva(reserva.id_reserva, payload as AtualizarReservaRequest);
        }

        // criar nova reserva
        return await ReservaService.criarReserva(payload as CriarReservaRequest);
      }}
      mode="edit"
    />
  );
};

export default ReservaForm;