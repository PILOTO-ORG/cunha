

import React, { useState, useMemo } from 'react';
import Table from '../components/ui/Table.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import Input from '../components/ui/Input.tsx';
import { useReservas, useRemoverReserva } from '../hooks/useReservas.ts';
import { useClientes } from '../hooks/useClientes.ts';
import { useProdutos } from '../hooks/useProdutos.ts';
import ReservaForm from '../components/ReservaForm.tsx';
import type { Reserva, Cliente, Produto } from '../types/api';
import { formatDateTime, formatCurrency } from '../utils/formatters.ts';

interface ReservaAgrupada {
  id_reserva: number;
  id_cliente: number;
  cliente_nome: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  itens: {
    id_item_reserva: number;
    id_produto: number;
    produto_nome: string;
    quantidade: number;
    valor_unitario?: number;
  }[];
  valor_total: number;
  observacoes?: string;
}

const ReservasPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativa' | 'concluída' | 'cancelada' | 'iniciada' | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  const { data: reservasData, isLoading: isLoadingReservas, error, refetch } = useReservas({
    search,
    status: statusFilter || undefined
  });
  const { data: clientesData, isLoading: isLoadingClientes } = useClientes();
  const { data: produtosData, isLoading: isLoadingProdutos } = useProdutos();
  const excluirReservaMutation = useRemoverReserva();

  const reservas = reservasData?.data || [];
  const clientes = clientesData?.data || [];
  const produtos = produtosData?.data || [];
  const isLoading = isLoadingReservas || isLoadingClientes || isLoadingProdutos;

  const clientesMap = useMemo(() => {
    const map = new Map<number, Cliente>();
    clientes.forEach(cliente => {
      map.set(cliente.id_cliente, cliente);
    });
    return map;
  }, [clientes]);

  const produtosMap = useMemo(() => {
    const map = new Map<number, Produto>();
    produtos.forEach(produto => {
      map.set(produto.id_produto, produto);
    });
    return map;
  }, [produtos]);

  const calcularValorItem = (produto: Produto | undefined, quantidade: number, dataInicio: string, dataFim: string): number => {
    if (!produto || !produto.valor_locacao) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferenca = fim.getTime() - inicio.getTime();
    const dias = Math.max(1, Math.ceil(diferenca / (1000 * 60 * 60 * 24)) + 1);
    return produto.valor_locacao * quantidade * dias;
  };

  const reservasAgrupadas = useMemo(() => {
    const grupos = new Map<number, ReservaAgrupada>();
    reservas.forEach(reserva => {
      const cliente = clientesMap.get(reserva.id_cliente || 0);
      const produto = produtosMap.get(reserva.id_produto);
      if (!grupos.has(reserva.id_reserva)) {
        grupos.set(reserva.id_reserva, {
          id_reserva: reserva.id_reserva,
          id_cliente: reserva.id_cliente || 0,
          cliente_nome: cliente?.nome || 'Cliente não encontrado',
          data_inicio: reserva.data_inicio,
          data_fim: reserva.data_fim,
          status: reserva.status,
          itens: [],
          valor_total: 0,
          observacoes: reserva.observacoes
        });
      }
      const grupo = grupos.get(reserva.id_reserva)!;
      const valorItem = calcularValorItem(produto, reserva.quantidade, reserva.data_inicio, reserva.data_fim);
      grupo.itens.push({
        id_item_reserva: reserva.id_item_reserva,
        id_produto: reserva.id_produto,
        produto_nome: produto?.nome || 'Produto não encontrado',
        quantidade: reserva.quantidade,
        valor_unitario: produto?.valor_locacao || 0
      });
      grupo.valor_total += valorItem;
    });
    return Array.from(grupos.values());
  }, [reservas, clientesMap, produtosMap]);

  const handleCreateReserva = () => {
    setSelectedReserva(null);
    setShowModal(true);
  };

  const handleEditReserva = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  const handleDeleteReserva = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        await excluirReservaMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Erro ao excluir reserva:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedReserva(null);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedReserva(null);
    refetch();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      iniciada: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Orçamento' },
      ativa: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativa' },
      concluída: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluída' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativa;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao Carregar Reservas</h2>
          <p className="text-red-600 mb-4">
            Ocorreu um erro ao carregar as reservas. Tente novamente.
          </p>
          <Button variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const columns = [
    {
      header: 'ID Reserva',
      accessor: 'id_reserva' as keyof ReservaAgrupada,
      className: 'w-20'
    },
    {
      header: 'Cliente',
      accessor: (reserva: ReservaAgrupada) => reserva.cliente_nome,
      className: 'min-w-[200px]'
    },
    {
      header: 'Itens',
      accessor: (reserva: ReservaAgrupada) => (
        <div className="space-y-2">
          {reserva.itens.map((item) => (
            <div key={item.id_item_reserva} className="text-sm border-l-2 border-blue-200 pl-2">
              <div className="font-medium text-gray-900">{item.produto_nome}</div>
              <div className="text-gray-500 flex justify-between">
                <span>Qtd: {item.quantidade}</span>
                <span>{formatCurrency(item.valor_unitario || 0)}/dia</span>
              </div>
            </div>
          ))}
          {reserva.itens.length > 1 && (
            <div className="text-xs text-gray-400 pt-1 border-t">
              Total de {reserva.itens.length} itens
            </div>
          )}
        </div>
      ),
      className: 'min-w-[280px]'
    },
    {
      header: 'Data Início',
      accessor: (reserva: ReservaAgrupada) => formatDateTime(reserva.data_inicio),
      className: 'min-w-[140px]'
    },
    {
      header: 'Data Fim',
      accessor: (reserva: ReservaAgrupada) => formatDateTime(reserva.data_fim),
      className: 'min-w-[140px]'
    },
    {
      header: 'Valor Total',
      accessor: (reserva: ReservaAgrupada) => (
        <span className="font-medium text-green-600">
          {formatCurrency(reserva.valor_total)}
        </span>
      ),
      className: 'min-w-[120px] text-right'
    },
    {
      header: 'Status',
      accessor: (reserva: ReservaAgrupada) => getStatusBadge(reserva.status),
      className: 'w-24'
    },
    {
      header: 'Ações',
      accessor: (reserva: ReservaAgrupada) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const primeiraReserva = reservas.find(r => r.id_reserva === reserva.id_reserva);
              if (primeiraReserva) {
                handleEditReserva(primeiraReserva);
              }
            }}
            className="p-1.5"
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteReserva(reserva.id_reserva)}
            className="p-1.5 text-red-600 hover:text-red-700"
          >
            🗑️
          </Button>
        </div>
      ),
      className: 'w-32'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          {!isLoading && (
            <p className="text-sm text-gray-600 mt-1">
              {reservasAgrupadas.length} reserva(s) encontrada(s) •
              {reservas.length} item(s) total •
              Valor total: {formatCurrency(reservasAgrupadas.reduce((sum, r) => sum + r.valor_total, 0))}
            </p>
          )}
        </div>
        <Button onClick={handleCreateReserva} className="flex items-center space-x-2">
          ➕
          <span>Nova Reserva</span>
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar reservas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ativa' | 'concluída' | 'cancelada' | 'iniciada' | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Status</option>
            <option value="iniciada">Orçamentos</option>
            <option value="ativa">Ativas</option>
            <option value="concluída">Concluídas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Table
            data={reservasAgrupadas}
            columns={columns}
            emptyMessage="Nenhuma reserva encontrada. Crie sua primeira reserva clicando no botão 'Nova Reserva'."
          />
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleModalClose} size="xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedReserva ? 'Editar Reserva' : 'Nova Reserva'}
            </h2>
            <ReservaForm
              reserva={selectedReserva ?? undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleModalClose}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReservasPage;
