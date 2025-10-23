import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useClientes, useSoftDeleteCliente } from '../hooks/useClientes';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ClientForm from '../components/ClientForm';
import { Cliente } from '../types/api';
import { formatPhoneNumber } from '../utils/formatters';
import { toast } from 'react-hot-toast';

const ClientsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch clients, excluding inactive ones by default
  const { data: clientsResponse, isLoading, refetch } = useClientes({ 
    ativo: true,
    search: search
  });
  
  const softDeleteClientMutation = useSoftDeleteCliente();

  const clients = clientsResponse?.data || [];

  // Helper function to format CEP
  const formatCep = (cep: string | undefined | null): string => {
    if (!cep) return '-';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  };

  const handleOpenModal = (client: Cliente | null = null) => {
    setEditingClient(client);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setIsEditing(false);
  };

  const handleCreateSuccess = () => {
    refetch();
    handleCloseModal();
    toast.success('Cliente criado com sucesso!');
  };

  const handleEditSuccess = () => {
    refetch();
    setIsEditing(false);
    toast.success('Cliente atualizado com sucesso!');
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = (client: Cliente) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleSoftDelete = async () => {
    if (!clientToDelete) return;

    try {
      await softDeleteClientMutation.mutateAsync(clientToDelete.id_cliente);
      toast.success('Cliente desativado com sucesso');
      handleCloseDeleteModal();
      handleCloseModal();
      refetch();
    } catch (error) {
      toast.error('Erro ao desativar cliente');
      console.error('Error soft deleting client:', error);
    }
  };

  const columns = [
    {
      header: 'Nome',
      accessor: 'nome' as keyof Cliente,
      cell: (client: Cliente) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {client.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate" title={client.nome}>
              {client.nome}
            </div>
            <div className="text-sm text-gray-500 truncate" title={client.email || 'Sem email'}>
              {client.email || 'Sem email'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Telefone',
      accessor: 'telefone' as keyof Cliente,
      cell: (client: Cliente) => (
        <span className="text-sm text-gray-900">
          {client.telefone ? formatPhoneNumber(client.telefone) : '-'}
        </span>
      ),
      className: 'hidden sm:table-cell',
    },
    {
      header: 'CPF/CNPJ',
      accessor: 'cpf_cnpj' as keyof Cliente,
      cell: (client: Cliente) => (
        <span className="text-sm text-gray-900">{client.cpf_cnpj || '-'}</span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Endereço',
      accessor: 'endereco' as keyof Cliente,
      cell: (client: Cliente) => (
        <span className="text-sm text-gray-900">
          {client.cidade || client.endereco_completo || client.endereco || '-'}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Ações',
      accessor: 'id_cliente' as keyof Cliente,
      cell: (client: Cliente) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal(client)}
          >
            Ver Detalhes
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie seus clientes e informações de contato
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenModal(null)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Cliente
          </Button>
        </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar clientes por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Table
              data={clients}
              columns={columns}
              emptyMessage="Nenhum cliente encontrado. Clique em 'Novo Cliente' para adicionar o primeiro cliente."
            />
          )}
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Informações do Cliente' : 'Novo Cliente'}
        size="xl"
      >
        {editingClient ? (
          isEditing ? (
            <ClientForm
              key={`editar-${editingClient.id_cliente}`}
              client={editingClient}
              onSuccess={handleEditSuccess}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{editingClient.nome}</h2>
                    <p className="text-sm text-gray-500">Cliente #{editingClient.id_cliente}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${editingClient.ativo === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {editingClient.ativo === false ? 'Inativo' : 'Ativo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Informações de Contato</h3>
                    <div className="bg-white rounded-lg border border-gray-200">
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                          <dd className="text-sm text-gray-900">{editingClient.telefone ? formatPhoneNumber(editingClient.telefone) : '-'}</dd>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900 text-right break-all">{editingClient.email || '-'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Documentos & Pagamento</h3>
                    <div className="bg-white rounded-lg border border-gray-200">
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">CPF/CNPJ</dt>
                          <dd className="text-sm text-gray-900">{editingClient.cpf_cnpj || '-'}</dd>
                        </div>
                        <div className="px-4 py-3 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Forma de pagamento</dt>
                          <dd className="text-sm text-gray-900">{editingClient.forma_pagamento || 'A definir'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Endereço</h3>
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">CEP</p>
                          <p className="text-sm text-gray-900">{formatCep(editingClient.cep)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Endereço completo</p>
                          <p className="text-sm text-gray-900">{editingClient.endereco_completo || editingClient.endereco || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Rua</p>
                          <p className="text-sm text-gray-900">{editingClient.rua || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Número</p>
                          <p className="text-sm text-gray-900">{editingClient.numero || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Bairro</p>
                          <p className="text-sm text-gray-900">{editingClient.bairro || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Cidade</p>
                          <p className="text-sm text-gray-900">{editingClient.cidade || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Estado</p>
                          <p className="text-sm text-gray-900">{editingClient.estado ? editingClient.estado.toUpperCase() : '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Complemento</p>
                          <p className="text-sm text-gray-900">{editingClient.complemento || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Observações</h3>
                    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                      <p className="text-sm text-gray-900 whitespace-pre-line">{editingClient.observacoes || 'Nenhuma observação registrada.'}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Cadastrado em</p>
                        <p className="text-gray-900">{editingClient.criado_em ? new Date(editingClient.criado_em).toLocaleDateString('pt-BR') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Status</p>
                        <p className="text-gray-900">{editingClient.ativo === false ? 'Inativo' : 'Ativo'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">ID interno</p>
                        <p className="text-gray-900">{editingClient.id_cliente}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button variant="primary" onClick={handleEditClick}>
                    <PencilIcon className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  {editingClient.ativo !== false && (
                    <Button variant="danger" onClick={() => handleDeleteClick(editingClient)}>
                      <TrashIcon className="h-4 w-4 mr-1" /> Desativar
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={handleCloseModal}>
                  Fechar
                </Button>
              </div>
            </div>
          )
        ) : (
          <ClientForm
            client={null}
            onSuccess={handleCreateSuccess}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Desativar Cliente"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja desativar o cliente <span className="font-semibold">{clientToDelete?.nome}</span>?
          </p>
          <p className="text-sm text-gray-500">
            O cliente será marcado como inativo e não aparecerá nas listagens, mas poderá ser reativado posteriormente.
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={softDeleteClientMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleSoftDelete}
              loading={softDeleteClientMutation.isPending}
            >
              {softDeleteClientMutation.isPending ? 'Desativando...' : 'Desativar Cliente'}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default ClientsPage;
