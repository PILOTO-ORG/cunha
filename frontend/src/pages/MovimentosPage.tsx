
import React, { useEffect, useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useMovimentos, useCriarMovimento, useAtualizarMovimento, MOVIMENTO_QUERY_KEYS } from '../hooks/useMovimentos';
import { useProdutos } from '../hooks/useProdutos';
import { Movimento, Produto, CriarMovimentoRequest } from '../types/api';
import { formatDateTime } from '../utils/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import MovimentoService from '../services/movimentoService';
import { toast } from 'react-hot-toast';
import MovimentoForm from '../components/MovimentoForm';
import MovimentoDetailDrawer from '../components/MovimentoDetailDrawer';

const MovimentosPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [tipoEvento, setTipoEvento] = useState<string>('');
  const [idProduto, setIdProduto] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Edit modal state
  const [editingMovimento, setEditingMovimento] = useState<Movimento | null>(null);

  // Detail drawer state
  const [selectedMovimento, setSelectedMovimento] = useState<Movimento | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtros: any = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(tipoEvento ? { tipo_evento: tipoEvento } : {}),
    ...(idProduto ? { id_produto: idProduto } : {}),
    ...(dataInicio ? { data_inicio: dataInicio } : {}),
    ...(dataFim ? { data_fim: dataFim } : {}),
  };

  const { data: movimentosResp, isLoading: loadingMovimentos } = useMovimentos(filtros);
  const movimentos = movimentosResp?.data || [];

  // Products for filter and create form
  const { data: produtosResp } = useProdutos({ limit: 1000, page: 1 });
  const produtos: Produto[] = (produtosResp?.data || []) as Produto[];

  // Create mutation
  const criarMovimento = useCriarMovimento();

  // Update mutation
  const atualizarMovimento = useAtualizarMovimento();

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => MovimentoService.removerMovimento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVIMENTO_QUERY_KEYS.lists() });
      toast.success('Movimento removido');
    },
    onError: () => {
      toast.error('Erro ao remover movimento');
    }
  });

  useEffect(() => {
    // reset to page 1 when filters change
    setPage(1);
  }, [search, tipoEvento, idProduto, dataInicio, dataFim]);

  const handleOpenCreate = () => setIsCreateOpen(true);
  const handleCloseCreate = () => setIsCreateOpen(false);

  const handleOpenEdit = (movimento: Movimento) => {
    setEditingMovimento(movimento);
  };

  const handleCloseEdit = () => {
    setEditingMovimento(null);
  };

  const handleOpenDetail = (movimento: Movimento) => {
    setSelectedMovimento(movimento);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedMovimento(null);
  };

  const handleUpdate = async (data: CriarMovimentoRequest) => {
    if (!editingMovimento) return;
    try {
      await atualizarMovimento.mutateAsync({
        id: editingMovimento.id_evento,
        dados: data
      });
      toast.success('Movimento atualizado com sucesso');
      handleCloseEdit();
    } catch (err) {
      console.error('Erro ao atualizar movimento', err);
      toast.error('Erro ao atualizar movimento');
    }
  };

  const handleCreate = async (data: CriarMovimentoRequest) => {
    try {
      await criarMovimento.mutateAsync(data);
      toast.success('Movimento criado com sucesso');
      handleCloseCreate();
    } catch (err) {
      console.error('Erro ao criar movimento', err);
      toast.error('Erro ao criar movimento');
    }
  };

  const handleDelete = async (mov: Movimento) => {
    if (!window.confirm('Confirmar remoção do movimento?')) return;
    deleteMutation.mutate(mov.id_evento);
  };

  const columns = [
    {
      header: 'Data',
      accessor: (m: Movimento) => m.data_evento,
      cell: (m: Movimento) => <div>{formatDateTime(m.data_evento)}</div>
    },
    {
      header: 'Produto',
      accessor: (m: Movimento) => m.produto_nome || `#${m.id_produto}`,
    },
    {
      header: 'Tipo',
      accessor: (m: Movimento) => m.tipo_evento,
    },
    {
      header: 'Quantidade',
      accessor: (m: Movimento) => m.quantidade?.toString() || '0',
    },
    {
      header: 'Reserva',
      accessor: (m: Movimento) => m.reserva_id ? m.reserva_id.toString() : '-',
      className: 'hidden sm:table-cell'
    },
    {
      header: 'Responsável',
      accessor: (m: Movimento) => m.responsavel || '-',
      className: 'hidden md:table-cell'
    },
    {
      header: 'Observação',
      accessor: (m: Movimento) => m.observacao || '-',
      cell: (m: Movimento) => (
        <div className="max-w-xs truncate" title={m.observacao || '-'}>
          {m.observacao || '-'}
        </div>
      ),
      className: 'hidden lg:table-cell'
    },
    {
      header: 'Ações',
      accessor: () => '',
      cell: (m: Movimento) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(m); }}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(m); }}
            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
            title="Remover"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Movimentos</h1>
            <p className="mt-1 text-sm text-gray-500">Registro de entradas/saídas e ajustes de estoque</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 [&>button:first-child]:hidden sm:[&>button:first-child]:inline-flex">
            <Button onClick={handleOpenCreate} variant="primary" className="w-full sm:w-auto justify-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Movimento
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar movimentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              aria-label="Buscar movimentos"
            />
          </div>

          <div>
            <select
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os tipos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="reserva">Reserva</option>
              <option value="devolucao">Devolução</option>
              <option value="perda">Perda</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <div>
            <select
              value={idProduto ?? ''}
              onChange={(e) => setIdProduto(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos os produtos</option>
              {produtos.map((p) => (
                <option key={p.id_produto} value={p.id_produto}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Listing */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loadingMovimentos ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Carregando movimentos...</span>
            </div>
          ) : movimentos.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum movimento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Ajuste os filtros para localizar movimentos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                data={movimentos}
                columns={columns}
                emptyMessage="Nenhum movimento encontrado"
                rowClassName="hover:bg-gray-50 cursor-pointer transition-colors"
                onRowClick={handleOpenDetail}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {movimentosResp && movimentosResp.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: movimentosResp.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pageNum === page
                    ? 'text-white bg-blue-600 border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(movimentosResp.totalPages, page + 1))}
              disabled={page === movimentosResp.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={handleCloseCreate} title="Novo Movimento" size="md">
        <MovimentoForm
          onSubmit={handleCreate}
          onCancel={handleCloseCreate}
          isSubmitting={criarMovimento.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingMovimento} onClose={handleCloseEdit} title="Editar Movimento" size="md">
        <MovimentoForm
          movimento={editingMovimento || undefined}
          onSubmit={handleUpdate}
          onCancel={handleCloseEdit}
          isSubmitting={atualizarMovimento.isPending}
        />
      </Modal>

      {/* Detail Drawer */}
      <MovimentoDetailDrawer
        movimento={selectedMovimento}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default MovimentosPage;
