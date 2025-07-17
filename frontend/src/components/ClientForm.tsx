import React, { useState, useEffect } from 'react';
import { useCriarCliente, useAtualizarCliente } from '../hooks/useClientes.ts';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import { Cliente } from '../types/api';

interface ClientFormProps {
  client?: Cliente | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf_cnpj: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCriarCliente();
  const updateMutation = useAtualizarCliente();

  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome || '',
        telefone: client.telefone || '',
        email: client.email || '',
        cpf_cnpj: client.cpf_cnpj || ''
      });
    }
  }, [client]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // eslint-disable-next-line no-useless-escape
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const digits = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digits.length >= 10;
  };

  const validateCPFCNPJ = (document: string) => {
    const digits = document.replace(/\D/g, '');
    return digits.length === 11 || digits.length === 14;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (formData.cpf_cnpj && !validateCPFCNPJ(formData.cpf_cnpj)) {
      newErrors.cpf_cnpj = 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email.trim(),
      cpf_cnpj: formData.cpf_cnpj.trim() || undefined
    };

    try {
      if (isEditing && client) {
        await updateMutation.mutateAsync({
          id: client.id_cliente,
          dados: submitData
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatCPFCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome Completo *
        </label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: João da Silva"
          error={errors.nome}
          className="mb-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <Input
            id="telefone"
            type="text"
            value={formData.telefone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              handleChange('telefone', formatted);
            }}
            placeholder="(11) 99999-9999"
            error={errors.telefone}
            className="mb-0"
            maxLength={15}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="joao@email.com"
            error={errors.email}
            className="mb-0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cpf_cnpj" className="block text-sm font-medium text-gray-700 mb-1">
          CPF/CNPJ
        </label>
        <Input
          id="cpf_cnpj"
          type="text"
          value={formData.cpf_cnpj}
          onChange={(e) => {
            const formatted = formatCPFCNPJ(e.target.value);
            handleChange('cpf_cnpj', formatted);
          }}
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          error={errors.cpf_cnpj}
          className="mb-0"
          maxLength={18}
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
          {isEditing ? 'Atualizar Cliente' : 'Criar Cliente'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
