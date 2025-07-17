import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReservaService from '../services/reservaService.ts';
import type { Reserva, ReservaFilter, CriarReservaRequest, AtualizarReservaRequest, PaginatedResponse } from '../types/api';

// Query Keys
export const RESERVA_QUERY_KEYS = {
  all: ['reservas'] as const,
  lists: () => [...RESERVA_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: ReservaFilter) => [...RESERVA_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...RESERVA_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...RESERVA_QUERY_KEYS.details(), id] as const,
  porCliente: (id_cliente: number) => [...RESERVA_QUERY_KEYS.all, 'cliente', id_cliente] as const,
  porProduto: (id_produto: number) => [...RESERVA_QUERY_KEYS.all, 'produto', id_produto] as const,
  porPeriodo: (data_inicio: string, data_fim: string) => [...RESERVA_QUERY_KEYS.all, 'periodo', data_inicio, data_fim] as const,
};

/**
 * Hook para listar reservas
 */
export function useReservas(filtros?: ReservaFilter) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.list(filtros),
    queryFn: () => ReservaService.listarReservas(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar uma reserva específica
 */
export function useReserva(id: number) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.detail(id),
    queryFn: () => ReservaService.buscarReserva(id),
    enabled: !!id,
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
      ReservaService.criarReserva(reserva),
    onSuccess: () => {
      // Invalidar listas de reservas
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
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
      ReservaService.atualizarReserva(id, dados),
    onSuccess: (data, variables) => {
      // Atualizar cache da reserva específica
      queryClient.setQueryData(RESERVA_QUERY_KEYS.detail(variables.id), data);
      
      // Invalidar listas de reservas
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para remover reserva
 */
export function useRemoverReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ReservaService.removerReserva(id),
    onSuccess: (_, id) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: RESERVA_QUERY_KEYS.detail(id) });
      
      // Invalidar listas de reservas
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para buscar reservas por cliente
 */
export function useReservasPorCliente(id_cliente: number, enabled: boolean = true) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.porCliente(id_cliente),
    queryFn: () => ReservaService.buscarPorCliente(id_cliente),
    enabled: enabled && !!id_cliente,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar reservas por produto
 */
export function useReservasPorProduto(id_produto: number, enabled: boolean = true) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.porProduto(id_produto),
    queryFn: () => ReservaService.buscarPorProduto(id_produto),
    enabled: enabled && !!id_produto,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar reservas por período
 */
export function useReservasPorPeriodo(data_inicio: string, data_fim: string, enabled: boolean = true) {
  return useQuery({
    queryKey: RESERVA_QUERY_KEYS.porPeriodo(data_inicio, data_fim),
    queryFn: () => ReservaService.buscarPorPeriodo(data_inicio, data_fim),
    enabled: enabled && !!data_inicio && !!data_fim,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para atualizar status de reserva
 */
export function useAtualizarStatusReserva() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ativa' | 'concluída' | 'cancelada' }) =>
      ReservaService.atualizarStatus(id, status),
    onSuccess: (data, variables) => {
      // Atualizar cache da reserva específica
      queryClient.setQueryData(RESERVA_QUERY_KEYS.detail(variables.id), data);
      
      // Invalidar listas de reservas
      queryClient.invalidateQueries({ queryKey: RESERVA_QUERY_KEYS.lists() });
    },
  });
}
