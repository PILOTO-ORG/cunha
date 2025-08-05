import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ClienteService from '../services/clienteService.ts';
import type { Cliente } from '../types/api';
import type { ClienteFilter, CriarClienteRequest, AtualizarClienteRequest } from '../types/api';

// Query Keys
export const CLIENTE_QUERY_KEYS = {
  all: ['clientes'] as const,
  lists: () => [...CLIENTE_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: ClienteFilter) => [...CLIENTE_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...CLIENTE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CLIENTE_QUERY_KEYS.details(), id] as const,
  estatisticas: (id: number) => [...CLIENTE_QUERY_KEYS.all, 'estatisticas', id] as const,
};

/**
 * Hook para listar clientes
 */
export function useClientes(filtros?: ClienteFilter) {
  return useQuery({
    queryKey: CLIENTE_QUERY_KEYS.list(filtros),
    queryFn: () => ClienteService.listarClientes(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar um cliente específico
 */
export function useCliente(id: number) {
  return useQuery({
    queryKey: CLIENTE_QUERY_KEYS.detail(id),
    queryFn: () => ClienteService.buscarCliente(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para estatísticas de clientes - requer ID do cliente
 */
export function useEstatisticasCliente(id: number) {
  return useQuery({
    queryKey: CLIENTE_QUERY_KEYS.estatisticas(id),
    queryFn: () => ClienteService.obterEstatisticas(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id, // Só executa se ID estiver presente
  });
}

/**
 * Hook para criar cliente
 */
export function useCriarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cliente: CriarClienteRequest) => 
      ClienteService.criarCliente(cliente),
    onSuccess: () => {
      // Invalidar listas de clientes
      queryClient.invalidateQueries({ queryKey: CLIENTE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para atualizar cliente
 */
export function useAtualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarClienteRequest }) =>
      ClienteService.atualizarCliente(id, dados),
    onSuccess: (data, variables) => {
      // Atualizar cache do cliente específico
      queryClient.setQueryData(CLIENTE_QUERY_KEYS.detail(variables.id), data);
      
      // Invalidar listas de clientes
      queryClient.invalidateQueries({ queryKey: CLIENTE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para remover cliente
/**
 * Hook para remover cliente
 */
export function useRemoverCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClienteService.removerCliente(id),
    onSuccess: (_, id) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: CLIENTE_QUERY_KEYS.detail(id) });
      
      // Invalidar listas de clientes
      queryClient.invalidateQueries({ queryKey: CLIENTE_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para buscar cliente por nome
 */
/**
 * Hook para desativar um cliente (soft delete)
 */
export function useSoftDeleteCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClienteService.softDeleteCliente(id),
    onSuccess: (_, id) => {
      // Atualizar o cache para marcar o cliente como removido
      queryClient.setQueryData(CLIENTE_QUERY_KEYS.detail(id), (old: Cliente | undefined) => 
        old ? { ...old, removido: true, removido_em: new Date().toISOString() } : undefined
      );
      
      // Invalidar listas de clientes para refletir a mudança
      queryClient.invalidateQueries({ queryKey: CLIENTE_QUERY_KEYS.lists() });
    },
  });
}

export function useBuscarClientePorNome(nome: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...CLIENTE_QUERY_KEYS.all, 'buscar-nome', nome],
    queryFn: () => ClienteService.buscarPorNome(nome),
    enabled: enabled && nome.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para verificar se email existe
 */
export function useVerificarEmailExistente(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...CLIENTE_QUERY_KEYS.all, 'verificar-email', email],
    queryFn: () => ClienteService.verificarClienteExiste(email),
    enabled: enabled && !!email,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
