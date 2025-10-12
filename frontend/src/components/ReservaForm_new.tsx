import React, { useState, useEffect } from 'react';
import type { Reserva, CriarReservaRequest, AtualizarReservaRequest } from '../types/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from './ui/Textarea';
import ReservaService from '../services/reservaService';

interface ReservaFormProps {
  reserva?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
}

// Type for the form data 
type FormData = {
  id_cliente: number;
  id_local?: number;
  data_evento: string;
  data_retirada: string;
  data_devolucao: string;
  valor_total: string; // string no form, será convertido para number
  observacoes: string;
};

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onSuccess, onCancel }) => {
  // Initialize form data with default values
  const initialFormData: FormData = {
    id_cliente: 0,
    id_local: undefined,
    data_evento: '',
    data_retirada: '',
    data_devolucao: '',
    valor_total: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when reserva prop changes
  useEffect(() => {
    if (reserva) {
      setFormData({
        id_cliente: reserva.id_cliente || 0,
        id_local: reserva.id_local || undefined,
        data_evento: reserva.data_evento?.split('T')[0] || '',
        data_retirada: reserva.data_retirada?.split('T')[0] || '',
        data_devolucao: reserva.data_devolucao?.split('T')[0] || '',
        valor_total: reserva.valor_total?.toString() || '',
        observacoes: reserva.observacoes || ''
      });
    } else {
      setFormData({
        id_cliente: 0,
        id_local: undefined,
        data_evento: '',
        data_retirada: '',
        data_devolucao: '',
        valor_total: '',
        observacoes: ''
      });
    }
  }, [reserva]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (reserva) {
        // Atualizar reserva existente
        const updateData: AtualizarReservaRequest = {
          id_cliente: formData.id_cliente,
          id_local: formData.id_local,
          data_evento: formData.data_evento,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          valor_total: parseFloat(formData.valor_total),
          observacoes: formData.observacoes || ''
        };
        
        await ReservaService.atualizarReserva(reserva.id_reserva, updateData);
      } else {
        // Criar nova reserva
        const novaReserva: CriarReservaRequest = {
          id_cliente: formData.id_cliente,
          id_local: formData.id_local,
          data_evento: formData.data_evento,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          valor_total: parseFloat(formData.valor_total),
          observacoes: formData.observacoes || ''
        };
        
        await ReservaService.criarReserva(novaReserva);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="id_cliente" className="block text-sm font-medium text-gray-700">
          ID Cliente *
        </label>
        <Input
          id="id_cliente"
          name="id_cliente"
          type="number"
          value={formData.id_cliente}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="id_local" className="block text-sm font-medium text-gray-700">
          ID Local
        </label>
        <Input
          id="id_local"
          name="id_local"
          type="number"
          value={formData.id_local || ''}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="data_evento" className="block text-sm font-medium text-gray-700">
          Data do Evento *
        </label>
        <Input
          id="data_evento"
          name="data_evento"
          type="date"
          value={formData.data_evento}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="data_retirada" className="block text-sm font-medium text-gray-700">
          Data de Retirada *
        </label>
        <Input
          id="data_retirada"
          name="data_retirada"
          type="date"
          value={formData.data_retirada}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="data_devolucao" className="block text-sm font-medium text-gray-700">
          Data de Devolução *
        </label>
        <Input
          id="data_devolucao"
          name="data_devolucao"
          type="date"
          value={formData.data_devolucao}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="valor_total" className="block text-sm font-medium text-gray-700">
          Valor Total *
        </label>
        <Input
          id="valor_total"
          name="valor_total"
          type="number"
          step="0.01"
          value={formData.valor_total}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <Textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {reserva ? 'Atualizar Reserva' : 'Criar Reserva'}
        </Button>
      </div>
    </form>
  );
};

export default ReservaForm;