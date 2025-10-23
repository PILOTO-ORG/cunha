import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import ReservaForm from '../components/ReservaForm';
import ReservaService from '../services/reservaService';
import {
  ArrowLeftIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ReservaEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Buscar reserva
  const { data: reserva, isLoading, error, refetch } = useQuery({
    queryKey: ['reserva', id],
    queryFn: () => ReservaService.buscarReserva(Number(id)),
    enabled: !!id
  });

  const handleCancelReserva = async () => {
    if (!id) return;

    try {
      await ReservaService.atualizarStatus(Number(id), 'Cancelado');
      navigate('/');
    } catch (error) {
      alert('Erro ao cancelar reserva.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Carregando reserva...</p>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Erro ao carregar reserva</h3>
              <p className="text-red-600 mt-1">
                {error?.message || 'Reserva não encontrada'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reservas')}
            className="flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Reserva #{reserva.id_reserva}</h1>
        </div>

        {/* Botão de Cancelar Reserva */}
        {(reserva.status as any) !== 'Cancelado' && (
          <Button
            variant="outline"
            onClick={() => setShowCancelConfirm(true)}
            className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Cancelar Reserva
          </Button>
        )}
      </div>

      {/* Status da Reserva */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Status atual:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            (reserva as any).status === 'Confirmado' ? 'bg-green-100 text-green-800 border border-green-200' :
            (reserva as any).status === 'Preparado' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            (reserva as any).status === 'Enviado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
            (reserva as any).status === 'Locado' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
            (reserva as any).status === 'Devolvido' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
            (reserva as any).status === 'Faturado' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
            (reserva as any).status === 'Encerrado' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
            (reserva as any).status === 'Cancelado' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {reserva.status || 'N/A'}
          </span>
        </div>
      </div>

      {/* Formulário de Edição */}
      <ReservaForm
        reserva={reserva}
        onSuccess={() => {
          refetch();
          navigate(-1); // Volta para a página anterior
        }}
        onCancel={() => navigate(-1)} // Volta para a página anterior
      />

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Cancelar Reserva</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Manter Reserva
              </Button>
              <Button
                onClick={handleCancelReserva}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Cancelar Reserva
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaEditPage;