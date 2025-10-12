import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LocalService from '../services/localService';
import type { Local, LocalFilter, CriarLocalRequest, AtualizarLocalRequest, PaginatedResponse } from '../types/api';

// Query Keys
export const LOCAL_QUERY_KEYS = {
  all: ['locais'] as const,
  lists: () => [...LOCAL_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: LocalFilter) => [...LOCAL_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...LOCAL_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...LOCAL_QUERY_KEYS.details(), id] as const,
  porTipo: (tipo: string) => [...LOCAL_QUERY_KEYS.all, 'tipo', tipo] as const,
  disponibilidade: (id_local: number, data_inicio: string, data_fim: string) => 
    [...LOCAL_QUERY_KEYS.all, 'disponibilidade', id_local, data_inicio, data_fim] as const,
};

/**
 * Hook para listar locais
 */
export function useLocais(filtros?: LocalFilter) {
  return useQuery({
    queryKey: LOCAL_QUERY_KEYS.list(filtros),
    queryFn: () => LocalService.listarLocais(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar local por ID
 */
export function useLocal(id: number) {
  return useQuery({
    queryKey: LOCAL_QUERY_KEYS.detail(id),
    queryFn: () => LocalService.buscarLocal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar locais por tipo
 */
export function useLocaisPorTipo(tipo: string) {
  return useQuery({
    queryKey: LOCAL_QUERY_KEYS.porTipo(tipo),
    queryFn: () => LocalService.buscarPorTipo(tipo),
    enabled: !!tipo,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para verificar disponibilidade de local
 */
export function useDisponibilidadeLocal(
  localId: number, 
  dataInicio: string, 
  dataFim: string, 
  enabled: boolean = true
) {
  return useQuery({
    queryKey: LOCAL_QUERY_KEYS.disponibilidade(localId, dataInicio, dataFim),
    queryFn: () => LocalService.verificarDisponibilidade(localId, dataInicio, dataFim),
    enabled: enabled && !!localId && !!dataInicio && !!dataFim,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para criar local
 */
export function useCriarLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (local: CriarLocalRequest) => LocalService.criarLocal(local),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCAL_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook para atualizar local
 */
export function useAtualizarLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarLocalRequest }) =>
      LocalService.atualizarLocal(id, dados),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LOCAL_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: LOCAL_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para remover local
 */
export function useRemoverLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => LocalService.removerLocal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCAL_QUERY_KEYS.all });
    },
  });
}
