import React, { useState } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import { useProdutos } from '../hooks/useProdutos';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ReservaService from '../services/reservaService';
import type { ReservaStatus } from '../types/api';
import FinalizarReservaModal from '../components/FinalizarReservaModal';

import {
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
  TruckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ReservasPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos'); // Começa mostrando todas as reservas
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');
  const [expandedReservas, setExpandedReservas] = useState<Set<number>>(new Set());
  const [itensReservas, setItensReservas] = useState<Map<number, any[]>>(new Map());
  const [showFilters, setShowFilters] = useState(false);
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [reservaParaFinalizar, setReservaParaFinalizar] = useState<any>(null);
  const [finalizandoReserva, setFinalizandoReserva] = useState(false);
  const [showMudarStatusModal, setShowMudarStatusModal] = useState(false);
  const [reservaParaMudarStatus, setReservaParaMudarStatus] = useState<any>(null);
  const [mudandoStatus, setMudandoStatus] = useState(false);

  // Buscar dados - todas as reservas
  const { data: reservasData, isLoading: isLoadingReservas, error, refetch } = useReservas({
    search
  });
  const { data: clientesData } = useClientes();
  const { data: locaisData } = useLocais();
  const { data: produtosData } = useProdutos();

  const reservas = reservasData?.data || [];
  const clientes = clientesData?.data || [];
  const locais = locaisData?.data || [];
  const produtos = produtosData?.data || [];

  // Criar mapas para lookups
  const clientesMap = new Map(clientes.map(c => [c.id_cliente, c]));
  const locaisMap = new Map(locais.map(l => [l.id_local, l]));
  const produtosMap = new Map(produtos.map(p => [p.id_produto, p]));

  // Filtrar reservas
  const filteredReservas = reservas.filter(reserva => {
    // Status que não devem ser mostrados por padrão
    const statusExcluidos = ['Cancelado', 'Encerrado'];
    
    // Filtro de status
    if (statusFilter === 'todos') {
      // Por padrão, excluir status Cancelado e Encerrado
      if (statusExcluidos.includes(reserva.status)) {
        return false;
      }
    } else if (statusFilter === 'todos_com_ocultos') {
      // Mostrar todos os status
    } else if (statusFilter !== 'todos' && reserva.status !== statusFilter) {
      return false;
    }

    // Filtro de data baseado em evento_entrega
    if (dateFilter !== 'todos') {
      const dataEntrega = new Date(reserva.evento_entrega);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dateFilter === 'hoje') {
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        if (dataEntrega < hoje || dataEntrega >= amanha) return false;
      } else if (dateFilter === 'semana') {
        const proximaSemana = new Date(hoje);
        proximaSemana.setDate(proximaSemana.getDate() + 7);
        if (dataEntrega < hoje || dataEntrega >= proximaSemana) return false;
      } else if (dateFilter === 'mes') {
        const proximoMes = new Date(hoje);
        proximoMes.setMonth(proximoMes.getMonth() + 1);
        if (dataEntrega < hoje || dataEntrega >= proximoMes) return false;
      }
    }

    return true;
  });

  // Estatísticas
  const stats = {
    total: reservas.length,
    valorTotal: reservas.reduce((sum, r) => sum + Number(r.valor_total || 0), 0),
    confirmados: reservas.filter((r: any) => r.status === 'Confirmado').length,
    preparados: reservas.filter((r: any) => r.status === 'Preparado').length,
    enviados: reservas.filter((r: any) => r.status === 'Enviado').length,
    locados: reservas.filter((r: any) => r.status === 'Locado').length,
    devolvidos: reservas.filter((r: any) => r.status === 'Devolvido').length,
    faturados: reservas.filter((r: any) => r.status === 'Faturado').length,
    encerrados: reservas.filter((r: any) => r.status === 'Encerrado').length,
    cancelados: reservas.filter((r: any) => r.status === 'Cancelado').length,
  };

  const toggleReservaExpansion = async (idReserva: number) => {
    const newExpanded = new Set(expandedReservas);

    if (expandedReservas.has(idReserva)) {
      newExpanded.delete(idReserva);
    } else {
      newExpanded.add(idReserva);

      if (!itensReservas.has(idReserva)) {
        try {
          const itens = await ReservaService.buscarItensReserva(idReserva);
          setItensReservas(prev => new Map(prev).set(idReserva, itens));
        } catch (error) {
          console.error('Erro ao buscar itens da reserva:', error);
        }
      }
    }

    setExpandedReservas(newExpanded);
  };

  const abrirModalFinalizar = (reserva: any) => {
    setReservaParaFinalizar(reserva);
    setShowFinalizarModal(true);
  };

  const fecharModalFinalizar = () => {
    setShowFinalizarModal(false);
    setReservaParaFinalizar(null);
  };

  const processarFinalizacao = async (dadosFinalizacao: {
    itens: any[];
    valor_multa_total: number;
    observacoes: string;
  }) => {
    if (!reservaParaFinalizar) return;

    setFinalizandoReserva(true);
    try {
      // Determinar o status final baseado nas multas
      const statusFinal = dadosFinalizacao.valor_multa_total > 0 ? 'Faturado' : 'Devolvido';

      // Aqui você pode implementar a lógica para salvar as informações de finalização
      // Por enquanto, apenas atualiza o status
      await ReservaService.atualizarStatus(reservaParaFinalizar.id_reserva, statusFinal as ReservaStatus);

      // TODO: Implementar salvamento dos dados de finalização (multas, itens devolvidos, etc.)

      fecharModalFinalizar();
      refetch();
      alert(`Reserva finalizada com sucesso! Status: ${statusFinal === 'Faturado' ? 'Aguardando Quitar' : 'Concluída'}`);
    } catch (error) {
      console.error('Erro ao finalizar reserva:', error);
      alert('Erro ao finalizar reserva. Tente novamente.');
    } finally {
      setFinalizandoReserva(false);
    }
  };

  // Função para mudar status da reserva
  const handleMudarStatus = (reserva: any) => {
    setReservaParaMudarStatus(reserva);
    setShowMudarStatusModal(true);
  };

  // Função para processar mudança de status
  const processarMudancaStatus = async (novoStatus: string) => {
    if (!reservaParaMudarStatus) return;

    setMudandoStatus(true);
    try {
      await ReservaService.atualizarStatus(reservaParaMudarStatus.id_reserva, novoStatus as ReservaStatus);
      fecharModalMudarStatus();
      refetch();
      alert(`Status da reserva atualizado para: ${novoStatus}`);
    } catch (error) {
      console.error('Erro ao mudar status:', error);
      alert('Erro ao mudar status da reserva. Tente novamente.');
    } finally {
      setMudandoStatus(false);
    }
  };

  // Função para fechar modal de mudança de status
  const fecharModalMudarStatus = () => {
    setShowMudarStatusModal(false);
    setReservaParaMudarStatus(null);
  };

  // Função para calcular dias até entrega e determinar cor
  const getDiasAteEntrega = (dataEntrega: string | Date) => {
    if (!dataEntrega) return { dias: 0, corFundo: 'bg-gray-100', corTexto: 'text-gray-600' };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dataEntrega);
    data.setHours(0, 0, 0, 0);

    const diffTime = data.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let corFundo = 'bg-gray-100';
    let corTexto = 'text-gray-600';

    if (diffDays <= 1) {
      corFundo = 'bg-red-100';
      corTexto = 'text-red-800';
    } else if (diffDays <= 7) {
      corFundo = 'bg-yellow-100';
      corTexto = 'text-yellow-800';
    } else {
      corFundo = 'bg-green-100';
      corTexto = 'text-green-800';
    }

    return { dias: diffDays, corFundo, corTexto };
  };

  const getStatusConfig = (status: ReservaStatus | string) => {
    switch (status) {
      case 'Confirmado':
        return {
          label: 'Confirmado',
          icon: CheckCircleIcon,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'Preparado':
        return {
          label: 'Preparado',
          icon: ClockIcon,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'Enviado':
        return {
          label: 'Enviado',
          icon: TruckIcon,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'Locado':
        return {
          label: 'Locado',
          icon: ShoppingBagIcon,
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-800',
          borderColor: 'border-indigo-200'
        };
      case 'Devolvido':
        return {
          label: 'Devolvido',
          icon: ArrowPathIcon,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200'
        };
      case 'Faturado':
        return {
          label: 'Faturado',
          icon: CurrencyDollarIcon,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200'
        };
      case 'Encerrado':
        return {
          label: 'Encerrado',
          icon: XCircleIcon,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
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
        <p className="mt-4 text-gray-600">Carregando reservas...</p>
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
              <h3 className="text-lg font-medium text-red-800">Erro ao carregar reservas</h3>
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
                <TruckIcon className="w-8 h-8 mr-3 text-blue-600" />
                Reservas
              </h1>
              <p className="text-gray-600 mt-1">Gerencie reservas e entregas de equipamentos</p>
            </div>
            {/* <Button
              onClick={() => navigate('/orcamentos/marketplace')}
              className="flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nova Reserva
            </Button> */}
          </div>
        </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total} =
                R$ {stats.valorTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmados}</p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.locados}</p>
            </div>
            <TruckIcon className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Devolvidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.devolvidos}</p>
            </div>
            <ArrowPathIcon className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faturados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.faturados}</p>
            </div>
            <CurrencyDollarIcon className="w-10 h-10 text-orange-500 opacity-20" />
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
                placeholder="Buscar por cliente, ID da reserva..."
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
                <option value="todos">Ativos (padrão)</option>
                <option value="todos_com_ocultos">Todos os Status</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Preparado">Preparado</option>
                <option value="Enviado">Enviado</option>
                <option value="Locado">Locado</option>
                <option value="Devolvido">Devolvido</option>
                <option value="Faturado">Faturado</option>
                <option value="Encerrado">Encerrado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Entrega</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos os Períodos</option>
                <option value="hoje">Entregas Hoje</option>
                <option value="semana">Próxima Semana</option>
                <option value="mes">Próximo Mês</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredReservas.length === 0 ? (
          <div className="p-12 text-center">
            <TruckIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter !== 'todos' || dateFilter !== 'todos'
                ? 'Tente ajustar os filtros de busca'
                : 'Não há reservas no momento'}
            </p>
            {/* <Button onClick={() => navigate('/orcamentos/marketplace')}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Criar Nova Reserva
            </Button> */}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservas.map((reserva) => {
              const cliente = clientesMap.get(reserva.id_cliente || 0);
              const local = locaisMap.get(reserva.id_local || 0);
              const itens = itensReservas.get(reserva.id_reserva) || [];
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
                          {(() => {
                            const { dias, corFundo, corTexto } = getDiasAteEntrega(reserva.evento_entrega);
                            return (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${corFundo} ${corTexto} border border-gray-200`}>
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {dias < 0 ? `${Math.abs(dias)} dias atraso` : dias === 0 ? 'Entrega hoje' : `${dias} dias`}
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
                            <span className="font-medium">Entrega:</span>
                            <span className="ml-1">
                              {reserva.evento_entrega
                                ? new Date(reserva.evento_entrega).toLocaleDateString('pt-BR')
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
                          onClick={() => toggleReservaExpansion(reserva.id_reserva)}
                          className="flex items-center"
                        >
                          {expandedReservas.has(reserva.id_reserva) ? (
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
                          onClick={() => navigate(`/reservas/${reserva.id_reserva}/edit`)}
                          className="flex items-center"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMudarStatus(reserva)}
                          className="flex items-center"
                        >
                          <ArrowPathIcon className="w-4 h-4 mr-1" />
                          Mudar Status
                        </Button>

                        {/* Botões por status */}
                        {(reserva.status as any) === 'Preparado' || (reserva.status as any) === 'Enviado' ? (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await ReservaService.atualizarStatus(reserva.id_reserva, 'Locado');
                                refetch();
                              } catch (error) {
                                alert('Erro ao iniciar uso da reserva.');
                              }
                            }}
                            className="flex items-center bg-blue-600 hover:bg-blue-700"
                          >
                            <TruckIcon className="w-4 h-4 mr-1" />
                            Iniciar Uso
                          </Button>
                        ) : (reserva.status as any) === 'Locado' ? (
                          <Button
                            size="sm"
                            onClick={() => abrirModalFinalizar(reserva)}
                            className="flex items-center bg-purple-600 hover:bg-purple-700"
                          >
                            <ArrowPathIcon className="w-4 h-4 mr-1" />
                            Finalizar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {expandedReservas.has(reserva.id_reserva) && (
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

                      {/* Itens da Reserva */}
                      {itens.length > 0 && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Itens da Reserva</h4>
                          <div className="space-y-2">
                            {itens.map((item: any) => {
                              const produto = produtosMap.get(item.id_produto);
                              return (
                                <div key={item.id_item_reserva} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {produto?.nome || 'Produto não encontrado'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Quantidade: {item.quantidade} | Dias: {item.dias_locacao}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                      R$ {Number(item.valor_total || 0).toFixed(2).replace('.', ',')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      R$ {Number(item.valor_unitario || 0).toFixed(2).replace('.', ',')} / dia
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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

      {/* Modal de Finalização */}
      <FinalizarReservaModal
        isOpen={showFinalizarModal}
        onClose={fecharModalFinalizar}
        reserva={reservaParaFinalizar}
        itens={itensReservas.get(reservaParaFinalizar?.id_reserva) || []}
        onConfirm={processarFinalizacao}
        isLoading={finalizandoReserva}
      />

      {/* Modal de Mudança de Status */}
      {showMudarStatusModal && reservaParaMudarStatus && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={fecharModalMudarStatus}
            >
              <XCircleIcon className="w-6 h-6" />
            </button>

            <div className="flex items-center mb-4">
              <ArrowPathIcon className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-bold text-gray-900">Mudar Status da Reserva</h3>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Reserva ID: <span className="font-semibold">{reservaParaMudarStatus.id_reserva}</span></p>
              <p className="text-sm text-gray-600 mb-4">Status atual: <span className="font-semibold bg-gray-100 px-2 py-1 rounded">{reservaParaMudarStatus.status}</span></p>
              <p className="text-sm text-gray-700">Selecione o novo status:</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                'Criado',
                'Preparado',
                'Enviado',
                'Locado',
                'Devolvido',
                'Faturado',
                'Cancelado'
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => processarMudancaStatus(status)}
                  disabled={mudandoStatus || status === reservaParaMudarStatus.status}
                  className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                    status === reservaParaMudarStatus.status
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={fecharModalMudarStatus}
                disabled={mudandoStatus}
              >
                Cancelar
              </Button>
            </div>

            {mudandoStatus && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Atualizando status...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ReservasPage;