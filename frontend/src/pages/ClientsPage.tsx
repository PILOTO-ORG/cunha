import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useClientes, useRemoverCliente } from '../hooks/useClientes.ts';
import Button from '../components/ui/Button.tsx';
import Input from '../components/ui/Input.tsx';
import Table from '../components/ui/Table.tsx';
import Modal from '../components/ui/Modal.tsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.tsx';
import ClientForm from '../components/ClientForm.tsx';
import { Cliente } from '../types/api';
import { formatPhoneNumber, formatCPF, formatCNPJ } from '../utils/formatters.ts';

const ClientsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  
  const { data: clientsResponse, isLoading } = useClientes({ search });
  const deleteClientMutation = useRemoverCliente();

  const clients = clientsResponse?.data || [];

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClientMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const columns = [
    {
      header: 'Nome',
      accessor: 'nome' as keyof Cliente,
    },
    {
      header: 'Email',
      accessor: (client: Cliente) => client.email || '-',
    },
    {
      header: 'Telefone',
      accessor: (client: Cliente) => client.telefone ? formatPhoneNumber(client.telefone) : '-',
    },
    {
      header: 'Documento',
      accessor: (client: Cliente) => {
        if (client.cpf_cnpj) {
          // Detecta se é CPF (11 dígitos) ou CNPJ (14 dígitos)
          const digits = client.cpf_cnpj.replace(/\D/g, '');
          if (digits.length === 11) return formatCPF(client.cpf_cnpj);
          if (digits.length === 14) return formatCNPJ(client.cpf_cnpj);
        }
        return '-';
      },
    },
    {
      header: 'Ações',
      accessor: (client: Cliente) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(client)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(client.id_cliente)}
            loading={deleteClientMutation.isPending}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar clientes..."
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
          data={clients}
          columns={columns}
          emptyMessage="Nenhum cliente encontrado"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <ClientForm
          client={editingClient}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;
