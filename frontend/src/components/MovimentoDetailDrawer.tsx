import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Movimento } from '../types/api';
import { formatDateTime } from '../utils/formatters';

interface MovimentoDetailDrawerProps {
  movimento: Movimento | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovimentoDetailDrawer: React.FC<MovimentoDetailDrawerProps> = ({
  movimento,
  isOpen,
  onClose
}) => {
  if (!movimento) return null;

  const getTipoEventoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      saida: 'Saída',
      reserva: 'Reserva',
      devolucao: 'Devolução',
      perda: 'Perda',
      ajuste: 'Ajuste'
    };
    return labels[tipo] || tipo;
  };

  const getTipoEventoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      entrada: 'bg-green-100 text-green-800',
      saida: 'bg-red-100 text-red-800',
      reserva: 'bg-blue-100 text-blue-800',
      devolucao: 'bg-yellow-100 text-yellow-800',
      perda: 'bg-gray-100 text-gray-800',
      ajuste: 'bg-purple-100 text-purple-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Detalhes do Movimento
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* ID e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID</label>
                  <p className="text-sm text-gray-900">#{movimento.id_evento}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data</label>
                  <p className="text-sm text-gray-900">{formatDateTime(movimento.data_evento)}</p>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tipo</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoEventoColor(movimento.tipo_evento)}`}>
                  {getTipoEventoLabel(movimento.tipo_evento)}
                </span>
              </div>

              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-500">Produto</label>
                <p className="text-sm text-gray-900">
                  {movimento.produto_nome || `Produto #${movimento.id_produto}`}
                </p>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-500">Quantidade</label>
                <p className="text-sm text-gray-900">{movimento.quantidade}</p>
              </div>

              {/* Reserva */}
              {movimento.reserva_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reserva</label>
                  <p className="text-sm text-gray-900">#{movimento.reserva_id}</p>
                </div>
              )}

              {/* Responsável */}
              {movimento.responsavel && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Responsável</label>
                  <p className="text-sm text-gray-900">{movimento.responsavel}</p>
                </div>
              )}

              {/* Observação */}
              {movimento.observacao && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Observação</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{movimento.observacao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovimentoDetailDrawer;