
import React, { useState } from 'react';
import { useOrcamentos } from '../hooks/useOrcamentosReservas';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import { useProdutos } from '../hooks/useProdutos';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import ReservaService from '../services/reservaService';
import OrcamentoService from '../services/orcamentoService';

const OrcamentosListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Criado');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');
  const [expandedOrcamentos, setExpandedOrcamentos] = useState<Set<number>>(new Set());
  const [itensOrcamentos, setItensOrcamentos] = useState<Map<number, any[]>>(new Map());
  const [showFilters, setShowFilters] = useState(false);

  // Função helper para resolver o ID correto do orçamento
  const getOrcamentoId = (reserva: any) => {
    return (reserva as any).id_orcamento || reserva.id_reserva;
  };

  // Buscar dados
  const { data: orcamentosData, isLoading: isLoadingReservas, error, refetch } = useOrcamentos({ search });
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
      const dataEvento = new Date(reserva.evento_inicio);
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
    pendentes: reservas.filter((r: any) => r.status === 'Criado'),
    aprovadosArr: reservas.filter((r: any) => r.status === 'Aprovado'),
    canceladosArr: reservas.filter((r: any) => r.status === 'Cancelado'),
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

  const toggleOrcamentoExpansion = async (orcamentoId: number) => {
    const newExpanded = new Set(expandedOrcamentos);

    if (expandedOrcamentos.has(orcamentoId)) {
      newExpanded.delete(orcamentoId);
    } else {
      newExpanded.add(orcamentoId);

      if (!itensOrcamentos.has(orcamentoId)) {
        try {
          const itens = await OrcamentoService.listarItensOrcamento(orcamentoId);
          setItensOrcamentos(prev => new Map(prev).set(orcamentoId, itens));
        } catch (error) {
          console.error('Erro ao buscar itens do orçamento:', error);
        }
      }
    }

    setExpandedOrcamentos(newExpanded);
  };

  // Função para calcular dias desde criação e determinar cor
  const getDiasDesdeCriacao = (dataCriacao: string | Date) => {
    if (!dataCriacao) return { dias: 0, corFundo: 'bg-gray-100', corTexto: 'text-gray-600' };
    
    const hoje = new Date();
    const data = new Date(dataCriacao);
    const diffTime = Math.abs(hoje.getTime() - data.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let corFundo = 'bg-gray-100';
    let corTexto = 'text-gray-600';
    if (diffDays <= 1) {
      corFundo = 'bg-green-100';
      corTexto = 'text-green-800';
    } else if (diffDays <= 3) {
      corFundo = 'bg-yellow-100';
      corTexto = 'text-yellow-800';
    } else {
      corFundo = 'bg-red-100';
      corTexto = 'text-red-800';
    }
    
    return { dias: diffDays, corFundo, corTexto };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return {
          label: 'Aprovado',
          icon: CheckCircleIcon,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'Criado':
        return {
          label: 'Criado',
          icon: ClockIcon,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'Cancelado':
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
              <p className="text-sm text-gray-600">Criados</p>
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
              <option value="Aprovado">Aprovados</option>
              <option value="Criado">Criados</option>
              <option value="Cancelado">Cancelados</option>
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
              // const isExpanded = expandedOrcamentos.has(reserva.id_reserva);
              const itens = itensOrcamentos.get(getOrcamentoId(reserva)) || [];
              const statusConfig = getStatusConfig(reserva.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={getOrcamentoId(reserva)}
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
                          {(() => {
                            const { dias, corFundo, corTexto } = getDiasDesdeCriacao(reserva.evento_inicio);
                            return (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${corFundo} ${corTexto} border border-gray-200`}>
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {dias} {dias === 1 ? 'dia' : 'dias'}
                              </span>
                            );
                          })()}
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
                              {reserva.evento_inicio
                                ? new Date(reserva.evento_inicio).toLocaleDateString('pt-BR')
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
                          onClick={() => toggleOrcamentoExpansion(getOrcamentoId(reserva))}
                          className="flex items-center"
                        >
                          {expandedOrcamentos.has(getOrcamentoId(reserva)) ? (
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
                        {/* Botões por status */}
                        {(reserva as any).status === 'Criado' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/orcamentos/${(reserva as any).id_orcamento}/edit`)}
                              className="flex items-center"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await OrcamentoService.aprovarOrcamento(getOrcamentoId(reserva));
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
                                  await ReservaService.cancelarOrcamento((reserva as any).id_orcamento || reserva.id_reserva);
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
                        {(reserva as any).status === 'aprovado' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleOrcamentoExpansion(getOrcamentoId(reserva))}
                              className="flex items-center"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/orcamentos/${(reserva as any).id_orcamento}/edit`)}
                              className="flex items-center"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            {reserva.pdf_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(reserva.pdf_url, '_blank')}
                                className="flex items-center"
                              >
                                <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!window.confirm('Tem certeza que deseja cancelar este orçamento?')) return;
                                try {
                                  await ReservaService.cancelarOrcamento((reserva as any).id_orcamento || reserva.id_reserva);
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
                        {(reserva as any).status === 'cancelada' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrcamentoExpansion(getOrcamentoId(reserva))}
                            className="flex items-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {expandedOrcamentos.has(getOrcamentoId(reserva)) && (
                    <div className="px-6 pb-6 bg-gray-50 border-t">
                      {/* Informações Adicionais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Evento Início</p>
                          <p className="font-semibold">
                            {reserva.evento_inicio
                              ? new Date(reserva.evento_inicio).toLocaleString('pt-BR', {
                                  timeZone: 'America/Sao_Paulo',
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Horário de Brasília</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Evento Fim</p>
                          <p className="font-semibold">
                            {reserva.evento_fim
                              ? new Date(reserva.evento_fim).toLocaleString('pt-BR', {
                                  timeZone: 'America/Sao_Paulo',
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Horário de Brasília</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Data de Entrega</p>
                          <p className="font-semibold">
                            {reserva.evento_entrega
                              ? new Date(reserva.evento_entrega).toLocaleString('pt-BR', {
                                  timeZone: 'America/Sao_Paulo',
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Horário de Brasília</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Data de Recolha</p>
                          <p className="font-semibold">
                            {reserva.evento_recolha
                              ? new Date(reserva.evento_recolha).toLocaleString('pt-BR', {
                                  timeZone: 'America/Sao_Paulo',
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">Horário de Brasília</p>
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
                      {itensOrcamentos.get(getOrcamentoId(reserva))?.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <ShoppingBagIcon className="w-5 h-5 mr-2 text-gray-600" />
                            Produtos do Orçamento
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {itensOrcamentos.get(getOrcamentoId(reserva))?.map((item: any) => {
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
    </div>
    </div>
  );
};

export default OrcamentosListPage;
