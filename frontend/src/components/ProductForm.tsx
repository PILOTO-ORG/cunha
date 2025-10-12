import React, { useState, useEffect } from 'react';
import { useCriarProduto, useAtualizarProduto } from '../hooks/useProdutos';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ImageUpload from '../components/ImageUpload';
import ImageGalleryUpload from '../components/ImageGalleryUpload';
import { Produto } from '../types/api';
import { ProdutoService } from '../services/produtoService';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  product?: Produto | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade_total: '',
    valor_locacao: '',
    valor_danificacao: '',
    tempo_limpeza: ''
  });

  const [imagemPrincipal, setImagemPrincipal] = useState<File | null>(null);
  const [imagensGaleriaPreview, setImagensGaleriaPreview] = useState<string[]>([]);
  const [imagensGaleriaFiles, setImagensGaleriaFiles] = useState<File[]>([]);
  const [produtoAtualizado, setProdutoAtualizado] = useState<Produto | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCriarProduto();
  const updateMutation = useAtualizarProduto();

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome || '',
        descricao: product.descricao || '',
        quantidade_total: product.quantidade_total?.toString() || '',
        valor_locacao: product.valor_locacao?.toString() || '',
        valor_danificacao: product.valor_danificacao?.toString() || '',
        tempo_limpeza: product.tempo_limpeza?.toString() || ''
      });
      setProdutoAtualizado(product);
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
      descricao: formData.descricao.trim() || undefined,
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
        
        // Se uma nova imagem foi selecionada, fazer upload separado
        if (imagemPrincipal) {
          const produtoComImagem = await ProdutoService.atualizarProduto(
            product.id_produto,
            submitData,
            imagemPrincipal
          );
          setProdutoAtualizado(produtoComImagem);
        }
      } else {
        // Criar produto com imagem
        const novoProduto = await ProdutoService.criarProduto(submitData, imagemPrincipal || undefined);
        
        // Se tem imagens de galeria, fazer upload delas
        if (imagensGaleriaFiles.length > 0 && novoProduto.id_produto) {
          const dataTransfer = new DataTransfer();
          imagensGaleriaFiles.forEach(file => dataTransfer.items.add(file));
          await ProdutoService.adicionarImagensGaleria(novoProduto.id_produto, dataTransfer.files);
        }
      }
      toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto. Tente novamente.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRemoverImagemPrincipal = async () => {
    if (!product?.id_produto) return;
    
    try {
      const produtoComImagemRemovida = await ProdutoService.removerImagemPrincipal(product.id_produto);
      setProdutoAtualizado(produtoComImagemRemovida);
      toast.success('Imagem removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem');
    }
  };

  const handleAdicionarImagensGaleria = async (files: FileList) => {
    if (!product?.id_produto) {
      // Se está criando, criar previews
      const filesArray = Array.from(files);
      setImagensGaleriaFiles(prev => [...prev, ...filesArray]);
      
      // Criar URLs de preview
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagensGaleriaPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      toast.success(`${files.length} imagem(ns) selecionada(s). Será(ão) enviada(s) ao salvar.`);
      return;
    }
    
    try {
      const produtoComGaleria = await ProdutoService.adicionarImagensGaleria(product.id_produto, files);
      setProdutoAtualizado(produtoComGaleria);
      toast.success(`${files.length} imagem(ns) adicionada(s) à galeria!`);
    } catch (error) {
      console.error('Erro ao adicionar imagens:', error);
      toast.error('Erro ao adicionar imagens à galeria');
    }
  };

  const handleRemoverImagemGaleria = async (imagemPath: string) => {
    if (!product?.id_produto) {
      // Se está criando, remover do preview
      const index = imagensGaleriaPreview.indexOf(imagemPath);
      if (index > -1) {
        setImagensGaleriaPreview(prev => prev.filter((_, i) => i !== index));
        setImagensGaleriaFiles(prev => prev.filter((_, i) => i !== index));
        toast.success('Imagem removida do preview!');
      }
      return;
    }
    
    try {
      const produtoSemImagem = await ProdutoService.removerImagemGaleria(product.id_produto, imagemPath);
      setProdutoAtualizado(produtoSemImagem);
      toast.success('Imagem removida da galeria!');
    } catch (error) {
      console.error('Erro ao remover imagem da galeria:', error);
      toast.error('Erro ao remover imagem');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de Imagem Principal */}
      <div>
        <ImageUpload
          value={produtoAtualizado?.imagem_principal || product?.imagem_principal}
          onChange={setImagemPrincipal}
          onRemove={isEditing ? handleRemoverImagemPrincipal : undefined}
          label="Foto do Produto"
          maxSizeMB={5}
        />
        {imagemPrincipal && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Nova imagem selecionada. Será enviada ao salvar.
          </p>
        )}
      </div>

      {/* Galeria de Imagens */}
      <div>
        <ImageGalleryUpload
          images={
            isEditing 
              ? (produtoAtualizado?.imagens_galeria || product?.imagens_galeria || [])
              : imagensGaleriaPreview
          }
          onAdd={handleAdicionarImagensGaleria}
          onRemove={handleRemoverImagemGaleria}
          maxImages={10}
          maxSizeMB={5}
        />
        {!isEditing && imagensGaleriaFiles.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            ✓ {imagensGaleriaFiles.length} imagem(ns) de galeria selecionada(s). Será(ão) enviada(s) ao salvar.
          </p>
        )}
        {!isEditing && imagensGaleriaFiles.length === 0 && (
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
            <span>💡</span>
            <span>Adicione imagens à galeria do produto (opcional)</span>
          </p>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Produto</h3>
        
        <div className="space-y-6">
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
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          placeholder="Descrição do produto (opcional)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
        </div>
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
