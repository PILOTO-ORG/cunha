import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useProdutos, useRemoverProduto } from '../hooks/useProdutos.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Table from '../components/ui/Table.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import ProductForm from '../components/ProductForm.tsx';
import { Produto } from '../types/api';
import { formatCurrency } from '../utils/formatters.ts';

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produto | null>(null);
  
  const { data: productsResponse, isLoading } = useProdutos({ search });
  const deleteProductMutation = useRemoverProduto();

  const products = productsResponse?.data || [];

  const handleEdit = (product: Produto) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
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
      accessor: 'nome' as keyof Produto,
    },
    {
      header: 'Quantidade Total',
      accessor: 'quantidade_total' as keyof Produto,
    },
    {
      header: 'Valor Locação',
      accessor: (product: Produto) => product.valor_locacao ? formatCurrency(product.valor_locacao) : '-',
    },
    {
      header: 'Valor Danificação',
      accessor: (product: Produto) => product.valor_danificacao ? formatCurrency(product.valor_danificacao) : '-',
    },
    {
      header: 'Tempo Limpeza (dias)',
      accessor: (product: Produto) => product.tempo_limpeza ? `${product.tempo_limpeza} dias` : '-',
    },
    {
      header: 'Ações',
      accessor: (product: Produto) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(product)}
          >
            <PencilIcon className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(product.id_produto)}
            loading={deleteProductMutation.isPending}
          >
            <span className="hidden sm:inline">Excluir</span>
            <span className="sm:hidden">×</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <Table
          data={products}
          columns={columns}
          emptyMessage="Nenhum produto encontrado"
        />
      )}

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
    </div>
  );
};

export default ProductsPage;
