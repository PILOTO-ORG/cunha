import React, { useState, useMemo } from 'react';
import Table from '../components/ui/Table.tsx';
import Button from '../components/ui/Button.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import Input from '../components/ui/Input.tsx';
import { useReservas, useRemoverReserva } from '../hooks/useReservas.ts';
import { useClientes } from '../hooks/useClientes.ts';
import { useProdutos } from '../hooks/useProdutos.ts';
import { useConverterOrcamento } from '../hooks/useOrcamentos.ts';
import OrcamentoForm from '../components/OrcamentoForm.tsx';
import { useLocais } from '../hooks/useLocais.ts';
import { useQueryClient } from '@tanstack/react-query';
import type { Cliente, Produto, Local, Reserva } from '../types/api';
import type { OrcamentoAgrupado, StatusGeral, ItemOrcamentoAgrupado } from '../types/orcamento';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters.ts';
import ReservaService from '../services/reservaService.ts';
import { jwtFetch } from '../services/jwtFetch.ts';
import type { TableColumn } from '../components/ui/Table.tsx';

// Removido: buscarReservaAgrupada

// Função utilitária para montar o payload do orçamento

// Função para imprimir orçamento (sem request adicional)
async function imprimirOrcamento(orcamento: OrcamentoAgrupado) {
  // Se já existe link_drive, abre direto
  if (orcamento.link_drive) {
    window.open(orcamento.link_drive, '_blank');
    return;
  }
  
  console.log('Gerando planilha para orçamento', orcamento);
  
  // Load full objects from localStorage
  const clientesStorage: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]');
  const locaisStorage: Local[] = JSON.parse(localStorage.getItem('locais') || '[]');
  const produtosStorage: Produto[] = JSON.parse(localStorage.getItem('produtos') || '[]');
  const clienteFull = clientesStorage.find(c => c.id_cliente === orcamento.id_cliente) || null;
  const localFull = locaisStorage.find(l => l.id_local === orcamento.id_local) || null;
  const itensDetalhados = orcamento.itens.map(item => {
    const produtoFull = produtosStorage.find(p => p.id_produto === item.id_produto) || null;
    return {
      ...item,
      produto: produtoFull,
      valor_danificacao: produtoFull?.valor_danificacao || 0
    };
  });
  
  // Monta payload completo com objetos relacionados
  const payload = {
    ...orcamento,
    // Send dates as plain YYYY-MM-DD
    data_inicio: orcamento.data_inicio.split('T')[0],
    data_fim: orcamento.data_fim.split('T')[0],
    data_criacao: orcamento.data_criacao.split('T')[0],
    data_saida: orcamento.data_saida ? orcamento.data_saida.split('T')[0] : null,
    data_retorno: orcamento.data_retorno ? orcamento.data_retorno.split('T')[0] : null,
    cliente: clienteFull,
    local: localFull,
    itens: itensDetalhados,
    metadata: {
      sistema: 'Sistema de Gestão Cunha',
      versao: '1.0.0',
      data_geracao: new Date().toISOString()
    }
  };
  const resp = await jwtFetch('https://n8n.piloto.live/webhook/cunha-drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error('Erro ao gerar planilha');
  const data = await resp.json();
  if (data.link) {
    const url = `https://drive.google.com/file/d/${data.link}/view`;
    window.open(url, '_blank');
    await ReservaService.atualizarLinkDrive(Number(orcamento.id_reserva), url);
    // Atualiza a página para refletir o novo link_drive
    window.location.reload();
  } else {
    alert('Erro ao obter link da planilha');
  }
}


// Using OrcamentoAgrupado type from orcamento.ts

// Helper function to convert a Reserva to an OrcamentoAgrupado
const convertToOrcamentoAgrupado = (
  reserva: Reserva,
  clientesMap: Map<number, Cliente>,
  produtosMap: Map<number, Produto>,
  reservas: Reserva[]
): OrcamentoAgrupado | null => {
  const cliente = clientesMap.get(reserva.id_cliente || 0);
  const produto = produtosMap.get(reserva.id_produto);
  const dataAtual = new Date().toISOString();
  
  // Find all items for this reservation
  const itens = reservas
    .filter(r => r.id_reserva === reserva.id_reserva)
    .map(r => {
      const p = produtosMap.get(r.id_produto);
      return {
        id_item_reserva: r.id_item_reserva,
        id_produto: r.id_produto,
        produto_nome: p?.nome || 'Produto não encontrado',
        quantidade: r.quantidade,
        valor_unitario: p?.valor_locacao || 0,
        observacoes: r.observacoes
      };
    });

  // Calculate total value with days
  const inicio = new Date(reserva.data_inicio);
  const fim = new Date(reserva.data_fim);
  const diferenca = fim.getTime() - inicio.getTime();
  const diffDays = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
  const dias = diffDays > 0 ? diffDays : 0;
  const valor_itens = itens.reduce((total, item) => {
    return total + (item.valor_unitario || 0) * item.quantidade * dias;
  }, 0);
  // Coerce frete and desconto to numbers to avoid string concatenation
  const freteNum = Number(reserva.frete) || 0;
  const descontoNum = Number(reserva.desconto) || 0;
  const valor_total = valor_itens + freteNum - descontoNum;
  return {
    id_reserva: reserva.id_reserva,
    id_cliente: reserva.id_cliente || 0,
    id_local: reserva.id_local || null,
    cliente_nome: cliente?.nome || 'Cliente não encontrado',
    data_inicio: reserva.data_inicio,
    data_fim: reserva.data_fim,
    data_criacao: reserva.data_criacao || dataAtual,
    status: reserva.status as StatusGeral,
    itens,
    valor_total,
    observacoes: reserva.observacoes,
    link_drive: reserva.link_drive,
    frete: reserva.frete || 0,
    desconto: reserva.desconto || 0,
    dias_reservados: reserva.dias_reservados || 0,
    data_saida: reserva.data_saida,
    data_retorno: reserva.data_retorno
  };
};

const BudgetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativa' | 'concluída' | 'cancelada' | 'iniciada' | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<OrcamentoAgrupado | null>(null);
  
  // Buscar apenas reservas com status "iniciada" (que são os orçamentos)
  const { data: orcamentosData, isLoading: isLoadingReservas, error, refetch } = useReservas({ 
    search,
    status: 'iniciada' // Sempre filtrar por status iniciada para orçamentos
  });
  
  // Buscar todos os clientes e produtos para fazer join
  const { data: clientesData, isLoading: isLoadingClientes } = useClientes();
  const { data: produtosData, isLoading: isLoadingProdutos } = useProdutos();
  const { data: locaisData, isLoading: isLoadingLocais } = useLocais();
  
  const excluirOrcamentoMutation = useRemoverReserva();
  const converterOrcamentoMutation = useConverterOrcamento();

  const reservas = orcamentosData?.data || [];
  const clientes = clientesData?.data || [];
  const produtos = produtosData?.data || [];
  const locais = locaisData?.data || [];
  
  const isLoading = isLoadingReservas || isLoadingClientes || isLoadingProdutos || isLoadingLocais;

  // Criar mapas para lookup rápido
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

  // Função para calcular valor total com base no período
  const calcularValorItem = (produto: Produto | undefined, quantidade: number, dataInicio: string, dataFim: string): number => {
    if (!produto || !produto.valor_locacao) return 0;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diferenca = fim.getTime() - inicio.getTime();
    const dias = Math.max(1, Math.ceil(diferenca / (1000 * 60 * 60 * 24)));
    
    return produto.valor_locacao * quantidade * dias;
  };

  // Agrupar orçamentos por id_reserva usando helper para consistência de cálculo
  const orcamentosAgrupados = useMemo(() => {
    const ids = Array.from(new Set(reservas.map(r => r.id_reserva)));
    return ids
      .map(id => {
        const reserva = reservas.find(r => r.id_reserva === id);
        if (!reserva) return null;
        return convertToOrcamentoAgrupado(reserva, clientesMap, produtosMap, reservas);
      })
      .filter((o): o is OrcamentoAgrupado => o !== null);
  }, [reservas, clientesMap, produtosMap]);

  // Handle printing with full related data
  const handleImprimirOrcamento = async (orcamento: OrcamentoAgrupado) => {
    // Gather related data
    const clienteFull = clientes.find(c => c.id_cliente === orcamento.id_cliente) || null;
    const localFull = locais.find(l => l.id_local === orcamento.id_local) || null;
    const itensDetalhados = orcamento.itens.map(item => {
      const produtoFull = produtos.find(p => p.id_produto === item.id_produto) || null;
      return {
        ...item,
        produto: produtoFull,
        valor_danificacao: produtoFull?.valor_danificacao || 0
      };
    });
    // Send full objects for cliente, local, and itens
    const payload = {
      ...orcamento,
      // Send dates as plain YYYY-MM-DD
      data_inicio: orcamento.data_inicio.split('T')[0],
      data_fim: orcamento.data_fim.split('T')[0],
      data_criacao: orcamento.data_criacao.split('T')[0],
      data_saida: orcamento.data_saida ? orcamento.data_saida.split('T')[0] : null,
      data_retorno: orcamento.data_retorno ? orcamento.data_retorno.split('T')[0] : null,
      cliente: clienteFull,
      local: localFull,
      itens: itensDetalhados,
      metadata: {
        sistema: 'Sistema de Gestão Cunha',
        versao: '1.0.0',
        data_geracao: new Date().toISOString()
      }
    };
    const resp = await jwtFetch('https://n8n.piloto.live/webhook/cunha-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('Erro ao gerar planilha');
    const data = await resp.json();
    if (data.link) {
      const url = `https://drive.google.com/file/d/${data.link}/view`;
      window.open(url, '_blank');
      await ReservaService.atualizarLinkDrive(Number(orcamento.id_reserva), url);
      window.location.reload();
    } else {
      alert('Erro ao obter link da planilha');
    }
  };

  const handleCreateOrcamento = () => {
    setSelectedOrcamento(null);
    setShowModal(true);
  };

  const handleEditOrcamento = (orcamento: OrcamentoAgrupado) => {
    // Busca o grupo completo pelo id_reserva
    const grupo = orcamentosAgrupados.find(o => o.id_reserva === orcamento.id_reserva);
    if (grupo) {
      console.log('Grupo encontrado:', grupo);
      // Encontra a primeira reserva que tem as informações de local, frete e desconto
      const reservaCompleta = reservas.find(r => r.id_reserva === orcamento.id_reserva);
      
      // Cria um novo objeto com as informações adicionais
      const orcamentoCompleto = {
        ...grupo,
        id_local: reservaCompleta?.id_local || 0,
        frete: reservaCompleta?.frete || 0,
        desconto: reservaCompleta?.desconto || 0
      };

      console.log('Orcamento completo:', orcamentoCompleto);
      
      setSelectedOrcamento(orcamentoCompleto);
      setShowModal(true);
    }
  };

  const handleDeleteOrcamento = async (id: number) => {
    if (window.confirm('Tem certeza que deseja cancelar este orçamento?')) {
      try {
        // Busca o grupo de itens pelo id_reserva
        const grupo = orcamentosAgrupados.find(o => o.id_reserva === id);
        if (grupo) {
          await Promise.all(grupo.itens.map(item =>
            ReservaService.atualizarStatus(item.id_item_reserva, 'cancelada')
          ));
        } else {
          // fallback: tenta atualizar pelo id direto
          await ReservaService.atualizarStatus(id, 'cancelada');
        }
        refetch();
      } catch (error) {
        console.error('Erro ao cancelar orçamento:', error);
        alert('Erro ao cancelar orçamento');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedOrcamento(null);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedOrcamento(null);
    refetch();
  };

  const handleConvertToReserva = async (orcamento: OrcamentoAgrupado) => {
    if (window.confirm('Tem certeza que deseja confirmar este orçamento como reserva?')) {
      try {
        // Busca o grupo de itens pelo id_reserva
        const grupo = orcamentosAgrupados.find(o => o.id_reserva === orcamento.id_reserva);
        if (grupo) {
          await Promise.all(grupo.itens.map(item =>
            ReservaService.atualizarStatus(item.id_item_reserva, 'ativa')
          ));
        } else {
          // fallback: tenta atualizar pelo id direto
          await ReservaService.atualizarStatus(orcamento.id_reserva, 'ativa');
        }
        alert('Reserva confirmada com sucesso!');
        refetch();
      } catch (error) {
        console.error('Erro ao confirmar reserva:', error);
        alert('Erro ao confirmar reserva');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      iniciada: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Orçamento' },
      ativa: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativa' },
      concluída: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Concluída' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.iniciada;
    
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
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao Carregar Orçamentos</h2>
          <p className="text-red-600 mb-4">
            Ocorreu um erro ao carregar os orçamentos. Tente novamente.
          </p>
          <Button variant="outline">
            Tentar Novamente
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {orcamentosAgrupados.length} orçamento(s) encontrado(s) •{' '}
          {orcamentosAgrupados.reduce((count, orc) => count + orc.itens.length, 0)} item(s) total •{' '}
          Valor total: {formatCurrency(orcamentosAgrupados.reduce((sum, orc) => sum + orc.valor_total, 0))}
        </p>
      </div>
    );
  }

  const columns: TableColumn<OrcamentoAgrupado>[] = [
    {
      header: 'Cliente',
      accessor: 'cliente_nome' as keyof OrcamentoAgrupado,
      className: 'min-w-[120px]'
    },
    {
      header: 'Itens',
      accessor: 'itens' as keyof OrcamentoAgrupado,
      cell: (orcamento: OrcamentoAgrupado) => (
        <div className="space-y-2">
          {orcamento.itens.map(item => (
            <div key={item.id_item_reserva} className="text-sm border-l-2 border-blue-200 pl-2 break-words">
              <div className="font-medium text-gray-900 break-words">{item.produto_nome}</div>
              <div className="text-gray-500 flex flex-col sm:flex-row sm:justify-between break-words">
                <span>Qtd: {item.quantidade}</span>
                <span>{formatCurrency(item.valor_unitario || 0)}/dia</span>
              </div>
            </div>
          ))}
          {orcamento.itens.length > 1 && (
            <div className="text-xs text-gray-400 pt-1 border-t break-words">
              Total de {orcamento.itens.length} itens
            </div>
          )}
        </div>
      ),
      className: 'min-w-[160px]'
    },
    {
      header: 'Data Início',
      accessor: (orcamento: OrcamentoAgrupado) => formatDate(orcamento.data_inicio),
      className: 'min-w-[100px]'
    },
    {
      header: 'Data Fim',
      accessor: (orcamento: OrcamentoAgrupado) => formatDate(orcamento.data_fim),
      className: 'min-w-[100px]'
    },
    {
      header: 'Valor Total',
      accessor: 'valor_total' as keyof OrcamentoAgrupado,
      cell: (orcamento: OrcamentoAgrupado) => (
        <span className="font-medium text-green-600">
          {formatCurrency(orcamento.valor_total)}
        </span>
      ),
      className: 'min-w-[80px] text-right'
    },
    {
      header: 'Ações',
      accessor: 'id_reserva' as keyof OrcamentoAgrupado,
      cell: (orcamento: OrcamentoAgrupado) => (
        <div className="flex flex-wrap gap-1 justify-start items-center min-w-[100px] sm:min-w-[80px] md:min-w-[60px]" style={{ rowGap: '0.25rem' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Find the orcamento in the grouped list
              const orcamentoCompleto = orcamentosAgrupados.find(o => o.id_reserva === orcamento.id_reserva);
              if (orcamentoCompleto) {
                handleEditOrcamento(orcamentoCompleto);
              }
            }}
            className="p-1 min-w-[28px]"
            aria-label="Editar orçamento"
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteOrcamento(orcamento.id_reserva)}
            className="p-1 text-red-600 hover:text-red-700 min-w-[28px]"
            aria-label="Cancelar orçamento"
          >
            ❌
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await handleImprimirOrcamento(orcamento);
              } catch (e) {
                alert('Erro ao imprimir orçamento: ' + (e as Error).message);
              }
            }}
            className="p-1 text-blue-600 hover:text-blue-700 min-w-[28px]"
            title="Imprimir Orçamento"
            aria-label="Imprimir orçamento"
          >
            🖨️
          </Button>
          {orcamento.status === 'iniciada' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                // Find the orcamento in the grouped list
                const orcamentoCompleto = orcamentosAgrupados.find(o => o.id_reserva === orcamento.id_reserva);
                if (orcamentoCompleto) {
                  handleConvertToReserva(orcamentoCompleto);
                }
              }}
              className="p-1 text-xs min-w-[28px]"
              title="Confirmar Reserva"
              aria-label="Confirmar reserva"
            >
              ✅
            </Button>
          )}
        </div>
      ),
      className: 'w-28 sm:w-24 md:w-20'
    }
  ];


  // Força atualização dos dados de clientes e locais
  const atualizarClientes = () => queryClient.invalidateQueries({ queryKey: ['clientes', 'list', undefined] });
  const atualizarLocais = () => queryClient.invalidateQueries({ queryKey: ['locais', 'list', undefined] });

  return (
    <div className="container mx-auto px-1 sm:px-4 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orçamentos</h1>
          {!isLoading && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {orcamentosAgrupados.length} orçamento(s) encontrado(s) •{' '}
              {orcamentosAgrupados.reduce((count, orc) =>
                count + orc.itens.reduce((sum, item) => sum + item.quantidade, 0), 0
              )} item(s) total •{' '}
              Valor total: {formatCurrency(
                orcamentosAgrupados.reduce((sum, orc) => sum + orc.valor_total, 0)
              )}
            </p>
          )}
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <Button onClick={handleCreateOrcamento} className="flex items-center space-x-2 w-full sm:w-auto">
            ➕
            <span>Novo Orçamento</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {/* <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar orçamentos..."
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
      </div> */}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-full">
            <div className="w-full">
              <Table
                data={orcamentosAgrupados}
                columns={columns}
                emptyMessage="Nenhum orçamento encontrado. Crie seu primeiro orçamento clicando no botão 'Novo Orçamento'."
              />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal 
          isOpen={showModal} 
          onClose={handleModalClose} 
          size="xl"
        >
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedOrcamento ? '✏️ Editar Orçamento' : '➕ Novo Orçamento'}
                  </h2>
                  {selectedOrcamento && (
                    <p className="mt-1 text-sm text-gray-500">
                      ID: {selectedOrcamento.id_reserva}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors"
                  aria-label="Fechar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <OrcamentoForm
                orcamento={selectedOrcamento ?? undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleModalClose}
                locais={locais}
                 atualizarClientes={atualizarClientes}
                 atualizarLocais={atualizarLocais}
               />
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleModalClose}
                className="px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                form="orcamento-form"
                variant="primary"
                className="px-4 py-2 text-sm font-medium"
              >
                {selectedOrcamento ? 'Atualizar Orçamento' : 'Criar Orçamento'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BudgetsPage;
