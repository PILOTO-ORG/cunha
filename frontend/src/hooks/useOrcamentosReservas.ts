import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrcamentoService } from '../services/orcamentoService.ts';
import type { 
  Orcamento, 
  Reserva, 
  OrcamentoFilter, 
  ReservaFilter, 
  CriarOrcamentoRequest,
  AtualizarOrcamentoRequest,
  CriarReservaRequest,
  AtualizarReservaRequest,
  PaginatedResponse 
} from '../types/api';

// Query Keys
export const ORCAMENTO_QUERY_KEYS = {
  all: ['orcamentos'] as const,
  lists: () => [...ORCAMENTO_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: OrcamentoFilter) => [...ORCAMENTO_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...ORCAMENTO_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...ORCAMENTO_QUERY_KEYS.details(), id] as const,
  calcular: (id: number) => [...ORCAMENTO_QUERY_KEYS.all, 'calcular', id] as const,
};

export const RESERVA_QUERY_KEYS = {
  all: ['reservas'] as const,
  lists: () => [...RESERVA_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: ReservaFilter) => [...RESERVA_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...RESERVA_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RESERVA_QUERY_KEYS.details(), id] as const,
  ativas: () => [...RESERVA_QUERY_KEYS.all, 'ativas'] as const,
  periodo: (dataInicio: string, dataFim: string) => [...RESERVA_QUERY_KEYS.all, 'periodo', dataInicio, dataFim] as const,
  relatorio: (periodo: any) => [...RESERVA_QUERY_KEYS.all, 'relatorio', periodo] as const,
};

// === HOOKS PARA ORÇAMENTOS ===

/**
 * Hook para listar orçamentos
 */
export function useOrcamentos(filtros?: OrcamentoFilter) {
  return useQuery({
    queryKey: ORCAMENTO_QUERY_KEYS.list(filtros),
    queryFn: () => OrcamentoService.listarOrcamentos(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar orçamento por ID
 */
export function useOrcamento(id: number) {
  return useQuery({
    queryKey: ORCAMENTO_QUERY_KEYS.detail(id),
    queryFn: () => OrcamentoService.buscarOrcamento(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para calcular total do orçamento
 */
export function useCalcularOrcamento(id: number) {
  return useQuery({
    queryKey: ORCAMENTO_QUERY_KEYS.calcular(id),
    queryFn: () => OrcamentoService.calcularTotal(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para criar orçamento
 */
export function useCriarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orcamento: CriarOrcamentoRequest) => 
      OrcamentoService.criarOrcamento(orcamento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook para atualizar orçamento
 */
export function useAtualizarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarOrcamentoRequest }) =>
      OrcamentoService.atualizarOrcamento(id, dados),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para remover orçamento
 */
export function useRemoverOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => OrcamentoService.removerOrcamento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook para aprovar orçamento (converter em reserva)
 */
export function useAprovarOrcamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => OrcamentoService.aprovarOrcamento(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ORCAMENTO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.all });
    },
  });
}

// === HOOKS PARA RESERVAS ===

/**
 * Hook para listar reservas
 */
export function useReservas(filtros?: ReservaFilter) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.list(filtros),
    queryFn: () => OrcamentoService.listarReservas(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar reserva por ID
 */
export function useReserva(id: number) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.detail(id),
    queryFn: () => OrcamentoService.buscarReserva(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para listar reservas ativas
 */
export function useReservasAtivas() {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.ativas(),
    queryFn: () => OrcamentoService.listarReservasAtivas(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para listar reservas por período
 */
export function useReservasPorPeriodo(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.periodo(dataInicio, dataFim),
    queryFn: () => OrcamentoService.listarReservasPorPeriodo(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter relatório de reservas
 */
export function useRelatorioReservas(periodo: { dataInicio: string; dataFim: string }) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.relatorio(periodo),
    queryFn: () => OrcamentoService.obterRelatorioReservas(periodo),
    enabled: !!periodo.dataInicio && !!periodo.dataFim,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para criar reserva
 */
export function useCriarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reserva: CriarReservaRequest) => 
      OrcamentoService.criarReserva(reserva),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook para atualizar reserva
 */
export function useAtualizarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarReservaRequest }) =>
      OrcamentoService.atualizarReserva(id, dados),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para cancelar reserva
 */
export function useCancelarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      OrcamentoService.cancelarReserva(id, motivo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para finalizar reserva
 */
export function useFinalizarReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, observacoes }: { id: number; observacoes?: string }) =>
      OrcamentoService.finalizarReserva(id, observacoes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}
