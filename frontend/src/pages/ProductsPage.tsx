import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useProdutos, useSoftDeleteProduto } from '../hooks/useProdutos.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Table from '../components/ui/Table.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import ProductForm from '../components/ProductForm.tsx';
import { Produto } from '../types/api';
import { formatCurrency } from '../utils/formatters.ts';
import { toast } from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  
  const { data: productsResponse, isLoading } = useProdutos({ search });
  const softDeleteMutation = useSoftDeleteProduto();

  // Filter out removed products
  const products = (productsResponse?.data || []).filter(product => !product.removido);

  const handleEdit = (product: Produto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Produto) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await softDeleteMutation.mutateAsync(productToDelete.id_produto);
      toast.success('Produto removido com sucesso!');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro ao remover o produto. Tente novamente.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
  };

  const columns = [
    {
      header: 'Nome',
      accessor: (product: Produto) => product.nome,
      cell: (product: Produto) => (
        <div className="font-medium text-gray-900">{product.nome}</div>
      )
    },
    {
      header: 'Quantidade',
      accessor: (product: Produto) => product.quantidade_total?.toString() || '0',
      cell: (product: Produto) => (
        <div className="text-gray-600">{product.quantidade_total || '0'}</div>
      ),
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Valor Locação',
      accessor: (product: Produto) => product.valor_locacao ? formatCurrency(product.valor_locacao) : '-',
      cell: (product: Produto) => (
        <div className="text-gray-600">{product.valor_locacao ? formatCurrency(product.valor_locacao) : '-'}</div>
      ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Valor Danificação',
      accessor: (product: Produto) => product.valor_danificacao ? formatCurrency(product.valor_danificacao) : '-',
      cell: (product: Produto) => (
        <div className="text-gray-600">{product.valor_danificacao ? formatCurrency(product.valor_danificacao) : '-'}</div>
      ),
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Limpeza',
      accessor: (product: Produto) => product.tempo_limpeza ? `${product.tempo_limpeza} dias` : '-',
      cell: (product: Produto) => (
        <div className="text-gray-600">{product.tempo_limpeza ? `${product.tempo_limpeza} dias` : '-'}</div>
      ),
      className: 'hidden sm:table-cell',
    },
    {
      header: 'Ações',
      accessor: () => '',
      cell: (product: Produto) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
            }}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(product);
            }}
            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
            title="Remover"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Produtos
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie seus produtos e estoque
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4
            [&>button:first-child]:hidden sm:[&>button:first-child]:inline-flex">
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              variant="primary"
              className="w-full sm:w-auto justify-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              aria-label="Buscar produtos"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Carregando produtos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Tente ajustar sua busca.' : 'Comece adicionando um novo produto.'}
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsModalOpen(true);
                  }}
                  variant="primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                data={products}
                columns={columns}
                emptyMessage="Nenhum produto encontrado"
                rowClassName="hover:bg-gray-50 cursor-pointer transition-colors"
                onRowClick={(product: unknown) => handleEdit(product as Produto)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Confirmar Exclusão"
        size="md"
        closeButton={true}
      >
        <div className="p-4">
          <p className="text-gray-700 mb-6">
            Tem certeza que deseja remover o produto <span className="font-semibold">{productToDelete?.nome}</span>?
            Esta ação marcará o produto como removido, mas ele permanecerá no sistema para fins de histórico.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={handleCancelDelete}
              variant="secondary"
              disabled={softDeleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="danger"
              disabled={softDeleteMutation.isPending}
              className="flex items-center"
            >
              {softDeleteMutation.isPending ? (
                <>
                  <LoadingSpinner size="xs" className="mr-2" />
                  Removendo...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Sim, remover
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;
