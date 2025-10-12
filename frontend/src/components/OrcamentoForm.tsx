import React, { useState, useEffect } from 'react';
import type { Reserva, CriarReservaRequest, AtualizarReservaRequest, Cliente, Local } from '../types/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from './ui/Textarea';
import { useClientes } from '../hooks/useClientes';
import ReservaService from '../services/reservaService';

interface OrcamentoFormProps {
  orcamento?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
  locais: Local[];
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

const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ 
  orcamento, 
  onSuccess, 
  onCancel, 
  locais 
}) => {
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

  // Hooks para dados
  const { data: clientesData } = useClientes();
  const clientes: Cliente[] = clientesData?.data || [];

  // Update form data when orcamento prop changes
  useEffect(() => {
    if (orcamento) {
      setFormData({
        id_cliente: orcamento.id_cliente || 0,
        id_local: orcamento.id_local || undefined,
        data_evento: orcamento.data_evento?.split('T')[0] || '',
        data_retirada: orcamento.data_retirada?.split('T')[0] || '',
        data_devolucao: orcamento.data_devolucao?.split('T')[0] || '',
        valor_total: orcamento.valor_total?.toString() || '',
        observacoes: orcamento.observacoes || ''
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
  }, [orcamento]);

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
      if (orcamento) {
        // Atualizar orçamento existente
        const updateData: AtualizarReservaRequest = {
          id_cliente: formData.id_cliente,
          id_local: formData.id_local,
          data_evento: formData.data_evento,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          valor_total: parseFloat(formData.valor_total),
          observacoes: formData.observacoes || ''
        };
        
        await ReservaService.atualizarReserva(orcamento.id_reserva, updateData);
      } else {
        // Criar novo orçamento
        const novoOrcamento: CriarReservaRequest = {
          id_cliente: formData.id_cliente,
          id_local: formData.id_local,
          data_evento: formData.data_evento,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          valor_total: parseFloat(formData.valor_total),
          observacoes: formData.observacoes || ''
        };
        
        await ReservaService.criarReserva(novoOrcamento);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="id_cliente" className="block text-sm font-medium text-gray-700">
          Cliente *
        </label>
        <select
          id="id_cliente"
          name="id_cliente"
          value={formData.id_cliente}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value={0}>Selecione um cliente</option>
          {clientes.map(cliente => (
            <option key={cliente.id_cliente} value={cliente.id_cliente}>
              {cliente.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="id_local" className="block text-sm font-medium text-gray-700">
          Local
        </label>
        <select
          id="id_local"
          name="id_local"
          value={formData.id_local || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Selecione um local</option>
          {locais.map(local => (
            <option key={local.id_local} value={local.id_local}>
              {local.nome}
            </option>
          ))}
        </select>
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
          {orcamento ? 'Atualizar Orçamento' : 'Criar Orçamento'}
        </Button>
      </div>
    </form>
  );
};

export default OrcamentoForm;