import React, { useState, useEffect } from 'react';
import type { Reserva, CriarReservaRequest, AtualizarReservaRequest } from '../types/api';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import Textarea from './ui/Textarea.tsx';
import ReservaService from '../services/reservaService.ts';

interface ReservaFormProps {
  reserva?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
}

// Type for the form data that includes all fields we need in the form
type FormData = Omit<CriarReservaRequest, 'id_cliente' | 'id_produto' | 'quantidade' | 'data_inicio' | 'data_fim'> & {
  // Make required fields optional for the form
  id_cliente?: number;
  id_produto?: number;
  quantidade?: number;
  data_inicio?: string;
  data_fim?: string;
  // Add any additional form fields
  observacoes?: string;
  link_drive?: string;
  frete?: number;
  desconto?: number;
  data_saida?: string;
  data_retorno?: string;
  dias_reservados?: number;
  status?: 'iniciada' | 'ativa' | 'concluída' | 'cancelada';
};

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onSuccess, onCancel }) => {
  // Initialize form data with default values
  const initialFormData: FormData = {
    id_cliente: undefined,
    id_local: undefined,
    id_produto: undefined,
    quantidade: 1,
    data_inicio: '',
    data_fim: '',
    status: 'iniciada',
    observacoes: '',
    link_drive: '',
    frete: 0,
    desconto: 0,
    data_saida: '',
    data_retorno: '',
    dias_reservados: 1
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when reserva prop changes
  useEffect(() => {
    if (reserva) {
      setFormData({
        id_cliente: reserva.id_cliente || undefined,
        id_local: reserva.id_local || undefined,
        id_produto: reserva.id_produto,
        quantidade: reserva.quantidade || 1,
        data_inicio: reserva.data_inicio?.split('T')[0] || '',
        data_fim: reserva.data_fim?.split('T')[0] || '',
        status: (reserva.status === 'iniciada' || reserva.status === 'ativa' || reserva.status === 'concluída' || reserva.status === 'cancelada') ? reserva.status : 'iniciada',
        observacoes: reserva.observacoes || '',
        link_drive: reserva.link_drive || '',
        frete: reserva.frete ? Number(reserva.frete) : 0,
        desconto: reserva.desconto ? Number(reserva.desconto) : 0,
        data_saida: reserva.data_saida?.split('T')[0] || '',
        data_retorno: reserva.data_retorno?.split('T')[0] || '',
        dias_reservados: reserva.dias_reservados || 1
      });
    } else {
      setFormData(initialFormData);
    }
  }, [reserva]);

  useEffect(() => {
    if (reserva) {
      console.log('Reserva data received in ReservaForm:', reserva);
      const formData = {
        id_cliente: reserva.id_cliente ?? 0,
        id_local: reserva.id_local ?? undefined,
        id_produto: reserva.id_produto ?? 0,
        data_inicio: reserva.data_inicio?.split('T')[0] ?? '',
        data_fim: reserva.data_fim?.split('T')[0] ?? '',
        status: (reserva.status === 'iniciada' || reserva.status === 'ativa' || reserva.status === 'concluída' || reserva.status === 'cancelada') ? reserva.status : 'iniciada',
        quantidade: reserva.quantidade,
        observacoes: reserva.observacoes || '',
        link_drive: reserva.link_drive || '',
        frete: reserva.frete ?? 0,
        desconto: reserva.desconto ?? 0,
        data_saida: reserva.data_saida?.split('T')[0] ?? '',
        data_retorno: reserva.data_retorno?.split('T')[0] ?? '',
        dias_reservados: reserva.dias_reservados ?? 1,
      };
      console.log('Form data being set:', formData);
      setFormData(formData);
    }
  }, [reserva]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    console.log(`Field changed - ${name}:`, value);
    
    setFormData((prev) => {
      const newValue = (() => {
        // Special handling for number inputs to avoid setting 0 for empty values
        if (type === 'number') {
          // For id_local, we want to allow null/undefined but not 0
          if (name === 'id_local') {
            return value === '' ? undefined : Number(value) || undefined;
          }
          // For other number fields, we can use 0 as a valid value
          return value === '' ? 0 : Number(value);
        }
        return value;
      })();
      
      const newFormData = {
        ...prev,
        [name]: newValue
      };
      
      console.log('Form data after change:', newFormData);
      return newFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate required fields
    if (!formData.id_cliente || !formData.id_produto || !formData.quantidade || !formData.data_inicio || !formData.data_fim) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Form data on submit:', formData);
      
      if (reserva) {
        // Atualizar reserva existente
        console.log('Updating existing reservation with ID:', reserva.id_item_reserva);
        
        // Prepare update data according to AtualizarReservaRequest type
        const updateData: AtualizarReservaRequest = {
          id_cliente: formData.id_cliente,
          id_local: formData.id_local || undefined,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          status: formData.status || 'iniciada',
          quantidade: formData.quantidade,
          observacoes: formData.observacoes || '',
          link_drive: formData.link_drive || '',
          frete: formData.frete || 0,
          desconto: formData.desconto || 0,
          data_saida: formData.data_saida || undefined,
          data_retorno: formData.data_retorno || undefined,
          dias_reservados: formData.dias_reservados || 1
        };
        
        console.log('Sending update request with data:', updateData);
        const updatedReserva = await ReservaService.atualizarReserva(reserva.id_item_reserva, updateData);
        console.log('Update successful, response:', updatedReserva);
      } else {
        // Criar nova reserva
        console.log('Creating new reservation with data:', formData);
        
        // Prepare create data according to CriarReservaRequest type
        const createData: CriarReservaRequest = {
          id_cliente: formData.id_cliente!,
          id_local: formData.id_local || undefined,
          id_produto: formData.id_produto!,
          quantidade: formData.quantidade!,
          data_inicio: formData.data_inicio!,
          data_fim: formData.data_fim!,
          status: formData.status || 'iniciada',
          observacoes: formData.observacoes || '',
          link_drive: formData.link_drive || '',
          frete: formData.frete || 0,
          desconto: formData.desconto || 0,
          data_saida: formData.data_saida || undefined,
          data_retorno: formData.data_retorno || undefined,
          dias_reservados: formData.dias_reservados || 1
        };
        
        const newReserva = await ReservaService.criarReserva(createData);
        console.log('Create successful, response:', newReserva);
      }
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao salvar reserva.';
      console.error('Error details:', { 
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack 
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Cliente (ID)</label>
          <Input name="id_cliente" type="number" value={formData.id_cliente} onChange={handleChange} min={1} required />
        </div>
        <div>
          <label className="block font-medium">Local (ID, opcional)</label>
          <Input name="id_local" type="number" value={formData.id_local || ''} onChange={handleChange} min={0} />
        </div>
      </div>
      <div>
        <label className="block font-medium">Produto (ID)</label>
        <Input name="id_produto" type="number" value={formData.id_produto} onChange={handleChange} min={1} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="iniciada">Iniciada (Orçamento)</option>
            <option value="ativa">Ativa</option>
            <option value="concluída">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Quantidade</label>
          <Input type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} min={1} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Data Início</label>
          <Input type="datetime-local" name="data_inicio" value={formData.data_inicio} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-medium">Data Fim</label>
          <Input type="datetime-local" name="data_fim" value={formData.data_fim} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Frete (R$)</label>
          <Input type="number" name="frete" value={formData.frete} onChange={handleChange} min={0} step="0.01" />
        </div>
        <div>
          <label className="block font-medium">Desconto (R$)</label>
          <Input type="number" name="desconto" value={formData.desconto} onChange={handleChange} min={0} step="0.01" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Data de Saída</label>
          <Input type="datetime-local" name="data_saida" value={formData.data_saida} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-medium">Data de Retorno</label>
          <Input type="datetime-local" name="data_retorno" value={formData.data_retorno} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Dias Reservados</label>
          <Input type="number" name="dias_reservados" value={formData.dias_reservados} onChange={handleChange} min={1} />
        </div>
        <div>
          <label className="block font-medium">Link do Drive</label>
          <Input type="url" name="link_drive" value={formData.link_drive || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
        </div>
      </div>
      <div>
        <label className="block font-medium">Observações</label>
        <Textarea
          name="observacoes"
          value={formData.observacoes || ''}
          onChange={handleChange}
          rows={3}
          placeholder="Detalhes adicionais sobre a reserva..."
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Salvar</Button>
      </div>
    </form>
  );
};

export default ReservaForm;
