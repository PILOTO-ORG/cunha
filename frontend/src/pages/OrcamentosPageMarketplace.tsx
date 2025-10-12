import React, { useState, useEffect } from 'react';
import { useProdutos } from '../hooks/useProdutos';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';
import ReservaService from '../services/reservaService';
import { ShoppingCartIcon, PlusIcon, TrashIcon, PhotoIcon, MagnifyingGlassIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Produto, Cliente, Local } from '../types/api';

interface CartItem {
  produto: Produto;
  quantidade: number;
  dias: number;
  data_inicio: string;
  data_fim: string;
}

interface CartSummary {
  cliente?: Cliente;
  local?: Local;
  data_evento: string;
  data_retirada: string;
  data_devolucao: string;
  observacoes: string;
  items: CartItem[];
}

const OrcamentosPageMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [, setDisponibilidade] = useState<Map<number, any>>(new Map());
  const [verificandoDisponibilidade, setVerificandoDisponibilidade] = useState(false);
  const [cart, setCart] = useState<CartSummary>({
    data_evento: '',
    data_retirada: '',
    data_devolucao: '',
    observacoes: '',
    items: []
  });

  // Calcular dias automaticamente quando as datas mudam
  useEffect(() => {
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      const dias = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Atualizar todos os itens do carrinho com os novos dias e datas
      setCart(prev => ({
        ...prev,
        data_retirada: dataInicio,
        data_devolucao: dataFim,
        items: prev.items.map(item => ({
          ...item,
          dias,
          data_inicio: dataInicio,
          data_fim: dataFim
        }))
      }));
    }
  }, [dataInicio, dataFim]);

  // Verificar disponibilidade quando as datas mudam
  useEffect(() => {
    const verificarDisponibilidadeProdutos = async () => {
      if (!dataInicio || !dataFim || cart.items.length === 0) {
        setDisponibilidade(new Map());
        return;
      }

      setVerificandoDisponibilidade(true);
      try {
        const produtosParaVerificar = cart.items.map(item => ({
          id_produto: item.produto.id_produto,
          quantidade: item.quantidade
        }));

        const resultado = await ReservaService.verificarDisponibilidade(
          produtosParaVerificar,
          dataInicio,
          dataFim
        );

        const novaDisponibilidade = new Map();
        resultado.produtos.forEach((p: any) => {
          novaDisponibilidade.set(p.id_produto, p);
        });
        setDisponibilidade(novaDisponibilidade);
      } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
      } finally {
        setVerificandoDisponibilidade(false);
      }
    };

    const timer = setTimeout(() => {
      verificarDisponibilidadeProdutos();
    }, 500);

    return () => clearTimeout(timer);
  }, [dataInicio, dataFim, cart.items]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar dados com filtro de busca
  const { data: produtosData, isLoading: isLoadingProdutos } = useProdutos(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );

  const produtos = produtosData?.data || [];

  // Verificar se produto está no carrinho
  const isInCart = (produtoId: number) => {
    return cart.items.some(item => item.produto.id_produto === produtoId);
  };

  // Obter quantidade no carrinho
  const getCartQuantity = (produtoId: number) => {
    const item = cart.items.find(item => item.produto.id_produto === produtoId);
    return item?.quantidade || 0;
  };

  const addToCart = (produto: Produto) => {
    const existingItem = cart.items.find(item => item.produto.id_produto === produto.id_produto);
    
    if (existingItem) {
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.produto.id_produto === produto.id_produto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      }));
    } else {
      // Calcular dias baseado no período selecionado
      const diasPeriodo = dataInicio && dataFim 
        ? Math.max(1, Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;
      
      // Adicionar novo item
      setCart(prev => ({
        ...prev,
        items: [...prev.items, {
          produto,
          quantidade: 1,
          dias: diasPeriodo,
          data_inicio: dataInicio,
          data_fim: dataFim
        }]
      }));
      
      // Abrir carrinho se for o primeiro item
      if (cart.items.length === 0) {
        setShowCart(true);
      }
    }
  };

  const removeFromCart = (produtoId: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.produto.id_produto !== produtoId)
    }));
  };

  // Calcula o período em dias baseado nas datas do header
  const calcularDiasPeriodo = () => {
    if (!dataInicio || !dataFim) return 1;
    const dias = Math.max(1, Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)));
    return dias;
  };

  const updateCartItem = (produtoId: number, field: keyof CartItem, value: any) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.produto.id_produto === produtoId
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  // Atualizar os dias de todos os itens do carrinho quando as datas mudarem
  React.useEffect(() => {
    const diasPeriodo = calcularDiasPeriodo();
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item => ({
        ...item,
        dias: diasPeriodo,
        data_inicio: dataInicio,
        data_fim: dataFim
      }))
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim]);

  const calculateItemTotal = (item: CartItem) => {
    const valorLocacao = Number(item.produto.valor_locacao || 0);
    return valorLocacao * item.quantidade * Math.max(1, item.dias);
  };

  const calculateCartTotal = () => {
    return cart.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const clearCart = () => {
    setCart({
      data_evento: '',
      data_retirada: '',
      data_devolucao: '',
      observacoes: '',
      items: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Compacto */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marketplace de Produtos</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Selecione produtos e defina o período</p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Botão carrinho mobile */}
              <Button
                onClick={() => setShowCart(!showCart)}
                variant="outline"
                className="lg:hidden relative"
                size="sm"
              >
                <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">Carrinho</span>
                {cart.items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart.items.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Período da Locação - Inline em Desktop */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 inline mr-1" />
                  Data de Retirada *
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full text-sm"
                  required
                />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  <CalendarIcon className="w-3.5 h-3.5 inline mr-1" />
                  Data de Devolução *
                </label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full text-sm"
                  min={dataInicio}
                  required
                />
              </div>
              <div className="lg:col-span-2 flex items-end">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200 w-full">
                  <div className="text-xs text-gray-600 font-medium">Período</div>
                  <div className="text-base font-bold text-blue-600">
                    {dataInicio && dataFim ? 
                      `${Math.max(1, Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24)))} dia(s)` 
                      : '-'
                    }
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex items-end">
                {!dataInicio || !dataFim ? (
                  <div className="w-full text-xs text-amber-600 bg-amber-50 px-2 py-2 rounded border border-amber-200">
                    ⚠️ Defina as datas para verificar disponibilidade
                  </div>
                ) : verificandoDisponibilidade ? (
                  <div className="w-full text-xs text-blue-600 bg-blue-50 px-2 py-2 rounded border border-blue-200">
                    🔄 Verificando disponibilidade...
                  </div>
                ) : (
                  <div className="w-full text-xs text-green-600 bg-green-50 px-2 py-2 rounded border border-green-200">
                    ✓ Período selecionado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de Busca Compacta */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 text-gray-400 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
              {isLoadingProdutos && (
                <div className="absolute inset-y-0 right-10 flex items-center pr-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                </div>
              )}
          </div>
          {searchTerm && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {produtos.length} {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          )}
        </div>
      </div>

      {/* Container Principal - Layout Lado a Lado */}
      <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-6 pt-3 pb-4">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
          
          {/* Área de Produtos - Ajusta largura baseado se carrinho está aberto */}
          <div className={`flex-1 min-w-0 transition-all duration-300`}>
            {/* Grid de produtos */}
            {isLoadingProdutos && !produtos.length ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <div className="text-lg text-gray-600">Carregando produtos...</div>
              </div>
            ) : produtos.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mb-4" />
                <div className="text-lg text-gray-600 mb-2">Nenhum produto encontrado</div>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Tente buscar com outros termos' : 'Não há produtos cadastrados'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {produtos.map(produto => {
                  const inCart = isInCart(produto.id_produto);
                  return (
                    <div 
                      key={produto.id_produto} 
                      className={`bg-white rounded-xl shadow hover:shadow-md transition-all duration-200 hover:scale-[1.02] flex flex-col relative overflow-hidden ${
                        inCart 
                          ? 'ring-2 ring-blue-400 ring-offset-1' 
                          : 'border border-gray-200'
                      }`}
                    >
                      {/* Badge de "No Carrinho" */}
                      {inCart && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <ShoppingCartIcon className="h-3 w-3" />
                            {getCartQuantity(produto.id_produto)}
                          </div>
                        </div>
                      )}
                      
                      {/* Imagem do Produto */}
                      <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100">
                        {produto.imagem_principal ? (
                          <img
                            src={produto.imagem_principal.startsWith('http') 
                              ? produto.imagem_principal 
                              : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${produto.imagem_principal.startsWith('/') ? produto.imagem_principal : '/' + produto.imagem_principal}`
                            }
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center"
                          style={{ display: produto.imagem_principal ? 'none' : 'flex' }}
                        >
                          <PhotoIcon className="h-12 w-12 text-gray-400 mb-1" />
                          <span className="text-gray-400 text-xs font-medium">Sem imagem</span>
                        </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="p-3 flex-1 flex flex-col">
                        {/* Nome */}
                        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 min-h-[3rem]">
                          {produto.nome}
                        </h3>

                        {/* Preço e Estoque */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-xl font-bold text-emerald-600">
                              R$ {Number(produto.valor_locacao || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">por dia</div>
                          </div>
                          <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            produto.quantidade_total > 5 
                              ? 'bg-green-100 text-green-700' 
                              : produto.quantidade_total > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {produto.quantidade_total} un.
                          </div>
                        </div>

                        {/* Descrição */}
                        {produto.descricao && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {produto.descricao}
                          </p>
                        )}

                        {/* Botão */}
                        <div className="mt-auto pt-2 border-t border-gray-100">
                          {isInCart(produto.id_produto) ? (
                            <Button
                              onClick={() => setShowCart(true)}
                              variant="secondary"
                              className="w-full shadow-sm"
                              size="sm"
                            >
                              <ShoppingCartIcon className="w-4 h-4 mr-1.5" />
                              Ver no Carrinho
                            </Button>
                          ) : (
                            <Button
                              onClick={() => addToCart(produto)}
                              className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm"
                              size="sm"
                            >
                              <PlusIcon className="w-4 h-4 mr-1.5" />
                              Adicionar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Carrinho Lateral - Sempre visível em Desktop, Overlay em Mobile */}
          {/* Overlay em mobile - apenas quando showCart está ativo */}
          {showCart && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowCart(false)}
            ></div>
          )}
          
          {/* Sidebar do Carrinho */}
          <div className={`
            fixed lg:sticky lg:top-4 right-0 top-0 h-screen lg:h-auto
            w-full max-w-md sm:max-w-md lg:w-80 xl:w-96 lg:max-w-[50%]
            bg-white shadow-2xl lg:shadow-lg rounded-none lg:rounded-lg
            z-50 lg:z-0
            flex flex-col
            transition-all duration-300
            ${showCart ? 'translate-x-0' : 'translate-x-full'}
            lg:translate-x-0
          `}>
                {/* Header do Carrinho */}
                <div className="border-b bg-gradient-to-r from-blue-600 to-blue-700 lg:rounded-t-lg">
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-bold text-white flex items-center">
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Carrinho ({cart.items.length})
                    </h2>
                    <button 
                      onClick={() => setShowCart(false)} 
                      className="text-white hover:text-gray-200 transition-colors lg:hidden"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Botão Finalizar */}
                  {cart.items.length > 0 && (
                    <div className="px-4 pb-3">
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all"
                        onClick={() => {
                          setShowCheckout(true);
                          setShowCart(false);
                        }}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Finalizar Orçamento
                      </Button>
                    </div>
                  )}
                </div>

                {/* Lista de Itens */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                  {cart.items.length === 0 ? (
                    <div className="text-center text-gray-500 mt-12">
                      <ShoppingCartIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p className="font-semibold text-base">Carrinho vazio</p>
                      <p className="text-sm mt-1 text-gray-400">Adicione produtos para criar um orçamento</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {cart.items.map(item => (
                        <div key={item.produto.id_produto} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900 flex-1 pr-2 line-clamp-2">
                              {item.produto.nome}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.produto.id_produto)}
                              className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                              title="Remover"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-gray-600 font-medium mb-1">Quantidade</label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => updateCartItem(item.produto.id_produto, 'quantidade', parseInt(e.target.value) || 1)}
                                className="text-xs p-2"
                              />
                            </div>
                            {/* <div>
                              <label className="block text-gray-600 font-medium mb-1">Período</label>
                              <div className="bg-gray-100 text-gray-700 font-semibold rounded-md px-3 py-2 text-center border border-gray-300">
                                {item.dias} dia{item.dias > 1 ? 's' : ''}
                              </div>
                            </div> */}
                          </div>

                          <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                              <span>R$ {Number(item.produto.valor_locacao || 0).toFixed(2)} × {item.quantidade} × {item.dias}d</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium text-xs">Subtotal:</span>
                              <span className="font-bold text-emerald-600 text-base">
                                R$ {calculateItemTotal(item).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer com Total */}
                {cart.items.length > 0 && (
                  <div className="border-t bg-white p-4 space-y-3 lg:rounded-b-lg">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        R$ {calculateCartTotal().toFixed(2)}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={clearCart} 
                      variant="secondary" 
                      className="w-full text-sm py-2"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Limpar Carrinho
                    </Button>
                  </div>
                )}
              </div>
            </div>

        {/* Checkout Modal - Full Screen Responsivo */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50">
            <div className="absolute inset-0 overflow-y-auto">
              <div className="min-h-screen flex items-start justify-center p-2 sm:p-4 lg:p-6">
                <div className="w-full max-w-7xl my-4 sm:my-6 lg:my-8">
                  <OrcamentoCheckoutForm
                    items={cart.items}
                    onSuccess={() => {
                      setShowCheckout(false);
                      clearCart();
                      // Refetch data if needed
                    }}
                    onCancel={() => setShowCheckout(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrcamentosPageMarketplace;