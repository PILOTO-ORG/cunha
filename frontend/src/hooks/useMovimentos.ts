import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MovimentoService from '../services/movimentoService';
import type { Movimento, MovimentoFilter, CriarMovimentoRequest, PaginatedResponse } from '../types/api';

// Query Keys
export const MOVIMENTO_QUERY_KEYS = {
  all: ['movimentos'] as const,
  lists: () => [...MOVIMENTO_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: MovimentoFilter) => [...MOVIMENTO_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...MOVIMENTO_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...MOVIMENTO_QUERY_KEYS.details(), id] as const,
  porProduto: (id_produto: number) => [...MOVIMENTO_QUERY_KEYS.all, 'produto', id_produto] as const,
  porTipo: (tipo_evento: string) => [...MOVIMENTO_QUERY_KEYS.all, 'tipo', tipo_evento] as const,
  porPeriodo: (data_inicio: string, data_fim: string) => [...MOVIMENTO_QUERY_KEYS.all, 'periodo', data_inicio, data_fim] as const,
  historico: (id_produto: number) => [...MOVIMENTO_QUERY_KEYS.all, 'historico', id_produto] as const,
};

/**
 * Hook para listar movimentos
 */
export function useMovimentos(filtros?: MovimentoFilter) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.list(filtros),
    queryFn: () => MovimentoService.listarMovimentos(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar um movimento específico
 */
export function useMovimento(id: number) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.detail(id),
    queryFn: () => MovimentoService.buscarMovimento(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para criar movimento
 */
export function useCriarMovimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movimento: CriarMovimentoRequest) => 
      MovimentoService.criarMovimento(movimento),
    onSuccess: () => {
      // Invalidar listas de movimentos
      queryClient.invalidateQueries({ queryKey: MOVIMENTO_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para atualizar movimento
 */
export function useAtualizarMovimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<CriarMovimentoRequest> }) => 
      MovimentoService.atualizarMovimento(id, dados),
    onSuccess: () => {
      // Invalidar listas de movimentos e detalhes
      queryClient.invalidateQueries({ queryKey: MOVIMENTO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MOVIMENTO_QUERY_KEYS.details() });
    },
  });
}

/**
 * Hook para buscar movimentos por produto
 */
export function useMovimentosPorProduto(id_produto: number, enabled: boolean = true) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.porProduto(id_produto),
    queryFn: () => MovimentoService.buscarPorProduto(id_produto),
    enabled: enabled && !!id_produto,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar movimentos por tipo
 */
export function useMovimentosPorTipo(tipo_evento: 'entrada' | 'saida' | 'reserva' | 'limpeza' | 'perda', enabled: boolean = true) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.porTipo(tipo_evento),
    queryFn: () => MovimentoService.buscarPorTipo(tipo_evento),
    enabled: enabled && !!tipo_evento,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar movimentos por período
 */
export function useMovimentosPorPeriodo(data_inicio: string, data_fim: string, enabled: boolean = true) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.porPeriodo(data_inicio, data_fim),
    queryFn: () => MovimentoService.buscarPorPeriodo(data_inicio, data_fim),
    enabled: enabled && !!data_inicio && !!data_fim,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter histórico completo de um produto
 */
export function useHistoricoProduto(id_produto: number, enabled: boolean = true) {
  return useQuery({
    queryKey: MOVIMENTO_QUERY_KEYS.historico(id_produto),
    queryFn: () => MovimentoService.obterHistoricoProduto(id_produto),
    enabled: enabled && !!id_produto,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
