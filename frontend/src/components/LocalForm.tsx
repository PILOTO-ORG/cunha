import React, { useState, useEffect } from 'react';
import { useCriarLocal, useAtualizarLocal } from '../hooks/useLocais';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
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
    nome: '',
    endereco: '',
    capacidade: '',
    valor_locacao: '',
    observacoes: ''
  } as {
    nome: string;
    endereco: string;
    capacidade: string;
    valor_locacao: string;
    observacoes: string;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form with local data if editing
  useEffect(() => {
    if (local) {
      setFormData({
        nome: local.nome || '',
        endereco: local.endereco || '',
        capacidade: local.capacidade?.toString() || '',
        valor_locacao: local.valor_locacao?.toString() || '',
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
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    }
    
    if (!formData.capacidade || parseInt(formData.capacidade) <= 0) {
      newErrors.capacidade = 'A capacidade deve ser maior que zero';
    }
    
    if (!formData.valor_locacao || parseFloat(formData.valor_locacao) <= 0) {
      newErrors.valor_locacao = 'O valor de locação deve ser maior que zero';
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
      const { capacidade, valor_locacao, ...restData } = formData;
      const localData: CriarLocalRequest = {
        ...restData,
        capacidade: capacidade ? parseInt(capacidade, 10) : 0,
        valor_locacao: valor_locacao ? parseFloat(valor_locacao) : 0
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <Input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Ex: Salão de Festas Principal"
            error={errors.nome}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacidade" className="block text-sm font-medium text-gray-700 mb-1">
              Capacidade <span className="text-red-500">*</span>
            </label>
            <Input
              id="capacidade"
              type="number"
              value={formData.capacidade}
              onChange={(e) => handleChange('capacidade', e.target.value)}
              placeholder="Ex: 100"
              error={errors.capacidade}
            />
          </div>
          
          <div>
            <label htmlFor="valor_locacao" className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Locação <span className="text-red-500">*</span>
            </label>
            <Input
              id="valor_locacao"
              type="number"
              step="0.01"
              value={formData.valor_locacao}
              onChange={(e) => handleChange('valor_locacao', e.target.value)}
              placeholder="Ex: 500.00"
              error={errors.valor_locacao}
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