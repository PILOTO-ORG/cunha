import React, { useState } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import { useReservas } from '../hooks/useReservas';
import { Produto, CriarMovimentoRequest, Movimento, Reserva } from '../types/api';
import Button from './ui/Button';
import Input from './ui/Input';
import SelectWithSearch from './ui/SelectWithSearch';
import LoadingSpinner from './ui/LoadingSpinner';

interface MovimentoFormProps {
  movimento?: Movimento; // Para edição
  onSubmit: (data: CriarMovimentoRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MovimentoForm: React.FC<MovimentoFormProps> = ({
  movimento,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const isEditing = !!movimento;

  // Form state
  const [idProduto, setIdProduto] = useState<number | null>(movimento?.id_produto || null);
  const [tipoEvento, setTipoEvento] = useState<string>(movimento?.tipo_evento || 'entrada');
  const [quantidade, setQuantidade] = useState<number>(movimento?.quantidade || 1);
  const [observacao, setObservacao] = useState<string>(movimento?.observacao || '');
  const [responsavel, setResponsavel] = useState<string>(movimento?.responsavel || '');
  const [idReserva, setIdReserva] = useState<number | null>(movimento?.reserva_id || null);

  // Load products
  const { data: produtosResp, isLoading: loadingProdutos } = useProdutos({ limit: 1000, page: 1 });
  const produtos: Produto[] = (produtosResp?.data || []) as Produto[];

  // Load reservations for search
  const { data: reservasResp, isLoading: loadingReservas } = useReservas({ limit: 1000, page: 1 });
  const reservas: Reserva[] = (reservasResp?.data || []) as Reserva[];

  // Create options for selects
  const produtoOptions = produtos.map(p => ({
    value: p.id_produto,
    label: `${p.nome}${p.descricao ? ` (${p.descricao})` : ''}`,
    searchText: `${p.nome} ${p.descricao || ''}`
  }));

  const reservaOptions = reservas.map(r => ({
    value: r.id_reserva,
    label: `#${r.id_reserva} - ${r.cliente_nome || 'Cliente'} - ${new Date(r.data_evento).toLocaleDateString('pt-BR')}${r.local_nome ? ` - ${r.local_nome}` : ''}`,
    searchText: `${r.id_reserva} ${r.cliente_nome || ''} ${r.local_nome || ''}`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idProduto) {
      alert('Selecione um produto');
      return;
    }

    if (!quantidade || quantidade <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    const data: CriarMovimentoRequest = {
      id_produto: idProduto,
      tipo_evento: tipoEvento as any,
      quantidade,
      observacao: observacao || undefined,
      responsavel: responsavel || undefined,
      reserva_id: idReserva || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Produto */}
        <div className="md:col-span-2">
          <SelectWithSearch
            label="Produto"
            placeholder="Selecione um produto"
            options={produtoOptions}
            value={idProduto}
            onChange={(value) => setIdProduto(value as number | null)}
            loading={loadingProdutos}
            required
          />
        </div>

        {/* Tipo de Evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Movimento <span className="text-red-500">*</span>
          </label>
          <select
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="reserva">Reserva</option>
            <option value="devolucao">Devolução</option>
            <option value="perda">Perda</option>
            <option value="ajuste">Ajuste</option>
          </select>
        </div>

        {/* Quantidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="w-full"
            required
          />
        </div>

        {/* Reserva */}
        <div className="md:col-span-2">
          <SelectWithSearch
            label="Reserva"
            placeholder="Selecione uma reserva"
            options={reservaOptions}
            value={idReserva}
            onChange={(value) => setIdReserva(value as number | null)}
            loading={loadingReservas}
          />
        </div>

        {/* Responsável */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsável
          </label>
          <Input
            type="text"
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="w-full"
            placeholder="Nome do responsável"
          />
        </div>

        {/* Observação */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observação
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            rows={3}
            placeholder="Detalhes adicionais sobre o movimento"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isEditing ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            isEditing ? 'Atualizar Movimento' : 'Criar Movimento'
          )}
        </Button>
      </div>
    </form>
  );
};

export default MovimentoForm;