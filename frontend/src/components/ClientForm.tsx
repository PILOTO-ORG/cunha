import React, { useEffect, useState } from 'react';
import { useCriarCliente, useAtualizarCliente } from '../hooks/useClientes';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Cliente, AtualizarClienteRequest, CriarClienteRequest } from '../types/api';
import { toast } from 'react-hot-toast';
import { buscarEnderecoPorCep } from '../services/cepService';

interface ClientFormProps {
  client?: Cliente | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormData = {
  nome: string;
  telefone: string;
  email: string;
  cpf_cnpj: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  endereco_completo: string;
  forma_pagamento: string;
  observacoes: string;
};

const initialFormData: FormData = {
  nome: '',
  telefone: '',
  email: '',
  cpf_cnpj: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: '',
  endereco_completo: '',
  forma_pagamento: '',
  observacoes: ''
};

const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

const formatCep = (value: string) => {
  const digits = sanitizeDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatPhone = (value: string) => {
  const digits = sanitizeDigits(value);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, d1, d2, d3) => {
      if (!d3) return `(${d1}) ${d2}`;
      return `(${d1}) ${d2}-${d3}`;
    });
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, (_, d1, d2, d3) => {
    if (!d3) return `(${d1}) ${d2}`;
    return `(${d1}) ${d2}-${d3}`;
  });
};

const formatCPFCNPJ = (value: string) => {
  const digits = sanitizeDigits(value);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{2})$/, '$1-$2');
};

const buildEnderecoCompleto = (data: Pick<FormData, 'rua' | 'numero' | 'bairro' | 'cidade' | 'estado' | 'complemento'>) => {
  const linha1 = [data.rua, data.numero].filter(Boolean).join(', ');
  const linha2 = [data.bairro, data.cidade, data.estado].filter(Boolean).join(' - ');
  const base = [linha1, linha2].filter(Boolean).join(' · ');
  if (!base) return data.complemento || '';
  return data.complemento ? `${base} (${data.complemento})` : base;
};

const removeUndefined = <T extends Record<string, any>>(obj: T): T => {
  const cleaned: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned as T;
};

const ClientForm: React.FC<ClientFormProps> = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const createMutation = useCriarCliente();
  const updateMutation = useAtualizarCliente();

  const isEditing = !!client;

  useEffect(() => {
    if (client) {
      setFormData({
        nome: client.nome || '',
        telefone: client.telefone || '',
        email: client.email || '',
        cpf_cnpj: client.cpf_cnpj || '',
        cep: client.cep ? formatCep(client.cep) : '',
        rua: client.rua || '',
        numero: client.numero || '',
        bairro: client.bairro || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        complemento: client.complemento || '',
        endereco_completo: client.endereco_completo || client.endereco || '',
        forma_pagamento: client.forma_pagamento || '',
        observacoes: client.observacoes || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [client]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const digits = sanitizeDigits(phone);
    return digits.length >= 10;
  };

  const validateCep = (cep: string) => sanitizeDigits(cep).length === 8;

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
      newErrors.email = 'Informe um email válido';
    }

    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!validateCep(formData.cep)) {
      newErrors.cep = 'CEP deve conter 8 dígitos';
    }

    if (!formData.rua.trim()) {
      newErrors.rua = 'Rua é obrigatória';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    } else if (formData.estado.trim().length !== 2) {
      newErrors.estado = 'Informe a UF com 2 letras';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCepLookup = async () => {
    const digits = sanitizeDigits(formData.cep);
    if (digits.length !== 8) {
      if (digits.length > 0) {
        setErrors((prev) => ({ ...prev, cep: 'CEP deve conter 8 dígitos' }));
      }
      return;
    }

    try {
      setIsFetchingCep(true);
      const data = await buscarEnderecoPorCep(digits);
      setFormData((prev) => {
        const rua = data.logradouro || prev.rua;
        const bairro = data.bairro || prev.bairro;
        const cidade = data.localidade || prev.cidade;
        const estado = data.uf || prev.estado;
        const complemento = data.complemento || prev.complemento;

        return {
          ...prev,
          cep: formatCep(digits),
          rua,
          bairro,
          cidade,
          estado,
          complemento,
          endereco_completo: prev.endereco_completo || buildEnderecoCompleto({
            rua,
            numero: prev.numero,
            bairro,
            cidade,
            estado,
            complemento
          })
        };
      });
      toast.success('Endereço preenchido a partir do CEP');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível buscar o CEP informado');
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const enderecoCompleto = formData.endereco_completo.trim()
      || buildEnderecoCompleto({
        rua: formData.rua.trim(),
        numero: formData.numero.trim(),
        bairro: formData.bairro.trim(),
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim().toUpperCase(),
        complemento: formData.complemento.trim()
      })
      || undefined;

    const basePayload = removeUndefined<CriarClienteRequest>({
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim() || undefined,
      email: formData.email.trim() || undefined,
      cpf_cnpj: formData.cpf_cnpj ? sanitizeDigits(formData.cpf_cnpj) : undefined,
      cep: sanitizeDigits(formData.cep) || undefined,
      rua: formData.rua.trim() || undefined,
      numero: formData.numero.trim() || undefined,
      bairro: formData.bairro.trim() || undefined,
      cidade: formData.cidade.trim() || undefined,
      estado: formData.estado.trim().toUpperCase() || undefined,
      complemento: formData.complemento.trim() || undefined,
      endereco_completo: enderecoCompleto,
      forma_pagamento: formData.forma_pagamento.trim() || undefined,
      observacoes: formData.observacoes.trim() || undefined
    } as CriarClienteRequest);

    try {
      if (isEditing && client) {
        const updatePayload: AtualizarClienteRequest = basePayload;
        await updateMutation.mutateAsync({
          id: client.id_cliente,
          dados: updatePayload
        });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(basePayload);
        toast.success('Cliente criado com sucesso!');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente. Por favor, tente novamente.');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome Completo *"
        value={formData.nome}
        onChange={(event) => handleFieldChange('nome', event.target.value)}
        placeholder="Ex: João da Silva"
        error={errors.nome}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefone *"
          value={formData.telefone}
          onChange={(event) => handleFieldChange('telefone', formatPhone(event.target.value))}
          placeholder="(11) 99999-9999"
          error={errors.telefone}
          maxLength={15}
        />
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(event) => handleFieldChange('email', event.target.value)}
          placeholder="joao@email.com"
          error={errors.email}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="CPF/CNPJ"
          value={formData.cpf_cnpj}
          onChange={(event) => handleFieldChange('cpf_cnpj', formatCPFCNPJ(event.target.value))}
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          maxLength={18}
          error={errors.cpf_cnpj}
        />
        <Input
          label="Forma de pagamento preferida"
          value={formData.forma_pagamento}
          onChange={(event) => handleFieldChange('forma_pagamento', event.target.value)}
          placeholder="Ex: PIX, Cartão, Boleto..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-3">
          <Input
            label="CEP *"
            value={formData.cep}
            onChange={(event) => handleFieldChange('cep', formatCep(event.target.value))}
            placeholder="00000-000"
            error={errors.cep}
            onBlur={handleCepLookup}
            maxLength={9}
          />
        </div>
        <div className="md:col-span-1 mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCepLookup}
            disabled={isFetchingCep || sanitizeDigits(formData.cep).length !== 8}
            className="w-full"
          >
            {isFetchingCep ? 'Buscando...' : 'Buscar CEP'}
          </Button>
        </div>
      </div>

      <Input
        label="Endereço completo"
        value={formData.endereco_completo}
        onChange={(event) => handleFieldChange('endereco_completo', event.target.value)}
        placeholder="Rua, número, bairro, cidade - UF"
        helperText="Preenchido automaticamente, mas você pode ajustar se necessário"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rua *"
          value={formData.rua}
          onChange={(event) => handleFieldChange('rua', event.target.value)}
          error={errors.rua}
        />
        <Input
          label="Número *"
          value={formData.numero}
          onChange={(event) => handleFieldChange('numero', event.target.value)}
          error={errors.numero}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Bairro *"
          value={formData.bairro}
          onChange={(event) => handleFieldChange('bairro', event.target.value)}
          error={errors.bairro}
        />
        <Input
          label="Cidade *"
          value={formData.cidade}
          onChange={(event) => handleFieldChange('cidade', event.target.value)}
          error={errors.cidade}
        />
        <Input
          label="Estado (UF) *"
          value={formData.estado}
          onChange={(event) => handleFieldChange('estado', event.target.value.toUpperCase().slice(0, 2))}
          maxLength={2}
          error={errors.estado}
        />
      </div>

      <Input
        label="Complemento"
        value={formData.complemento}
        onChange={(event) => handleFieldChange('complemento', event.target.value)}
        placeholder="Apartamento, bloco, ponto de referência..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          value={formData.observacoes}
          onChange={(event) => handleFieldChange('observacoes', event.target.value)}
          placeholder="Digite observações sobre o cliente..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          disabled={isLoading}
        >
          {isEditing ? 'Atualizar Cliente' : 'Criar Cliente'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
