import React, { useState, useMemo } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import { useProdutos } from '../hooks/useProdutos';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OrcamentoForm from '../components/OrcamentoForm';
import { 
  EyeIcon, 
  PencilIcon, 
  ShoppingBagIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import ReservaService from '../services/reservaService';

// Interface para filtros de período
interface PeriodoFilter {
  tipo: 'hoje' | 'semana' | 'mes' | 'ano' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
}

const OrcamentosPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<any>(null);
  const [expandedOrcamentos, setExpandedOrcamentos] = useState<Set<number>>(new Set());
  const [itensOrcamentos, setItensOrcamentos] = useState<Map<number, any[]>>(new Map());
  const [statusFilter, setStatusFilter] = useState<string>('pendente'); // Filtro padrão: pendente
  const [loadingActions, setLoadingActions] = useState<Map<number, string>>(new Map());
  
  // Novos filtros
  const [periodoFilter, setPeriodoFilter] = useState<PeriodoFilter>({ tipo: 'mes' });
  const [showFilters, setShowFilters] = useState(false);

  // Buscar reservas
  const { data: orcamentosData, isLoading: isLoadingReservas, error, refetch } = useReservas({ 
    search
  });
  
  // Buscar dados de apoio
  const { data: clientesData } = useClientes();
  const { data: locaisData } = useLocais();
  const { data: produtosData } = useProdutos();

  // Todos os orçamentos com filtro de período aplicado
  const todosOrcamentosComPeriodo = useMemo(() => {
    const orcamentos = (orcamentosData?.data || []).filter((r: any) => 
      ['pendente', 'aprovado', 'cancelado'].includes(r.status)
    );
    
    // Função para filtrar por período (dentro do useMemo)
    const filtrarPorPeriodo = (orcamentosList: any[]) => {
      if (!periodoFilter.tipo) return orcamentosList;

      const hoje = new Date();
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      
      return orcamentosList.filter(orcamento => {
        const dataOrcamento = new Date(orcamento.data_criacao || orcamento.data_evento);
        
        switch (periodoFilter.tipo) {
          case 'hoje':
            return dataOrcamento >= inicioHoje;
          
          case 'semana':
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            inicioSemana.setHours(0, 0, 0, 0);
            return dataOrcamento >= inicioSemana;
          
          case 'mes':
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            return dataOrcamento >= inicioMes;
          
          case 'ano':
            const inicioAno = new Date(hoje.getFullYear(), 0, 1);
            return dataOrcamento >= inicioAno;
          
          case 'personalizado':
            if (periodoFilter.dataInicio && periodoFilter.dataFim) {
              const inicio = new Date(periodoFilter.dataInicio);
              const fim = new Date(periodoFilter.dataFim);
              fim.setHours(23, 59, 59, 999);
              return dataOrcamento >= inicio && dataOrcamento <= fim;
            }
            return true;
          
          default:
            return true;
        }
      });
    };
    
    return filtrarPorPeriodo(orcamentos);
  }, [orcamentosData, periodoFilter]);

  // Filtrar reservas baseado no status selecionado
  const reservas = statusFilter === 'todos' 
    ? todosOrcamentosComPeriodo
    : todosOrcamentosComPeriodo.filter((r: any) => {
        if (statusFilter === 'pendente') return r.status === 'pendente' || r.status === 'orcamento';
        if (statusFilter === 'aprovado') return r.status === 'aprovado';
        if (statusFilter === 'reprovado' || statusFilter === 'cancelado') return r.status === 'cancelada';
        return false;
      });

  // Calcular estatísticas por status (com filtro de período)
  const stats = {
    todos: {
      count: todosOrcamentosComPeriodo.length,
      valor: todosOrcamentosComPeriodo.reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0)
    },
    pendentes: {
      count: todosOrcamentosComPeriodo.filter(r => r.status === 'pendente' || r.status === 'orcamento').length,
      valor: todosOrcamentosComPeriodo.filter(r => r.status === 'pendente' || r.status === 'orcamento').reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0)
    },
    aprovados: {
      count: todosOrcamentosComPeriodo.filter(r => r.status === 'aprovado').length,
      valor: todosOrcamentosComPeriodo.filter(r => r.status === 'aprovado').reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0)
    },
    reprovados: {
      count: todosOrcamentosComPeriodo.filter(r => r.status === 'cancelada').length,
      valor: todosOrcamentosComPeriodo.filter(r => r.status === 'cancelada').reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0)
    }
  };

  const clientes = clientesData?.data || [];
  const locais = locaisData?.data || [];
  const produtos = produtosData?.data || [];

  // Create maps for lookups
  const clientesMap = new Map(clientes.map(c => [c.id_cliente, c]));
  const produtosMap = new Map(produtos.map(p => [p.id_produto, p]));

  const handleAprovarOrcamento = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Deseja aprovar este orçamento? Ele será transformado em uma reserva confirmada.')) {
      return;
    }

    const newLoading = new Map(loadingActions);
    newLoading.set(id, 'aprovando');
    setLoadingActions(newLoading);

    try {
      await ReservaService.aprovarOrcamento(id);
      alert('Orçamento aprovado com sucesso!');
      refetch();
    } catch (error: any) {
      console.error('Erro ao aprovar orçamento:', error);
      alert(error.response?.data?.error || 'Erro ao aprovar orçamento');
    } finally {
      const newLoading = new Map(loadingActions);
      newLoading.delete(id);
      setLoadingActions(newLoading);
    }
  };

  const handleCancelarOrcamento = async (id: number) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Deseja cancelar este orçamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    const newLoading = new Map(loadingActions);
    newLoading.set(id, 'cancelando');
    setLoadingActions(newLoading);

    try {
      await ReservaService.cancelarOrcamento(id);
      alert('Orçamento cancelado com sucesso!');
      refetch();
    } catch (error: any) {
      console.error('Erro ao cancelar orçamento:', error);
      alert('Erro ao cancelar orçamento');
    } finally {
      const newLoading = new Map(loadingActions);
      newLoading.delete(id);
      setLoadingActions(newLoading);
    }
  };

  const handleBaixarPDF = async (id: number) => {
    const newLoading = new Map(loadingActions);
    newLoading.set(id, 'pdf');
    setLoadingActions(newLoading);

    try {
      await ReservaService.gerarPDFOrcamento(id);
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      const newLoading = new Map(loadingActions);
      newLoading.delete(id);
      setLoadingActions(newLoading);
    }
  };

  const toggleOrcamentoExpansion = async (idReserva: number) => {
    const newExpanded = new Set(expandedOrcamentos);
    
    if (expandedOrcamentos.has(idReserva)) {
      newExpanded.delete(idReserva);
    } else {
      newExpanded.add(idReserva);
      
      // Buscar itens se não temos ainda
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

  const handleNewOrcamento = () => {
    navigate('/orcamentos/marketplace');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedOrcamento(null);
    refetch();
  };

  if (isLoadingReservas) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando orçamentos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-800">Erro ao carregar orçamentos: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com título */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <Button onClick={handleNewOrcamento}>
          Novo Orçamento
        </Button>
      </div>

      {/* Dashboard com estatísticas por status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Todos */}
        <div 
          className={`bg-white p-6 rounded-lg shadow border-l-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'todos' ? 'border-l-blue-600 bg-blue-50' : 'border-l-gray-300'
          }`}
          onClick={() => setStatusFilter('todos')}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todos.count}</p>
              <p className="text-sm font-medium text-blue-600">
                R$ {stats.todos.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div 
          className={`bg-white p-6 rounded-lg shadow border-l-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'pendente' ? 'border-l-yellow-600 bg-yellow-50' : 'border-l-gray-300'
          }`}
          onClick={() => setStatusFilter('pendente')}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendentes.count}</p>
              <p className="text-sm font-medium text-yellow-600">
                R$ {stats.pendentes.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aprovados */}
        <div 
          className={`bg-white p-6 rounded-lg shadow border-l-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'aprovado' ? 'border-l-green-600 bg-green-50' : 'border-l-gray-300'
          }`}
          onClick={() => setStatusFilter('aprovado')}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aprovados.count}</p>
              <p className="text-sm font-medium text-green-600">
                R$ {stats.aprovados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>

        {/* Reprovados */}
        <div 
          className={`bg-white p-6 rounded-lg shadow border-l-4 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'reprovado' ? 'border-l-red-600 bg-red-50' : 'border-l-gray-300'
          }`}
          onClick={() => setStatusFilter('reprovado')}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Reprovados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reprovados.count}</p>
              <p className="text-sm font-medium text-red-600">
                R$ {stats.reprovados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <XCircleIcon className="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
            Filtros
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
              </select>
            </div>

            {/* Filtro de Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={periodoFilter.tipo}
                onChange={(e) => setPeriodoFilter({ 
                  tipo: e.target.value as PeriodoFilter['tipo'],
                  dataInicio: undefined,
                  dataFim: undefined
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="ano">Este Ano</option>
                <option value="personalizado">Período Personalizado</option>
              </select>
            </div>

            {/* Filtro de Data Personalizada */}
            {periodoFilter.tipo === 'personalizado' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    value={periodoFilter.dataInicio || ''}
                    onChange={(e) => setPeriodoFilter({
                      ...periodoFilter,
                      dataInicio: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    value={periodoFilter.dataFim || ''}
                    onChange={(e) => setPeriodoFilter({
                      ...periodoFilter,
                      dataFim: e.target.value
                    })}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar orçamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="w-4 h-4 mr-1" />
          Período: {
            periodoFilter.tipo === 'hoje' ? 'Hoje' :
            periodoFilter.tipo === 'semana' ? 'Esta Semana' :
            periodoFilter.tipo === 'mes' ? 'Este Mês' :
            periodoFilter.tipo === 'ano' ? 'Este Ano' :
            periodoFilter.tipo === 'personalizado' ? 'Personalizado' : 'Filtro'
          }
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <OrcamentoForm
              orcamento={selectedOrcamento}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
              locais={locais}
            />
          </div>
        </div>
      )}

      {/* Reservas List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">
            Lista de Orçamentos - {
              statusFilter === 'todos' ? 'Todos' :
              statusFilter === 'pendente' ? 'Pendentes' :
              statusFilter === 'aprovado' ? 'Aprovados' :
              statusFilter === 'reprovado' ? 'Reprovados' : 'Filtro'
            } ({reservas.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Período: {
              periodoFilter.tipo === 'hoje' ? 'Hoje' :
              periodoFilter.tipo === 'semana' ? 'Esta Semana' :
              periodoFilter.tipo === 'mes' ? 'Este Mês' :
              periodoFilter.tipo === 'ano' ? 'Este Ano' :
              periodoFilter.tipo === 'personalizado' ? 
                `${periodoFilter.dataInicio ? new Date(periodoFilter.dataInicio).toLocaleDateString('pt-BR') : ''} até ${periodoFilter.dataFim ? new Date(periodoFilter.dataFim).toLocaleDateString('pt-BR') : ''}` :
                'Todos'
            }
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {reservas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">Nenhuma reserva encontrada</div>
            </div>
          ) : (
            reservas.map((reserva) => {
              const cliente = clientesMap.get(reserva.id_cliente || 0);
              const isExpanded = expandedOrcamentos.has(reserva.id_reserva);
              const itens = itensOrcamentos.get(reserva.id_reserva) || [];
              
              // Debug log para verificar o tipo de valor_total
              console.log('Reserva:', reserva.id_reserva, 'valor_total:', reserva.valor_total, 'tipo:', typeof reserva.valor_total);
              
              return (
                <div key={reserva.id_reserva}>
                  <div className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-900">
                            Reserva #{reserva.id_reserva}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            reserva.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                            reserva.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            reserva.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reserva.status}
                          </span>
                          {itens.length > 0 && (
                            <span className="flex items-center text-xs text-gray-500">
                              <ShoppingBagIcon className="w-4 h-4 mr-1" />
                              {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Cliente: {cliente?.nome || 'Cliente não encontrado'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Data Evento: {reserva.data_evento ? new Date(reserva.data_evento).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Valor: R$ {(() => {
                            const valor = reserva.valor_total;
                            if (valor === null || valor === undefined) return '0.00';
                            const numero = Number(valor);
                            return isNaN(numero) ? '0.00' : numero.toFixed(2);
                          })()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* Botões de ação primários para orçamentos pendentes */}
                        {(reserva.status === 'orcamento' || reserva.status === 'pendente') && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAprovarOrcamento(reserva.id_reserva)}
                              disabled={loadingActions.has(reserva.id_reserva)}
                              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              {loadingActions.get(reserva.id_reserva) === 'aprovando' ? 'Aprovando...' : 'Aprovar'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelarOrcamento(reserva.id_reserva)}
                              disabled={loadingActions.has(reserva.id_reserva)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              {loadingActions.get(reserva.id_reserva) === 'cancelando' ? 'Cancelando...' : 'Reprovar'}
                            </Button>
                          </>
                        )}

                        {/* Botões de ação secundários */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/orcamentos/editar/${reserva.id_reserva}`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBaixarPDF(reserva.id_reserva)}
                          disabled={loadingActions.get(reserva.id_reserva) === 'pdf'}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                          {loadingActions.get(reserva.id_reserva) === 'pdf' ? 'Gerando...' : 'PDF'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleOrcamentoExpansion(reserva.id_reserva)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {isExpanded ? 'Ocultar' : 'Ver Itens'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Itens expandidos */}
                  {isExpanded && itens.length > 0 && (
                    <div className="px-6 pb-4 bg-gray-50 border-t">
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Produtos do Orçamento:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {itens.map((item: any) => {
                            const produto = produtosMap.get(item.id_produto);
                            return (
                              <div key={item.id_item_reserva} className="bg-white p-3 rounded-md border">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {produto?.nome || item.produto_nome || 'Produto não encontrado'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Quantidade: {item.quantidade}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Valor unitário: R$ {Number(item.valor_unitario || produto?.valor_locacao || 0).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-green-600">
                                      R$ {Number(item.valor_total || 0).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrcamentosPage;