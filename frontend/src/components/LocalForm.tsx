import React, { useState, useEffect } from 'react';
import { useCriarLocal, useAtualizarLocal } from '../hooks/useLocais.ts';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import type { Option } from '../types/select.ts';
import type { Local, CriarLocalRequest, AtualizarLocalRequest } from '../types/api';
import { toast } from 'react-hot-toast';

interface LocalFormProps {
  local?: Local;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LocalForm: React.FC<LocalFormProps> = ({ local, onSuccess, onCancel }) => {
  const isEditing = !!local;
  
  // Form state with proper types for form handling
  const [formData, setFormData] = useState({
    descricao: '',
    tipo: '',
    endereco: '',
    capacidade: '',
    observacoes: ''
  } as {
    descricao: string;
    tipo: string;
    endereco: string;
    capacidade: string;
    observacoes: string;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form with local data if editing
  useEffect(() => {
    if (local) {
      setFormData({
        descricao: local.descricao || '',
        tipo: local.tipo || '',
        endereco: local.endereco || '',
        capacidade: local.capacidade?.toString() || '',
        observacoes: local.observacoes || ''
      });
    }
  }, [local]);
  
  // API mutations
  const criarLocal = useCriarLocal();
  const atualizarLocal = useAtualizarLocal();
  const isSaving = criarLocal.isPending || atualizarLocal.isPending;
  
  // Handle form field changes
  const handleChange = (
    field: keyof typeof formData, 
    value: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const newValue = typeof value === 'string' ? value : value.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'A descrição é obrigatória';
    }
    
    if (!formData.tipo) {
      newErrors.tipo = 'O tipo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const { capacidade, ...restData } = formData;
      const localData: CriarLocalRequest = {
        ...restData,
        capacidade: capacidade ? parseInt(capacidade, 10) : undefined
      };
      
      if (isEditing && local) {
        const updateData: AtualizarLocalRequest = { ...localData };
        await atualizarLocal.mutateAsync({
          id: local.id_local,
          dados: updateData
        });
        toast.success('Local atualizado com sucesso!');
      } else {
        await criarLocal.mutateAsync(localData);
        toast.success('Local criado com sucesso!');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      toast.error('Ocorreu um erro ao salvar o local. Tente novamente.');
    }
  };
  
  // Local types for the select input
  const tiposLocal = [
    { value: 'salao', label: 'Salão de Festas' },
    { value: 'quadra', label: 'Quadra Esportiva' },
    { value: 'churrasqueira', label: 'Churrasqueira' },
    { value: 'sala_reuniao', label: 'Sala de Reunião' },
    { value: 'outro', label: 'Outro' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <Input
            id="descricao"
            type="text"
            value={formData.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Ex: Salão de Festas Principal"
            error={errors.descricao}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Selecione um tipo</option>
              {tiposLocal.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>}
          </div>
          
          <div>
            <label htmlFor="capacidade" className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade (pessoas)
            </label>
            <Input
              id="capacidade"
              type="number"
              min="1"
              value={formData.capacidade}
              onChange={(e) => handleChange('capacidade', e.target.value)}
              placeholder="Ex: 100"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <Input
            id="endereco"
            type="text"
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            placeholder="Endereço completo do local"
          />
        </div>
        
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            id="observacoes"
            rows={3}
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Informações adicionais sobre o local"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isSaving}
        >
          {isEditing ? 'Atualizar Local' : 'Criar Local'}
        </Button>
      </div>
    </form>
  );
};

export default LocalForm;