import React, { useState } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import { useProdutos } from '../hooks/useProdutos';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';
import type { Reserva } from '../types/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  ShoppingBagIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import ReservaService from '../services/reservaService';

const OrcamentosPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');
  const [expandedOrcamentos, setExpandedOrcamentos] = useState<Set<number>>(new Set());
  const [itensOrcamentos, setItensOrcamentos] = useState<Map<number, any[]>>(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Reserva | null>(null);

  // Buscar dados
  const { data: orcamentosData, isLoading: isLoadingReservas, error, refetch } = useReservas({ search });
  const { data: clientesData } = useClientes();
  const { data: locaisData } = useLocais();
  const { data: produtosData } = useProdutos();

  const reservas = orcamentosData?.data || [];
  const clientes = clientesData?.data || [];
  const locais = locaisData?.data || [];
  const produtos = produtosData?.data || [];

  // Criar mapas para lookups
  const clientesMap = new Map(clientes.map(c => [c.id_cliente, c]));
  const locaisMap = new Map(locais.map(l => [l.id_local, l]));
  const produtosMap = new Map(produtos.map(p => [p.id_produto, p]));

  // Filtrar reservas
  const filteredReservas = reservas.filter(reserva => {
    // Filtro de status
    if (statusFilter !== 'todos' && reserva.status !== statusFilter) {
      return false;
    }

    // Filtro de data
    if (dateFilter !== 'todos') {
      const dataEvento = new Date(reserva.data_evento);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dateFilter === 'hoje') {
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        if (dataEvento < hoje || dataEvento >= amanha) return false;
      } else if (dateFilter === 'semana') {
        const proximaSemana = new Date(hoje);
        proximaSemana.setDate(proximaSemana.getDate() + 7);
        if (dataEvento < hoje || dataEvento >= proximaSemana) return false;
      } else if (dateFilter === 'mes') {
        const proximoMes = new Date(hoje);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        if (dataEvento < hoje || dataEvento >= proximoMes) return false;
      }
    }

    return true;
  });

  // Estatísticas
  const stats = {
    total: reservas.length,
    valorTotal: reservas.reduce((sum, r) => sum + Number(r.valor_total || 0), 0),
    pendentes: reservas.filter(r => r.status === 'pendente'),
    aprovadosArr: reservas.filter(r => r.status === 'aprovado'),
    canceladosArr: reservas.filter(r => r.status === 'cancelado'),
  };
  const statsDisplay = {
    total: stats.total,
    valorTotal: stats.valorTotal,
    pendentes: stats.pendentes.length,
    pendentesValor: stats.pendentes.reduce((sum, r) => sum + Number(r.valor_total || 0), 0),
    aprovados: stats.aprovadosArr.length,
    aprovadosValor: stats.aprovadosArr.reduce((sum, r) => sum + Number(r.valor_total || 0), 0),
    cancelados: stats.canceladosArr.length,
    canceladosValor: stats.canceladosArr.reduce((sum, r) => sum + Number(r.valor_total || 0), 0),
  };

  const toggleOrcamentoExpansion = async (idReserva: number) => {
    const newExpanded = new Set(expandedOrcamentos);

    if (expandedOrcamentos.has(idReserva)) {
      newExpanded.delete(idReserva);
    } else {
      newExpanded.add(idReserva);

      if (!itensOrcamentos.has(idReserva)) {
        try {
          const itens = await ReservaService.buscarItensReserva(idReserva);
          setItensOrcamentos(prev => new Map(prev).set(idReserva, itens));
        } catch (error) {
          console.error('Erro ao buscar itens da reserva:', error);
        }
      }
    }

    setExpandedOrcamentos(newExpanded);
  };

  const handleEditOrcamento = (reserva: Reserva) => {
    setSelectedOrcamento(reserva);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedOrcamento(null);
    refetch(); // Atualizar lista após edição
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return {
          label: 'Aprovado',
          icon: CheckCircleIcon,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'pendente':
        return {
          label: 'Pendente',
          icon: ClockIcon,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          icon: XCircleIcon,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      default:
        return {
          label: status || 'N/A',
          icon: DocumentTextIcon,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (isLoadingReservas) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Carregando orçamentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Erro ao carregar orçamentos</h3>
              <p className="text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
              Orçamentos
            </h1>
            <p className="text-gray-600 mt-1">Gerencie orçamentos e propostas comerciais</p>
          </div>
          <Button
            onClick={() => navigate('/orcamentos/marketplace')}
            className="flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{statsDisplay.total} = 
                R$ {statsDisplay.valorTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{statsDisplay.pendentes} = 
                R$ {statsDisplay.pendentesValor.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <ClockIcon className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">{statsDisplay.aprovados} = 
                R$ {statsDisplay.aprovadosValor.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-gray-900">{statsDisplay.cancelados} = 
                R$ {statsDisplay.canceladosValor.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <XCircleIcon className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>

      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente, ID do orçamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Botão de Filtros */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtros
            {showFilters ? <ChevronUpIcon className="w-4 h-4 ml-2" /> : <ChevronDownIcon className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Painel de Filtros Expansível */}
        {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <option value="todos">Todos os Status</option>
              <option value="aprovado">Aprovados</option>
              <option value="pendente">Pendentes</option>
              <option value="cancelado">Cancelados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Períodos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Próxima Semana</option>
                <option value="mes">Próximo Mês</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Orçamentos */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredReservas.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter !== 'todos' || dateFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando um novo orçamento'}
            </p>
            <Button onClick={() => navigate('/orcamentos/marketplace')}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Criar Primeiro Orçamento
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservas.map((reserva) => {
              const cliente = clientesMap.get(reserva.id_cliente || 0);
              const local = locaisMap.get(reserva.id_local || 0);
              const isExpanded = expandedOrcamentos.has(reserva.id_reserva);
              const itens = itensOrcamentos.get(reserva.id_reserva) || [];
              const statusConfig = getStatusConfig(reserva.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={reserva.id_reserva}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Card Principal */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Informações Principais */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cliente?.nome || 'Cliente não encontrado'}
                          </h3>
                          <span className="text-sm text-gray-500">
                            #{reserva.id_reserva}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusConfig.label}
                          </span>
                          {itens.length > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <ShoppingBagIcon className="w-4 h-4 mr-1" />
                              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">CPF/CNPJ:</span>
                            <span className="ml-1">{cliente?.cpf_cnpj || 'N/A'}</span>
                          </div>

                          {local && (
                            <div className="flex items-center text-gray-600">
                              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="font-medium">Local:</span>
                              <span className="ml-1">{local.nome}</span>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Evento:</span>
                            <span className="ml-1">
                              {reserva.data_evento
                                ? new Date(reserva.data_evento).toLocaleDateString('pt-BR')
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            R$ {Number(reserva.valor_total || 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleOrcamentoExpansion(reserva.id_reserva)}
                          className="flex items-center"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="w-4 h-4 mr-1" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Ver Detalhes
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrcamento(reserva)}
                          className="flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        {reserva.status === 'pendente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await ReservaService.aprovarOrcamento(reserva.id_reserva);
                                  refetch();
                                } catch (error) {
                                  alert('Erro ao aprovar orçamento.');
                                }
                              }}
                              className="flex items-center bg-green-600 hover:bg-green-700 mr-2"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!window.confirm('Tem certeza que deseja cancelar este orçamento?')) return;
                                try {
                                  await ReservaService.cancelarOrcamento(reserva.id_reserva);
                                  refetch();
                                } catch (error) {
                                  alert('Erro ao cancelar orçamento.');
                                }
                              }}
                              className="flex items-center bg-red-600 hover:bg-red-700"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-gray-50 border-t">
                      {/* Informações Adicionais */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Data de Retirada</p>
                          <p className="font-semibold">
                            {reserva.data_retirada
                              ? new Date(reserva.data_retirada).toLocaleDateString('pt-BR')
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Data de Devolução</p>
                          <p className="font-semibold">
                            {reserva.data_devolucao
                              ? new Date(reserva.data_devolucao).toLocaleDateString('pt-BR')
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Dias de Locação</p>
                          <p className="font-semibold">
                            {reserva.data_retirada && reserva.data_devolucao
                              ? Math.ceil(
                                  (new Date(reserva.data_devolucao).getTime() -
                                    new Date(reserva.data_retirada).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : 'N/A'}{' '}
                            dias
                          </p>
                        </div>
                      </div>

                      {/* Observações */}
                      {reserva.observacoes && (
                        <div className="bg-white p-4 rounded-lg border mb-6">
                          <p className="text-xs text-gray-500 mb-2">Observações</p>
                          <p className="text-sm text-gray-700">{reserva.observacoes}</p>
                        </div>
                      )}

                      {/* Lista de Itens */}
                      {itens.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <ShoppingBagIcon className="w-5 h-5 mr-2 text-gray-600" />
                            Produtos do Orçamento
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {itens.map((item: any) => {
                              const produto = produtosMap.get(item.id_produto);
                              return (
                                <div
                                  key={item.id_item_reserva || item.id_produto}
                                  className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900 text-sm">
                                        {produto?.nome || item.produto_nome || 'Produto'}
                                      </h5>
                                      {produto?.descricao && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                          {produto.descricao}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Quantidade:</span>
                                      <span className="font-medium">{item.quantidade}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Dias:</span>
                                      <span className="font-medium">{item.dias_locacao || 1}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Valor Unit.:</span>
                                      <span className="font-medium">
                                        R${' '}
                                        {Number(
                                          item.valor_unitario || produto?.valor_locacao || 0
                                        ).toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                      <span className="text-gray-700 font-medium">Subtotal:</span>
                                      <span className="font-bold text-green-600 text-base">
                                        R$ {Number(item.valor_total || 0).toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Nenhum item neste orçamento</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && selectedOrcamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-xl relative">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">
                Editar Orçamento - {clientesMap.get(selectedOrcamento.id_cliente)?.nome || `#${selectedOrcamento.id_reserva}`}
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Checkout-style editing */}
              <OrcamentoCheckoutForm
                items={(itensOrcamentos.get(selectedOrcamento.id_reserva) || []).map(item => ({
                  produto: produtos.find(p => p.id_produto === item.id_produto) || { id_produto: item.id_produto, nome: item.produto_nome || '', quantidade_total: 0, valor_locacao: item.valor_unitario || 0, valor_danificacao: 0, tempo_limpeza: 0 },
                  quantidade: item.quantidade,
                  dias: item.dias_locacao || 1,
                  data_inicio: selectedOrcamento.data_retirada,
                  data_fim: selectedOrcamento.data_devolucao
                }))}
                idOrcamento={selectedOrcamento.id_reserva}
                onSuccess={async (novoOrcamentoData) => {
                  try {
                    // Cria novo orçamento com os dados editados
                    const payload = {
                      ...novoOrcamentoData,
                      id_cliente: selectedOrcamento.id_cliente,
                      id_local: selectedOrcamento.id_local,
                      data_evento: selectedOrcamento.data_evento,
                      data_retirada: selectedOrcamento.data_retirada,
                      data_devolucao: selectedOrcamento.data_devolucao,
                      observacoes: selectedOrcamento.observacoes,
                    };
                    await ReservaService.criarOrcamentoComItens(payload);
                    // Cancela o orçamento antigo
                    await ReservaService.cancelarOrcamento(selectedOrcamento.id_reserva);
                    handleCloseEditModal();
                  } catch (error) {
                    alert('Erro ao salvar edição do orçamento.');
                  }
                }}
                onCancel={handleCloseEditModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrcamentosPageNew;
