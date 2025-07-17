import React, { useState, useEffect } from 'react';
import { useCriarProduto, useAtualizarProduto } from '../hooks/useProdutos.ts';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import { Produto } from '../types/api';

interface ProductFormProps {
  product?: Produto | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade_total: '',
    valor_locacao: '',
    valor_danificacao: '',
    tempo_limpeza: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCriarProduto();
  const updateMutation = useAtualizarProduto();

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome || '',
        quantidade_total: product.quantidade_total?.toString() || '',
        valor_locacao: product.valor_locacao?.toString() || '',
        valor_danificacao: product.valor_danificacao?.toString() || '',
        tempo_limpeza: product.tempo_limpeza?.toString() || ''
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.quantidade_total.trim()) {
      newErrors.quantidade_total = 'Quantidade total é obrigatória';
    } else {
      const quantidade = parseInt(formData.quantidade_total);
      if (isNaN(quantidade) || quantidade <= 0) {
        newErrors.quantidade_total = 'Quantidade deve ser um número maior que zero';
      }
    }

    if (formData.valor_locacao && isNaN(parseFloat(formData.valor_locacao))) {
      newErrors.valor_locacao = 'Valor de locação deve ser um número válido';
    }

    if (formData.valor_danificacao && isNaN(parseFloat(formData.valor_danificacao))) {
      newErrors.valor_danificacao = 'Valor de danificação deve ser um número válido';
    }

    if (formData.tempo_limpeza && isNaN(parseInt(formData.tempo_limpeza))) {
      newErrors.tempo_limpeza = 'Tempo de limpeza deve ser um número válido';
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
      quantidade_total: parseInt(formData.quantidade_total),
      valor_locacao: formData.valor_locacao ? parseFloat(formData.valor_locacao) : undefined,
      valor_danificacao: formData.valor_danificacao ? parseFloat(formData.valor_danificacao) : undefined,
      tempo_limpeza: formData.tempo_limpeza ? parseInt(formData.tempo_limpeza) : undefined
    };

    try {
      if (isEditing && product) {
        await updateMutation.mutateAsync({
          id: product.id_produto,
          dados: submitData
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Produto *
        </label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: Cadeira Tiffany"
          error={errors.nome}
          className="mb-0"
        />
      </div>

      <div>
        <label htmlFor="quantidade_total" className="block text-sm font-medium text-gray-700 mb-1">
          Quantidade Total *
        </label>
        <Input
          id="quantidade_total"
          type="number"
          min="1"
          value={formData.quantidade_total}
          onChange={(e) => handleChange('quantidade_total', e.target.value)}
          placeholder="Ex: 50"
          error={errors.quantidade_total}
          className="mb-0"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="valor_locacao" className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Locação (R$)
          </label>
          <Input
            id="valor_locacao"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_locacao}
            onChange={(e) => handleChange('valor_locacao', e.target.value)}
            placeholder="Ex: 8.50"
            error={errors.valor_locacao}
            className="mb-0"
          />
        </div>

        <div>
          <label htmlFor="valor_danificacao" className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Danificação (R$)
          </label>
          <Input
            id="valor_danificacao"
            type="number"
            step="0.01"
            min="0"
            value={formData.valor_danificacao}
            onChange={(e) => handleChange('valor_danificacao', e.target.value)}
            placeholder="Ex: 45.00"
            error={errors.valor_danificacao}
            className="mb-0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tempo_limpeza" className="block text-sm font-medium text-gray-700 mb-1">
          Tempo de Limpeza (dias)
        </label>
        <Input
          id="tempo_limpeza"
          type="number"
          min="0"
          value={formData.tempo_limpeza}
          onChange={(e) => handleChange('tempo_limpeza', e.target.value)}
          placeholder="Ex: 3"
          error={errors.tempo_limpeza}
          className="mb-0"
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
          {isEditing ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
