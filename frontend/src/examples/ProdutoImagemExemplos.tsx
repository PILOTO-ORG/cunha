// Exemplo de integração do ImageUpload em ProductsPage
// Adicione este código ao seu componente de formulário de produtos

import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ImageGalleryUpload from '../components/ImageGalleryUpload';
import { ProdutoService } from '../services/produtoService';
import { toast } from 'react-hot-toast';
import type { Produto } from '../types/api';

// ========== EXEMPLO 1: CRIAR PRODUTO COM IMAGEM ==========

function FormularioCriarProduto() {
  const [imagemPrincipal, setImagemPrincipal] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    quantidade_total: 0,
    valor_locacao: 0,
    valor_danificacao: 0,
    tempo_limpeza: 30
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await ProdutoService.criarProduto(
        formData,
        imagemPrincipal || undefined
      );
      
      toast.success('Produto criado com sucesso!');
      // Redirecionar ou atualizar lista
    } catch (error) {
      toast.error('Erro ao criar produto');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo de Imagem Principal */}
      <ImageUpload
        value={null}
        onChange={setImagemPrincipal}
        label="Foto do Produto"
        maxSizeMB={5}
      />

      {/* Outros campos do formulário */}
      <input
        type="text"
        placeholder="Nome do Produto"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
      />
      
      {/* ... demais campos ... */}

      <button type="submit">Criar Produto</button>
    </form>
  );
}

// ========== EXEMPLO 2: EDITAR PRODUTO E TROCAR IMAGEM ==========

function FormularioEditarProduto({ produto, onSuccess }: { produto: Produto; onSuccess: () => void }) {
  const [novaImagem, setNovaImagem] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nome: produto.nome,
    descricao: produto.descricao,
    quantidade_total: produto.quantidade_total,
    valor_locacao: produto.valor_locacao,
    valor_danificacao: produto.valor_danificacao,
    tempo_limpeza: produto.tempo_limpeza
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await ProdutoService.atualizarProduto(
        produto.id_produto,
        formData,
        novaImagem || undefined
      );
      
      toast.success('Produto atualizado com sucesso!');
      onSuccess();
    } catch (error) {
      toast.error('Erro ao atualizar produto');
      console.error(error);
    }
  };

  const handleRemoverImagemPrincipal = async () => {
    try {
      await ProdutoService.removerImagemPrincipal(produto.id_produto);
      toast.success('Imagem removida');
      onSuccess(); // Recarregar dados
    } catch (error) {
      toast.error('Erro ao remover imagem');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Imagem Principal */}
      <div>
        <ImageUpload
          value={produto.imagem_principal}
          onChange={setNovaImagem}
          onRemove={handleRemoverImagemPrincipal}
          label="Foto Principal do Produto"
          maxSizeMB={5}
        />
        {novaImagem && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Nova imagem selecionada. Será atualizada ao salvar.
          </p>
        )}
      </div>

      {/* Outros campos */}
      <input
        type="text"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
      />

      <button type="submit">Salvar Alterações</button>
    </form>
  );
}

// ========== EXEMPLO 3: GALERIA DE IMAGENS ==========

function GaleriaProduto({ produto, onUpdate }: { produto: Produto; onUpdate: (p: Produto) => void }) {
  const handleAdicionarImagens = async (files: FileList) => {
    try {
      const produtoAtualizado = await ProdutoService.adicionarImagensGaleria(
        produto.id_produto,
        files
      );
      
      toast.success(`${files.length} imagem(ns) adicionada(s)!`);
      onUpdate(produtoAtualizado);
    } catch (error) {
      toast.error('Erro ao adicionar imagens');
      console.error(error);
    }
  };

  const handleRemoverImagem = async (imagemPath: string) => {
    try {
      const produtoAtualizado = await ProdutoService.removerImagemGaleria(
        produto.id_produto,
        imagemPath
      );
      
      toast.success('Imagem removida da galeria');
      onUpdate(produtoAtualizado);
    } catch (error) {
      toast.error('Erro ao remover imagem');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Galeria de Imagens</h3>
      
      <ImageGalleryUpload
        images={produto.imagens_galeria}
        onAdd={handleAdicionarImagens}
        onRemove={handleRemoverImagem}
        maxImages={10}
        maxSizeMB={5}
      />
    </div>
  );
}

// ========== EXEMPLO 4: PÁGINA COMPLETA DE PRODUTO ==========

function ProdutoDetalhesPage({ id }: { id: number }) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Buscar produto ao montar
  React.useEffect(() => {
    ProdutoService.buscarProduto(id).then(setProduto);
  }, [id]);

  if (!produto) return <div>Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho com imagem principal */}
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          {produto.imagem_principal ? (
            <img
              src={produto.imagem_principal.startsWith('http')
                ? produto.imagem_principal
                : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${produto.imagem_principal.startsWith('/') ? produto.imagem_principal : '/' + produto.imagem_principal}`
              }
              alt={produto.nome}
              className="w-64 h-64 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Sem imagem</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{produto.nome}</h1>
          <p className="text-gray-600 mt-2">{produto.descricao}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Valor Locação:</span>
              <p className="text-lg font-semibold">R$ {produto.valor_locacao}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Quantidade:</span>
              <p className="text-lg font-semibold">{produto.quantidade_total}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isEditing ? 'Cancelar' : 'Editar Produto'}
          </button>
        </div>
      </div>

      {/* Formulário de edição (se ativo) */}
      {isEditing && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <FormularioEditarProduto
            produto={produto}
            onSuccess={() => {
              ProdutoService.buscarProduto(id).then(setProduto);
              setIsEditing(false);
            }}
          />
        </div>
      )}

      {/* Galeria de imagens */}
      <div className="bg-white p-6 rounded-lg shadow">
        <GaleriaProduto
          produto={produto}
          onUpdate={setProduto}
        />
      </div>
    </div>
  );
}

// ========== EXEMPLO 5: LISTA DE PRODUTOS COM IMAGENS ==========

function ListaProdutosComImagens() {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  React.useEffect(() => {
    ProdutoService.listarProdutos().then(response => {
      setProdutos(response.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {produtos.map((produto) => (
        <div key={produto.id_produto} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Imagem do Card */}
          {produto.imagem_principal ? (
            <img
              src={produto.imagem_principal.startsWith('http')
                ? produto.imagem_principal
                : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${produto.imagem_principal.startsWith('/') ? produto.imagem_principal : '/' + produto.imagem_principal}`
              }
              alt={produto.nome}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}

          {/* Informações */}
          <div className="p-4">
            <h3 className="font-semibold text-lg">{produto.nome}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{produto.descricao}</p>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-green-600 font-semibold">
                R$ {produto.valor_locacao}
              </span>
              <span className="text-gray-500 text-sm">
                Qtd: {produto.quantidade_total}
              </span>
            </div>

            {/* Badge se tiver galeria */}
            {produto.imagens_galeria && produto.imagens_galeria.length > 0 && (
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  +{produto.imagens_galeria.length} fotos
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  FormularioCriarProduto,
  FormularioEditarProduto,
  GaleriaProduto,
  ProdutoDetalhesPage,
  ListaProdutosComImagens
};
