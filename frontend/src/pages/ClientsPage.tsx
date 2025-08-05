import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useClientes, useRemoverCliente, useSoftDeleteCliente, useAtualizarCliente } from '../hooks/useClientes.ts';
import type { AtualizarClienteRequest } from '../types/api';
import ClienteService from '../services/clienteService.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Table from '../components/ui/Table.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import ClientForm from '../components/ClientForm.tsx';
import { Cliente } from '../types/api.ts';
import { formatPhoneNumber, formatCPF, formatCNPJ } from '../utils/formatters.ts';
import { toast } from 'react-hot-toast';

const ClientsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AtualizarClienteRequest>({
    nome: '',
    telefone: undefined,
    email: undefined,
    cpf_cnpj: undefined,
    rg_inscricao_estadual: undefined,
    endereco: undefined,
    cep: undefined
  });
  
  const updateClientMutation = useAtualizarCliente();
  const isSaving = updateClientMutation.isPending;
  
  // Initialize form data when editing client changes
  useEffect(() => {
    if (editingClient) {
      setFormData({
        nome: editingClient.nome || '',
        telefone: editingClient.telefone || '',
        email: editingClient.email || '',
        cpf_cnpj: editingClient.cpf_cnpj || '',
        rg_inscricao_estadual: editingClient.rg_inscricao_estadual || '',
        endereco: editingClient.endereco || '',
        cep: editingClient.cep || ''
      });
      setIsEditing(false);
    }
  }, [editingClient]);
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (editingClient) {
      setFormData({
        nome: editingClient.nome || '',
        telefone: editingClient.telefone || '',
        email: editingClient.email || '',
        cpf_cnpj: editingClient.cpf_cnpj || '',
        rg_inscricao_estadual: editingClient.rg_inscricao_estadual || '',
        endereco: editingClient.endereco || '',
        cep: editingClient.cep || ''
      });
    }
  };
  
  const handleSave = async () => {
    if (!editingClient) return;
    
    try {
      console.log('Enviando dados para atualização:', formData); // Log para debug
      
      const response = await updateClientMutation.mutateAsync({
        id: editingClient.id_cliente,
        dados: {
          nome: formData.nome || '',
          telefone: formData.telefone,
          email: formData.email,
          cpf_cnpj: formData.cpf_cnpj,
          rg_inscricao_estadual: formData.rg_inscricao_estadual,
          endereco: formData.endereco,
          cep: formData.cep
        }
      });
      
      console.log('Resposta da API:', response); // Log para debug
      
      if (response) {
        toast.success('Cliente atualizado com sucesso!');
        setIsEditing(false);
        
        // Atualiza o cliente na lista
        const updatedClient = await ClienteService.buscarCliente(editingClient.id_cliente);
        setEditingClient(updatedClient);
        
        // Força uma nova busca para atualizar a lista
        if (refetch) {
          await refetch();
        }
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar cliente: ${errorMessage}`);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formatar CEP enquanto digita
    if (name === 'cep') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 8);
      const formattedCep = numbersOnly.replace(/^(\d{5})(\d{0,3}).*/, '$1$2');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedCep || undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };
  
  // Fetch clients, excluding removed ones by default
  const { data: clientsResponse, isLoading, refetch } = useClientes({ 
    removido: false,
    search: search
  });
  
  const deleteClientMutation = useRemoverCliente();
  const softDeleteClientMutation = useSoftDeleteCliente();

  const clients = clientsResponse?.data || [];
  
  // Handle soft delete confirmation
  const handleSoftDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await softDeleteClientMutation.mutateAsync(clientToDelete.id_cliente);
      toast.success('Cliente desativado com sucesso');
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      toast.error('Erro ao desativar cliente');
    }
  };
  
  // Handle hard delete (keep for now, but consider removing if not needed)
  const handleHardDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id_cliente);
      toast.success('Cliente excluído com sucesso');
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (client: Cliente) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const columns = [
    {
      header: 'Nome',
      accessor: (client: Cliente) => client.nome,
      cell: (client: Cliente) => (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Opening client details for:', client.id_cliente, client.nome);
            setEditingClient({...client});
            setIsModalOpen(true);
          }}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left w-full"
        >
          {client.nome}
        </button>
      )
    },
    {
      header: 'Telefone',
      accessor: (client: Cliente) => client.telefone ? formatPhoneNumber(client.telefone) : '-',
      cell: (client: Cliente) => (
        <div className="text-gray-600">{client.telefone ? formatPhoneNumber(client.telefone) : '-'}</div>
      ),
    },
    {
      header: '',
      accessor: () => '',
      cell: (client: Cliente) => (
        <div className="relative flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('3-dot menu clicked for client:', client.id_cliente);
              setEditingClient({...client});
              setIsModalOpen(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="Ver detalhes"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
            <span className="sr-only">Ver detalhes</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os clientes do sistema
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto justify-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-4 mb-8">
          <div className="max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
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
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{editingClient.nome}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Informações de Contato</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <label className="text-gray-500 w-32 font-medium">Telefone:</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="telefone"
                          value={formData.telefone || ''}
                          onChange={handleInputChange}
                          className="flex-1 ml-2"
                        />
                      ) : (
                        <span className="text-gray-900 flex-1 ml-2">{editingClient.telefone ? formatPhoneNumber(editingClient.telefone) : '-'}</span>
                      )}
                    </div>
                    <div className="flex items-start">
                      <label className="text-gray-500 w-32 font-medium">Email:</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          className="flex-1 ml-2"
                        />
                      ) : (
                        <span className="text-gray-900 flex-1 break-all ml-2">{editingClient.email || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Documentação</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <label className="text-gray-500 w-32 font-medium">CPF/CNPJ:</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="cpf_cnpj"
                          value={formData.cpf_cnpj || ''}
                          onChange={handleInputChange}
                          className="flex-1 ml-2"
                        />
                      ) : (
                        <span className="text-gray-900 flex-1 ml-2">{editingClient.cpf_cnpj || '-'}</span>
                      )}
                    </div>
                    <div className="flex items-start">
                      <label className="text-gray-500 w-32 font-medium">RG/Inscrição:</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="rg_inscricao_estadual"
                          value={formData.rg_inscricao_estadual || ''}
                          onChange={handleInputChange}
                          className="flex-1 ml-2"
                        />
                      ) : (
                        <span className="text-gray-900 flex-1 ml-2">{editingClient.rg_inscricao_estadual || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seção de Endereço - Sempre visível */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Endereço Completo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <label className="text-gray-600 w-32 font-medium flex-shrink-0">Endereço:</label>
                      {isEditing ? (
                        <Input
                          type="text"
                          name="endereco"
                          value={formData.endereco || ''}
                          onChange={handleInputChange}
                          className="flex-1 ml-2 bg-white"
                          placeholder="Rua, número, complemento"
                        />
                      ) : (
                        <span className="text-gray-900 flex-1 ml-2">{editingClient.endereco || 'Não informado'}</span>
                      )}
                    </div>
                    <div className="flex items-start">
                      <label className="text-gray-600 w-32 font-medium flex-shrink-0">CEP:</label>
                      {isEditing ? (
                        <div className="flex-1 ml-2">
                          <Input
                            type="text"
                            name="cep"
                            value={formData.cep || ''}
                            onChange={handleInputChange}
                            className="w-40 bg-white"
                            placeholder="00000-000"
                          />
                          <p className="text-xs text-gray-500 mt-1">Apenas números</p>
                        </div>
                      ) : (
                        <span className="text-gray-900 flex-1 ml-2">
                          {editingClient.cep ? 
                            editingClient.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2') : 
                            'Não informado'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Informações do Cadastro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32 font-medium">Cadastrado em:</span>
                      <span className="text-gray-900 flex-1">
                        {editingClient.criado ? new Date(editingClient.criado).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32 font-medium">Última atualização:</span>
                      <span className="text-gray-900 flex-1">
                        {editingClient.atualizado ? new Date(editingClient.atualizado).toLocaleString('pt-BR') : '-'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-gray-500 w-32 font-medium">Status:</span>
                      <span className="flex items-center">
                        <span className={`h-2.5 w-2.5 rounded-full mr-2 ${editingClient.removido ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        {editingClient.removido ? 'Inativo' : 'Ativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleEditClick}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    {!editingClient.removido && (
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(editingClient)}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" /> Desativar
                      </Button>
                    )}
                  </>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <ClientForm
            client={editingClient}
            onSuccess={handleCloseModal}
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
  );
};

export default ClientsPage;
