import React, { useState } from 'react';
import { useReservas } from '../hooks/useReservas';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ReservaForm from '../components/ReservaForm';

const ReservasPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pendente' | 'aprovado' | 'cancelado' | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);

  // Buscar reservas
  const { data: reservasData, isLoading: isLoadingReservas, error, refetch } = useReservas({
    search,
    ...(statusFilter ? { status: statusFilter } : {})
  });
  
  // Buscar dados de apoio
  const { data: clientesData } = useClientes();
  const { data: locaisData } = useLocais();

  const reservas = reservasData?.data || [];
  const clientes = clientesData?.data || [];
  const locais = locaisData?.data || [];

  // Create maps for lookups
  const clientesMap = new Map(clientes.map(c => [c.id_cliente, c]));
  const locaisMap = new Map(locais.map(l => [l.id_local, l]));

  const handleNewReserva = () => {
    setSelectedReserva(null);
    setShowForm(true);
  };

  const handleEditReserva = (reserva: any) => {
    setSelectedReserva(reserva);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedReserva(null);
    refetch();
  };

  if (isLoadingReservas) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-800">Erro ao carregar reservas: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <Button onClick={handleNewReserva}>
          Nova Reserva
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar reservas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedReserva ? 'Editar Reserva' : 'Nova Reserva'}
            </h2>
            <ReservaForm
              reserva={selectedReserva}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Reservas List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Lista de Reservas</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reservas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500">Nenhuma reserva encontrada</div>
            </div>
          ) : (
            reservas.map((reserva) => {
              const cliente = clientesMap.get(reserva.id_cliente || 0);
              const local = locaisMap.get(reserva.id_local || 0);
              
              return (
                <div key={reserva.id_reserva} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Reserva #{reserva.id_reserva}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cliente: {cliente?.nome || 'Cliente não encontrado'}
                      </div>
                      {local && (
                        <div className="text-sm text-gray-500">
                          Local: {local.nome}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Data Evento: {reserva.data_evento ? new Date(reserva.data_evento).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Data Retirada: {reserva.data_retirada ? new Date(reserva.data_retirada).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Data Devolução: {reserva.data_devolucao ? new Date(reserva.data_devolucao).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valor: R$ {reserva.valor_total?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: <span className={`px-2 py-1 rounded-full text-xs ${
                          reserva.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          reserva.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          reserva.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reserva.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditReserva(reserva)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservasPage;