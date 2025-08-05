import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProdutoService } from '../services/produtoService.ts';
import type { 
  ProdutoFilter, 
  DisponibilidadeConsulta,
  AtualizarProdutoRequest,
  CriarProdutoRequest
} from '../types/api';

// Query Keys
export const PRODUTO_QUERY_KEYS = {
  all: ['produtos'] as const,
  lists: () => [...PRODUTO_QUERY_KEYS.all, 'list'] as const,
  list: (filtros?: ProdutoFilter) => [...PRODUTO_QUERY_KEYS.lists(), filtros] as const,
  details: () => [...PRODUTO_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUTO_QUERY_KEYS.details(), id] as const,
  disponibilidade: (consulta: DisponibilidadeConsulta) => [...PRODUTO_QUERY_KEYS.all, 'disponibilidade', consulta] as const,
  estoqueBaixo: () => [...PRODUTO_QUERY_KEYS.all, 'estoque-baixo'] as const,
};

/**
 * Hook para listar produtos
 */
export function useProdutos(filtros?: ProdutoFilter) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.list(filtros),
    queryFn: () => ProdutoService.listarProdutos(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar um produto específico
 */
export function useProduto(id: number) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.detail(id),
    queryFn: () => ProdutoService.buscarProduto(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para verificar disponibilidade de produto
 */
export function useDisponibilidadeProduto(consulta: DisponibilidadeConsulta, enabled: boolean = true) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.disponibilidade(consulta),
    queryFn: () => ProdutoService.verificarDisponibilidade(consulta),
    enabled: enabled && !!consulta.id_produto && !!consulta.data_inicio && !!consulta.data_fim,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para produtos com estoque baixo
 */
export function useProdutosEstoqueBaixo() {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.estoqueBaixo(),
    queryFn: () => ProdutoService.listarEstoqueBaixo(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para criar produto
 */
export function useCriarProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (produto: CriarProdutoRequest) => 
      ProdutoService.criarProduto(produto),
    onSuccess: () => {
      // Invalidar listas de produtos
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.estoqueBaixo() });
    },
  });
}

/**
 * Hook para atualizar produto
 */
export function useAtualizarProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarProdutoRequest }) =>
      ProdutoService.atualizarProduto(id, dados),
    onSuccess: (data, variables) => {
      // Atualizar cache do produto específico
      queryClient.setQueryData(PRODUTO_QUERY_KEYS.detail(variables.id), data);
      
      // Invalidar listas de produtos
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.estoqueBaixo() });
    },
  });
}

/**
 * Hook para remover produto (hard delete)
 */
export function useRemoverProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ProdutoService.removerProduto(id),
    onSuccess: (_, id) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: PRODUTO_QUERY_KEYS.detail(id) });
      
      // Invalidar listas de produtos
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook para remover produto logicamente (soft delete)
 */
export function useSoftDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ProdutoService.softDeleteProduto(id),
    onSuccess: (data, id) => {
      // Atualizar o cache do produto com a flag removido=true
      queryClient.setQueryData(PRODUTO_QUERY_KEYS.detail(id), data);
      
      // Invalidar listas de produtos para refletir a remoção
      queryClient.invalidateQueries({ queryKey: PRODUTO_QUERY_KEYS.lists() });
    },
  });
}
