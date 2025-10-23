import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface ItemDevolucao {
  id_item_reserva: number;
  id_produto: number;
  nome_produto: string;
  quantidade_esperada: number;
  quantidade_devolvida: number;
  valor_unitario: number;
  quebrado: boolean;
  extraviado: number; // quantidade extraviada
  valor_multa: number;
}

interface FinalizarReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: any;
  itens: any[];
  onConfirm: (dadosFinalizacao: {
    itens: ItemDevolucao[];
    valor_multa_total: number;
    observacoes: string;
  }) => void;
  isLoading: boolean;
}

const FinalizarReservaModal: React.FC<FinalizarReservaModalProps> = ({
  isOpen,
  onClose,
  reserva,
  itens,
  onConfirm,
  isLoading
}) => {
  const [itensDevolucao, setItensDevolucao] = useState<ItemDevolucao[]>([]);
  const [observacoes, setObservacoes] = useState('');

  // Inicializar itens quando o modal abre
  useEffect(() => {
    if (isOpen && itens.length > 0) {
      const itensInit = itens.map(item => ({
        id_item_reserva: item.id_item_reserva,
        id_produto: item.id_produto,
        nome_produto: item.nome_produto || 'Produto não encontrado',
        quantidade_esperada: item.quantidade,
        quantidade_devolvida: item.quantidade,
        valor_unitario: item.valor_unitario,
        quebrado: false,
        extraviado: 0,
        valor_multa: 0
      }));
      setItensDevolucao(itensInit);
    }
  }, [isOpen, itens]);

  const atualizarItem = (id_item_reserva: number, campo: keyof ItemDevolucao, valor: any) => {
    setItensDevolucao(prev => prev.map(item => {
      if (item.id_item_reserva === id_item_reserva) {
        const updatedItem = { ...item, [campo]: valor };

        // Calcular multa por extravio (valor do item * quantidade extraviada)
        if (campo === 'extraviado' || campo === 'quebrado') {
          const quantidadeExtraviada = campo === 'extraviado' ? valor : item.extraviado;
          const isQuebrado = campo === 'quebrado' ? valor : item.quebrado;

          // Multa por extravio: 100% do valor do item por unidade extraviada
          // Multa por quebra: 50% do valor do item por unidade quebrada
          const multaExtravio = quantidadeExtraviada * item.valor_unitario;
          const multaQuebra = isQuebrado ? item.quantidade_esperada * item.valor_unitario * 0.5 : 0;

          updatedItem.valor_multa = multaExtravio + multaQuebra;
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const valorMultaTotal = itensDevolucao.reduce((total, item) => total + item.valor_multa, 0);
  const temMultas = valorMultaTotal > 0;

  const handleConfirm = () => {
    onConfirm({
      itens: itensDevolucao,
      valor_multa_total: valorMultaTotal,
      observacoes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Finalizar Reserva</h2>
            <p className="text-sm text-gray-600 mt-1">
              Verifique os itens devolvidos e reporte eventuais quebras ou extravios
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações da Reserva */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Reserva #{reserva?.id_reserva}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Cliente:</span> {reserva?.cliente_nome || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Valor Total:</span> R$ {Number(reserva?.valor_total || 0).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Itens */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Itens da Reserva</h3>
            <div className="space-y-4">
              {itensDevolucao.map((item) => (
                <div key={item.id_item_reserva} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{item.nome_produto}</h4>
                    <span className="text-sm text-gray-600">
                      Valor unitário: R$ {Number(item.valor_unitario).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Quantidade Esperada */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Esperada
                      </label>
                      <Input
                        type="number"
                        value={item.quantidade_esperada}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    {/* Quantidade Devolvida */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Devolvida
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantidade_esperada}
                        value={item.quantidade_devolvida}
                        onChange={(e) => atualizarItem(item.id_item_reserva, 'quantidade_devolvida', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Extraviado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extraviado
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantidade_esperada}
                        value={item.extraviado}
                        onChange={(e) => atualizarItem(item.id_item_reserva, 'extraviado', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Quebrado */}
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.quebrado}
                        onChange={(e) => atualizarItem(item.id_item_reserva, 'quebrado', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Item quebrado/danificado</span>
                    </label>
                  </div>

                  {/* Valor da Multa */}
                  {item.valor_multa > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-800">
                          Multa: R$ {item.valor_multa.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Adicione observações sobre a devolução..."
            />
          </div>

          {/* Resumo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Resumo da Finalização</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Valor da Reserva:</span>
                <span>R$ {Number(reserva?.valor_total || 0).toFixed(2).replace('.', ',')}</span>
              </div>
              {valorMultaTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Multas por quebra/extravio:</span>
                  <span>R$ {valorMultaTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>Status Final:</span>
                <span className={temMultas ? 'text-orange-600' : 'text-green-600'}>
                  {temMultas ? 'Aguardando Quitar' : 'Concluída'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {temMultas ? 'Finalizar com Multas' : 'Finalizar Reserva'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalizarReservaModal;