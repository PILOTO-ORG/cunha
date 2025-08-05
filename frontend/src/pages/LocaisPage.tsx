
import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useLocais, useRemoverLocal } from '../hooks/useLocais.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Table from '../components/ui/Table.tsx';
import type { TableColumn } from '../components/ui/Table.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import LocalForm from '../components/LocalForm.tsx';
import type { Local } from '../types/api';
import { toast } from 'react-hot-toast';

const LocaisPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const [localToDelete, setLocalToDelete] = useState<Local | null>(null);
  
  const { data: locaisData, isLoading, refetch } = useLocais();
  const locais = locaisData?.data || [];
  const deleteLocal = useRemoverLocal();
  
  // Filter locais based on search
  const filteredLocais = locais.filter(local => 
    local.descricao.toLowerCase().includes(search.toLowerCase()) ||
    (local.tipo && local.tipo.toLowerCase().includes(search.toLowerCase()))
  );

  // Handle edit
  const handleEdit = (local: Local) => {
    setEditingLocal(local);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (local: Local) => {
    setLocalToDelete(local);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!localToDelete) return;
    
    try {
      await deleteLocal.mutateAsync(localToDelete.id_local);
      toast.success('Local removido com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao remover local:', error);
      toast.error('Erro ao remover local. Tente novamente.');
    } finally {
      setIsDeleteModalOpen(false);
      setLocalToDelete(null);
    }
  };

  // Table columns
  const columns: TableColumn<Local>[] = [
    {
      header: 'Descrição',
      accessor: 'descricao',
      cell: (local: Local) => (
        <div className="font-medium text-gray-900">
          {local.descricao}
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (local: Local) => local.tipo || 'Não especificado',
      cell: (local: Local) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {local.tipo || 'Não especificado'}
        </span>
      ),
    },
    {
      header: 'Endereço',
      accessor: (local: Local) => local.endereco || 'Não informado',
      cell: (local: Local) => local.endereco || 'Não informado',
    },
    {
      header: 'Capacidade',
      accessor: (local: Local) => local.capacidade || 0,
      cell: (local: Local) => local.capacidade ? `${local.capacidade} pessoas` : 'Não informada',
    },
    {
      header: 'Ações',
      accessor: (local: Local) => local.id_local,
      cell: (local: Local) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(local);
            }}
            className="text-indigo-600 hover:text-indigo-900"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(local);
            }}
            className="text-red-600 hover:text-red-900"
            title="Excluir"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Locais</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os locais disponíveis para reservas e eventos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => {
              setEditingLocal(null);
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Adicionar Local
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar locais..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <Table
              columns={columns}
              data={filteredLocais}
              emptyMessage="Nenhum local encontrado"
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocal ? 'Editar Local' : 'Adicionar Local'}
      >
        <LocalForm
          local={editingLocal || undefined}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja remover o local <span className="font-semibold">{localToDelete?.descricao}</span>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteLocal.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleteLocal.isPending}
            >
              {deleteLocal.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LocaisPage;
