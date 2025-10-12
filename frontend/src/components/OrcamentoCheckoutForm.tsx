import React, { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useLocais } from '../hooks/useLocais';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import OrcamentoSucessoModal from './OrcamentoSucessoModal';
import { CalendarIcon, UserIcon, MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import ReservaService from '../services/reservaService';
import type { Produto } from '../types/api';
import {
  buscarEnderecoPorCep,
  formatCep,
  formatCpfOrCnpj,
  formatTelefone,
  isValidCpfOrCnpj,
  isValidCepFormat,
  isValidTelefone,
  isValidEmail,
  unformatCep,
  ESTADOS_BRASILEIROS
} from '../services/cepService';

interface CartItem {
  produto: Produto;
  quantidade: number;
}

interface OrcamentoCheckoutFormProps {
  items: CartItem[];
  onSuccess: (orcamentoData?: any) => void;
  onCancel: () => void;
  idOrcamento?: number; // se presente, edita orçamento existente
}

const OrcamentoCheckoutForm: React.FC<OrcamentoCheckoutFormProps> = ({
  items,
  onSuccess,
  onCancel,
  idOrcamento
}) => {
  // Estado para modal de ver todos os produtos
  // Estado para expandir grid de produtos
  const [produtosExpandido, setProdutosExpandido] = React.useState(false);
  // Estado para produto selecionado para detalhes
  const [produtoDetalhe, setProdutoDetalhe] = React.useState<Produto | null>(null);
  const navigate = useNavigate();

  // Estado de carregamento de dados do orçamento
  const [carregandoOrcamento, setCarregandoOrcamento] = useState(false);
  // Estado para saber se já carregou dados do orçamento
  const [orcamentoCarregado, setOrcamentoCarregado] = useState(false);

  // Estado dos produtos editáveis
  const [produtosEditaveis, setProdutosEditaveis] = useState<CartItem[]>(items.map(({ produto, quantidade }) => ({ produto, quantidade })));

  // Estado dos dados do formulário
  const [formData, setFormData] = useState({
    id_cliente: 0,
    id_local: 0,
    data_retirada: '',
    data_devolucao: '',
    observacoes: '',
    forma_pagamento: '',
    caucao_percentual: 30,
    validade_dias: 3,
    cliente_nome: '',
    local_nome: '',
    valor_frete: 0,
    valor_desconto: 0
  });

  // Buscar dados do orçamento para edição
  React.useEffect(() => {
    const fetchOrcamento = async () => {
      if (!idOrcamento) return;
      setCarregandoOrcamento(true);
      try {
        const ReservaService = (await import('../services/reservaService')).default;
        const ProdutoService = (await import('../services/produtoService')).default;
        const orcamento = await ReservaService.buscarReserva(idOrcamento);
        const itensReserva = await ReservaService.buscarItensReserva(idOrcamento);

        setFormData(prev => ({
          ...prev,
          id_cliente: orcamento.id_cliente || 0,
          id_local: orcamento.id_local || 0,
          data_retirada: orcamento.data_retirada ? orcamento.data_retirada.split('T')[0] : '',
          data_devolucao: orcamento.data_devolucao ? orcamento.data_devolucao.split('T')[0] : '',
          observacoes: orcamento.observacoes || '',
          forma_pagamento: orcamento.forma_pagamento || '',
          caucao_percentual: orcamento.caucao_percentual || 30,
          validade_dias: orcamento.validade_dias || 3,
          valor_frete: 'valor_frete' in orcamento ? (orcamento as any).valor_frete || 0 : 0,
          valor_desconto: 'valor_desconto' in orcamento ? (orcamento as any).valor_desconto || 0 : 0
        }));

        // Buscar produtos pelos ids dos itens
        const produtosResponse = await ProdutoService.listarProdutos();
        const todosProdutos = Array.isArray(produtosResponse) ? produtosResponse : produtosResponse?.data || [];

        // Mapear itens para CartItem com produtos encontrados
        setProdutosEditaveis(
          (itensReserva || []).map((item: any) => {
            const produto = todosProdutos.find((p: Produto) => p.id_produto === item.id_produto);
            return {
              produto: produto || { id_produto: item.id_produto, nome: 'Produto não encontrado', valor_locacao: 0, valor_danificacao: 0, quantidade_total: 0, descricao: '', ativo: true },
              quantidade: item.quantidade
            };
          })
        );
        setOrcamentoCarregado(true);
      } catch (err) {
        // Pode adicionar tratamento de erro se necessário
      } finally {
        setCarregandoOrcamento(false);
      }
    };
    if (idOrcamento && !orcamentoCarregado) {
      fetchOrcamento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrcamento]);

  // Seletor de produtos (busca e grid)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  // Hook de produtos
  const { data: produtosData, isLoading: isLoadingProdutos } = require('../hooks/useProdutos').useProdutos(
    debouncedSearch ? { search: debouncedSearch } : undefined
  );
  const produtos = produtosData?.data || [];

  // Adicionar produto ao orçamento
  const addProduto = (produto: Produto) => {
    setProdutosEditaveis(prev => {
      const idx = prev.findIndex(item => item && item.produto && item.produto.id_produto === produto.id_produto);
      if (idx !== -1) {
        // Já existe, incrementa quantidade
        return prev.map((item, i) => i === idx ? { ...item, quantidade: item.quantidade + 1 } : item);
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orcamentoCriado, setOrcamentoCriado] = useState<number | null>(null);
  const [showSucessoModal, setShowSucessoModal] = useState(false);
  
  // Estados para edição inline
  const [editandoCliente, setEditandoCliente] = useState(false);
  const [editandoLocal, setEditandoLocal] = useState(false);
  const [clienteEditData, setClienteEditData] = useState<any>({});
  const [localEditData, setLocalEditData] = useState<any>({});
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [salvandoLocal, setSalvandoLocal] = useState(false);
  
  // Estados para criação de novos
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [criandoNovoLocal, setCriandoNovoLocal] = useState(false);
  const [novoClienteData, setNovoClienteData] = useState<any>({
    nome: '',
    telefone: '',
    cpf_cnpj: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: ''
  });
  const [novoLocalData, setNovoLocalData] = useState<any>({
    nome: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    capacidade: 0
  });
  
  // Estados para CEP e validação
  const [buscandoCepCliente, setBuscandoCepCliente] = useState(false);
  const [buscandoCepLocal, setBuscandoCepLocal] = useState(false);
  const [buscandoCepEditCliente, setBuscandoCepEditCliente] = useState(false);
  const [buscandoCepEditLocal, setBuscandoCepEditLocal] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<any>({});

  const { data: clientesData, refetch: refetchClientes } = useClientes();
  const { data: locaisData, refetch: refetchLocais } = useLocais();

  const clientes = clientesData?.data || [];
  const locais = locaisData?.data || [];

  // Buscar dados do cliente selecionado
  const clienteSelecionado = clientes.find(c => c.id_cliente === Number(formData.id_cliente));
  const localSelecionado = locais.find(l => l.id_local === Number(formData.id_local));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Detectar quando seleciona "Criar Novo"
    if (name === 'id_cliente' && value === 'novo') {
      setCriandoNovoCliente(true);
      return;
    }
    if (name === 'id_local' && value === 'novo') {
      setCriandoNovoLocal(true);
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // Calcula o período em dias baseado nas datas globais
  const calcularDiasPeriodo = () => {
    if (!formData.data_retirada || !formData.data_devolucao) return 1;
    const dias = Math.max(1, Math.ceil((new Date(formData.data_devolucao).getTime() - new Date(formData.data_retirada).getTime()) / (1000 * 60 * 60 * 24)));
    return dias;
  };

  // Sempre que datas mudam, atualiza todos os produtos (não há campo de dias por produto)
  React.useEffect(() => {
    // Nada a fazer, pois só usamos dias globais
  }, [formData.data_retirada, formData.data_devolucao]);

  const calculateTotal = () => {
    const dias = calcularDiasPeriodo();
    return produtosEditaveis.reduce((total, item) => {
      if (!item || !item.produto) return total;
      const valorLocacao = Number(item.produto.valor_locacao || 0);
      return total + (valorLocacao * item.quantidade * dias);
    }, 0);
  };

  const calculateTotalReposicao = () => {
    return produtosEditaveis.reduce((total, item) => {
      if (!item || !item.produto) return total;
      const valorDanificacao = Number(item.produto.valor_danificacao || 0);
      return total + (valorDanificacao * item.quantidade);
    }, 0);
  };

  const calculateCaucao = () => {
    // Caução calculada sobre o valor total da locação
    return (calculateTotal() * formData.caucao_percentual) / 100;
  };

  // ============================================
  // FUNÇÕES DE BUSCA DE CEP E VALIDAÇÃO
  // ============================================
  
  /**
   * Busca CEP para novo cliente
   */
  const handleBuscarCepCliente = async (cep: string) => {
    const cepLimpo = unformatCep(cep);
    
    if (!isValidCepFormat(cepLimpo)) {
      setErrosValidacao(prev => ({ ...prev, cep_cliente: 'CEP inválido' }));
      return;
    }
    
    setBuscandoCepCliente(true);
    setErrosValidacao(prev => ({ ...prev, cep_cliente: null }));
    
    try {
      const dados = await buscarEnderecoPorCep(cepLimpo);
      setNovoClienteData(prev => ({
        ...prev,
        cep: cepLimpo,
        rua: dados.logradouro || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        estado: dados.uf || prev.estado,
        complemento: dados.complemento || prev.complemento
      }));
    } catch (error) {
      setErrosValidacao(prev => ({ ...prev, cep_cliente: 'CEP não encontrado' }));
    } finally {
      setBuscandoCepCliente(false);
    }
  };

  /**
   * Busca CEP para novo local
   */
  const handleBuscarCepLocal = async (cep: string) => {
    const cepLimpo = unformatCep(cep);
    
    if (!isValidCepFormat(cepLimpo)) {
      setErrosValidacao(prev => ({ ...prev, cep_local: 'CEP inválido' }));
      return;
    }
    
    setBuscandoCepLocal(true);
    setErrosValidacao(prev => ({ ...prev, cep_local: null }));
    
    try {
      const dados = await buscarEnderecoPorCep(cepLimpo);
      setNovoLocalData(prev => ({
        ...prev,
        cep: cepLimpo,
        rua: dados.logradouro || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        estado: dados.uf || prev.estado,
        complemento: dados.complemento || prev.complemento
      }));
    } catch (error) {
      setErrosValidacao(prev => ({ ...prev, cep_local: 'CEP não encontrado' }));
    } finally {
      setBuscandoCepLocal(false);
    }
  };

  /**
   * Busca CEP para edição de cliente
   */
  const handleBuscarCepEditCliente = async (cep: string) => {
    const cepLimpo = unformatCep(cep);
    
    if (!isValidCepFormat(cepLimpo)) {
      setErrosValidacao(prev => ({ ...prev, cep_edit_cliente: 'CEP inválido' }));
      return;
    }
    
    setBuscandoCepEditCliente(true);
    setErrosValidacao(prev => ({ ...prev, cep_edit_cliente: null }));
    
    try {
      const dados = await buscarEnderecoPorCep(cepLimpo);
      setClienteEditData(prev => ({
        ...prev,
        cep: cepLimpo,
        rua: dados.logradouro || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        estado: dados.uf || prev.estado,
        complemento: dados.complemento || prev.complemento
      }));
    } catch (error) {
      setErrosValidacao(prev => ({ ...prev, cep_edit_cliente: 'CEP não encontrado' }));
    } finally {
      setBuscandoCepEditCliente(false);
    }
  };

  /**
   * Busca CEP para edição de local
   */
  const handleBuscarCepEditLocal = async (cep: string) => {
    const cepLimpo = unformatCep(cep);
    
    if (!isValidCepFormat(cepLimpo)) {
      setErrosValidacao(prev => ({ ...prev, cep_edit_local: 'CEP inválido' }));
      return;
    }
    
    setBuscandoCepEditLocal(true);
    setErrosValidacao(prev => ({ ...prev, cep_edit_local: null }));
    
    try {
      const dados = await buscarEnderecoPorCep(cepLimpo);
      setLocalEditData(prev => ({
        ...prev,
        cep: cepLimpo,
        rua: dados.logradouro || prev.rua,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        estado: dados.uf || prev.estado,
        complemento: dados.complemento || prev.complemento
      }));
    } catch (error) {
      setErrosValidacao(prev => ({ ...prev, cep_edit_local: 'CEP não encontrado' }));
    } finally {
      setBuscandoCepEditLocal(false);
    }
  };

  /**
   * Validar campos antes de salvar
   */
  const validarCliente = (dados: any): boolean => {
    const erros: any = {};
    
    if (!dados.nome?.trim()) {
      erros.nome = 'Nome é obrigatório';
    }
    
    if (!dados.telefone?.trim()) {
      erros.telefone = 'Telefone é obrigatório';
    } else if (!isValidTelefone(dados.telefone)) {
      erros.telefone = 'Telefone inválido';
    }
    
    if (dados.cpf_cnpj && !isValidCpfOrCnpj(dados.cpf_cnpj)) {
      erros.cpf_cnpj = 'CPF/CNPJ inválido';
    }
    
    if (dados.email && !isValidEmail(dados.email)) {
      erros.email = 'Email inválido';
    }
    
    if (dados.cep && !isValidCepFormat(dados.cep)) {
      erros.cep = 'CEP inválido (8 dígitos)';
    }
    
    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  };

  const validarLocal = (dados: any): boolean => {
    const erros: any = {};
    
    if (!dados.nome?.trim()) {
      erros.nome_local = 'Nome do local é obrigatório';
    }
    
    if (dados.cep && !isValidCepFormat(dados.cep)) {
      erros.cep_local = 'CEP inválido (8 dígitos)';
    }
    
    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  };

  // ============================================
  // FUNÇÕES DE EDIÇÃO E CRIAÇÃO
  // ============================================

  // Funções de edição inline de cliente
  const handleEditarCliente = () => {
    if (clienteSelecionado) {
      setClienteEditData({ ...clienteSelecionado });
      setEditandoCliente(true);
    }
  };

  const handleCancelarEdicaoCliente = () => {
    setEditandoCliente(false);
    setClienteEditData({});
  };

  const handleSalvarCliente = async () => {
    if (!clienteSelecionado) return;
    
    setSalvandoCliente(true);
    try {
      const ClienteService = (await import('../services/clienteService')).default;
      await ClienteService.atualizarCliente(clienteSelecionado.id_cliente, clienteEditData);
      await refetchClientes();
      setEditandoCliente(false);
      setClienteEditData({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar cliente');
    } finally {
      setSalvandoCliente(false);
    }
  };

  // Funções para criar novo cliente
  const handleCriarNovoCliente = async () => {
    // Validar campos
    if (!validarCliente(novoClienteData)) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }
    
    setSalvandoCliente(true);
    try {
      const ClienteService = (await import('../services/clienteService')).default;
      const novoCliente = await ClienteService.criarCliente(novoClienteData);
      await refetchClientes();
      
      // Selecionar o novo cliente
      setFormData(prev => ({ ...prev, id_cliente: novoCliente.id_cliente }));
      setCriandoNovoCliente(false);
      setNovoClienteData({
        nome: '',
        telefone: '',
        cpf_cnpj: '',
        email: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: ''
      });
      setErrosValidacao({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar cliente');
    } finally {
      setSalvandoCliente(false);
    }
  };

  const handleCancelarNovoCliente = () => {
    setCriandoNovoCliente(false);
    setNovoClienteData({
      nome: '',
      telefone: '',
      cpf_cnpj: '',
      email: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: ''
    });
    setErrosValidacao({});
    setError(null);
    setFormData(prev => ({ ...prev, id_cliente: 0 }));
  };

  // Funções de edição inline de local
  const handleEditarLocal = () => {
    if (localSelecionado) {
      setLocalEditData({ ...localSelecionado });
      setEditandoLocal(true);
    }
  };

  const handleCancelarEdicaoLocal = () => {
    setEditandoLocal(false);
    setLocalEditData({});
  };

  const handleSalvarLocal = async () => {
    if (!localSelecionado) return;
    
    setSalvandoLocal(true);
    try {
      const LocalService = (await import('../services/localService')).default;
      await LocalService.atualizarLocal(localSelecionado.id_local, localEditData);
      await refetchLocais();
      setEditandoLocal(false);
      setLocalEditData({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar local');
    } finally {
      setSalvandoLocal(false);
    }
  };

  // Funções para criar novo local
  const handleCriarNovoLocal = async () => {
    // Validar campos
    if (!validarLocal(novoLocalData)) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }
    
    setSalvandoLocal(true);
    try {
      const LocalService = (await import('../services/localService')).default;
      const novoLocal = await LocalService.criarLocal(novoLocalData);
      await refetchLocais();
      
      // Selecionar o novo local
      setFormData(prev => ({ ...prev, id_local: novoLocal.id_local }));
      setCriandoNovoLocal(false);
      setNovoLocalData({
        nome: '',
        cep: '',
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: '',
        capacidade: 0
      });
      setErrosValidacao({});
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar local');
    } finally {
      setSalvandoLocal(false);
    }
  };

  const handleCancelarNovoLocal = () => {
    setCriandoNovoLocal(false);
    setNovoLocalData({
      nome: '',
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      capacidade: 0
    });
    setErrosValidacao({});
    setFormData(prev => ({ ...prev, id_local: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (criandoNovoCliente) {
      setError('Por favor, finalize a criação do cliente ou cancele antes de continuar');
      return;
    }
    
    if (!formData.id_cliente || formData.id_cliente === 0) {
      setError('Por favor, selecione um cliente');
      return;
    }
    
    if (!formData.data_retirada || !formData.data_devolucao) {
      setError('Por favor, preencha as datas de retirada e devolução');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Preparar itens para o backend
      const dias = calcularDiasPeriodo();
      const itemsData = produtosEditaveis.filter(item => item && item.produto).map(item => ({
        id_produto: item.produto.id_produto,
        quantidade: item.quantidade,
        dias_locacao: dias,
        valor_unitario: Number(item.produto.valor_locacao || 0),
        valor_total: Number(item.produto.valor_locacao || 0) * item.quantidade * dias
      }));

      let orcamento;
      if (idOrcamento) {
        // Atualizar orçamento existente
        orcamento = await ReservaService.atualizarReserva(idOrcamento, {
          id_cliente: Number(formData.id_cliente),
          id_local: formData.id_local > 0 ? Number(formData.id_local) : undefined,
          data_evento: formData.data_retirada,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          observacoes: formData.observacoes || undefined,
          itens: itemsData
        });
      } else {
        // Criar orçamento novo
        orcamento = await ReservaService.criarOrcamentoComItens({
          id_cliente: Number(formData.id_cliente),
          id_local: formData.id_local > 0 ? Number(formData.id_local) : undefined,
          data_evento: formData.data_retirada,
          data_retirada: formData.data_retirada,
          data_devolucao: formData.data_devolucao,
          observacoes: formData.observacoes || undefined,
          valor_frete: Number(formData.valor_frete) || undefined,
          valor_desconto: Number(formData.valor_desconto) || undefined,
          items: itemsData
        });
      }

      setOrcamentoCriado(orcamento.id_reserva);
      setShowSucessoModal(true);
    } catch (error: any) {
      console.error('Erro ao salvar orçamento:', error);
      setError(error.response?.data?.error || 'Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFecharModalSucesso = () => {
    setShowSucessoModal(false);
    navigate('/orcamentos');
    onSuccess();
  };

  const handleGerarPDF = async () => {
    if (orcamentoCriado) {
      await ReservaService.gerarPDFOrcamento(orcamentoCriado);
    }
  };

  const handleGerarAssinatura = async () => {
    if (orcamentoCriado) {
      return await ReservaService.gerarLinkAssinatura(orcamentoCriado);
    }
    throw new Error('ID do orçamento não encontrado');
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header Aprimorado */}
      <div className="relative px-6 sm:px-8 py-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Finalizar Orçamento
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">Complete as informações abaixo para gerar o orçamento completo</p>
            </div>
            <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-white/90 text-sm font-medium">{produtosEditaveis.length} {produtosEditaveis.length === 1 ? 'item' : 'itens'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 sm:mx-8 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        {/* Seção: Datas do Orçamento e Evento */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Datas e Período do Evento
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Retirada <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="data_retirada"
                  value={formData.data_retirada}
                  onChange={handleChange}
                  className="w-full border-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Definida no período do orçamento</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data de Devolução <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="data_devolucao"
                  value={formData.data_devolucao}
                  onChange={handleChange}
                  className="w-full border-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Definida no período do orçamento</p>
              </div>
            </div>
            {/* Info sobre o período */}
            {formData.data_retirada && formData.data_devolucao && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center text-sm text-purple-900">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    Período: {Math.max(1, Math.ceil((new Date(formData.data_devolucao).getTime() - new Date(formData.data_retirada).getTime()) / (1000 * 60 * 60 * 24)))} dia(s) de locação
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seletor de Produtos (linha única + ver mais) */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-purple-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Adicionar Produtos ao Orçamento
            </h3>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            {isLoadingProdutos ? (
              <div className="text-center text-gray-500 py-8">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Nenhum produto encontrado</div>
            ) : (
              <>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                  style={{
                    maxHeight: produtosExpandido ? 'calc(5 * 8rem + 2.5rem)' : 'calc(2 * 8rem + 2.5rem)',
                    overflowY: 'auto',
                    transition: 'max-height 0.3s',
                  }}
                >
                  {(produtosExpandido ? produtos : produtos.slice(0, 4)).map(produto => {
                    const inCart = produtosEditaveis.some(item => item && item.produto && produto && item.produto.id_produto === produto.id_produto);
                    return (
                      <div
                        key={produto.id_produto}
                        className={`bg-white rounded-xl shadow hover:shadow-md transition-all duration-200 flex flex-col relative overflow-hidden ${inCart ? 'ring-2 ring-purple-400 ring-offset-1' : 'border border-gray-200'}`}
                        onClick={() => setProdutoDetalhe(produto)}
                        style={{ cursor: 'pointer' }}
                      >
                        {produto.imagem_principal && (
                          <img
                            src={produto.imagem_principal.startsWith('http')
                              ? produto.imagem_principal
                              : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${produto.imagem_principal.startsWith('/') ? produto.imagem_principal : '/' + produto.imagem_principal}`
                            }
                            alt={produto.nome}
                            className="w-full h-32 object-cover rounded-t-xl mb-2"
                          />
                        )}
                        <div className="p-3 flex-1 flex flex-col">
                          <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 min-h-[3rem]">{produto.nome}</h3>
                          <div className="text-xl font-bold text-emerald-600">R$ {Number(produto.valor_locacao || 0).toFixed(2)}</div>
                          <div className="text-xs text-gray-500 mb-2">por dia</div>
                          <button
                            type="button"
                            className={`mt-auto w-full rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 transition-all ${inCart ? 'opacity-60 cursor-not-allowed' : ''}`}
                            onClick={e => { e.stopPropagation(); if (!inCart) addProduto(produto); }}
                            disabled={inCart}
                          >
                            {inCart ? 'Adicionado' : 'Adicionar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {produtos.length > 4 && (
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      className="text-purple-700 font-semibold hover:underline text-sm"
                      onClick={() => setProdutosExpandido(v => !v)}
                    >
                      {produtosExpandido ? 'Mostrar menos' : 'Ver mais produtos'}
                    </button>
                  </div>
                )}
                {/* Detalhe do produto */}
                {produtoDetalhe && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
                      <button
                        type="button"
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        onClick={() => setProdutoDetalhe(null)}
                      >
                        Fechar
                      </button>
                      {produtoDetalhe.imagem_principal && (
                        <img
                          src={produtoDetalhe.imagem_principal.startsWith('http')
                            ? produtoDetalhe.imagem_principal
                            : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${produtoDetalhe.imagem_principal.startsWith('/') ? produtoDetalhe.imagem_principal : '/' + produtoDetalhe.imagem_principal}`
                          }
                          alt={produtoDetalhe.nome}
                          className="w-full h-48 object-cover rounded-xl mb-4"
                        />
                      )}
                      <h4 className="text-lg font-bold mb-2">{produtoDetalhe.nome}</h4>
                      <div className="text-gray-700 mb-2">{produtoDetalhe.descricao}</div>
                      <div className="text-emerald-700 font-bold text-xl mb-2">R$ {Number(produtoDetalhe.valor_locacao || 0).toFixed(2)} <span className="text-xs font-normal">por dia</span></div>
                      {produtoDetalhe.imagens_galeria && produtoDetalhe.imagens_galeria.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {produtoDetalhe.imagens_galeria.map((img, i) => (
                            <img key={i} src={img} alt="galeria" className="w-20 h-20 object-cover rounded" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lista de Produtos do Orçamento */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              Produtos Selecionados
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {produtosEditaveis.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 border-b pb-3 mb-3">
                <div className="flex-1 flex items-center gap-2">
                  {item?.produto?.imagem_principal && (
                    <img
                      src={item.produto.imagem_principal.startsWith('http')
                        ? item.produto.imagem_principal
                        : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${item.produto.imagem_principal.startsWith('/') ? item.produto.imagem_principal : '/' + item.produto.imagem_principal}`
                      }
                      alt={item.produto.nome || 'Produto sem imagem'}
                      className="w-14 h-14 object-cover rounded border border-gray-200"
                    />
                  )}
                  <span className="font-medium text-gray-800">{item?.produto?.nome || 'Produto sem nome'}</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Quantidade</label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantidade}
                    onChange={e => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setProdutosEditaveis(arr => arr.map((it, i) => i === idx ? { ...it, quantidade: val } : it));
                    }}
                    className="w-20"
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setProdutosEditaveis(arr => arr.filter((_, i) => i !== idx))}
                    className="ml-2"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
            {produtosEditaveis.length === 0 && (
              <div className="text-center text-gray-500 py-4">Nenhum produto selecionado</div>
            )}
          </div>
        </div>
        {/* Grid Principal - Layout Melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Coluna Principal Esquerda - Informações do Pedido */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Seção 1: Cliente */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3">
                <h3 className="text-base font-bold text-white flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Informações do Cliente
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecione o Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_cliente"
                    value={criandoNovoCliente ? 'novo' : formData.id_cliente}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                    disabled={editandoCliente || criandoNovoCliente}
                  >
                    <option value={0}>Selecione um cliente</option>
                    <option value="novo">➕ Criar Novo Cliente</option>
                    <option value={0} disabled>──────────────</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nome} {cliente.cpf_cnpj ? `• ${cliente.cpf_cnpj}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formulário de Criação de Novo Cliente */}
                {criandoNovoCliente && (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-green-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Criar Novo Cliente
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCriarNovoCliente}
                          disabled={salvandoCliente}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {salvandoCliente ? 'Salvando...' : 'Salvar Cliente'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancelarNovoCliente}
                          variant="secondary"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={novoClienteData.nome || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, nome: e.target.value})}
                          className={`text-sm ${errosValidacao.nome ? 'border-red-500' : ''}`}
                          placeholder="Nome completo"
                          required
                        />
                        {errosValidacao.nome && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.nome}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Telefone <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formatTelefone(novoClienteData.telefone || '')}
                          onChange={(e) => setNovoClienteData({...novoClienteData, telefone: e.target.value.replace(/\D/g, '')})}
                          className={`text-sm ${errosValidacao.telefone ? 'border-red-500' : ''}`}
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                          required
                        />
                        {errosValidacao.telefone && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.telefone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                        <Input
                          value={formatCpfOrCnpj(novoClienteData.cpf_cnpj || '')}
                          onChange={(e) => setNovoClienteData({...novoClienteData, cpf_cnpj: e.target.value.replace(/\D/g, '')})}
                          className={`text-sm ${errosValidacao.cpf_cnpj ? 'border-red-500' : ''}`}
                          placeholder="000.000.000-00"
                          maxLength={18}
                        />
                        {errosValidacao.cpf_cnpj && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.cpf_cnpj}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          type="email"
                          value={novoClienteData.email || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, email: e.target.value})}
                          className={`text-sm ${errosValidacao.email ? 'border-red-500' : ''}`}
                          placeholder="email@exemplo.com"
                        />
                        {errosValidacao.email && <p className="text-xs text-red-600 mt-1">{errosValidacao.email}</p>}
                      </div>
                      
                      {/* CAMPOS DE ENDEREÇO */}
                      <div className="sm:col-span-2">
                        <hr className="my-2 border-gray-300" />
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">Endereço</h5>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">CEP</label>
                        <div className="flex gap-2">
                          <Input
                            value={formatCep(novoClienteData.cep || '')}
                            onChange={(e) => {
                              const valor = unformatCep(e.target.value);
                              setNovoClienteData({...novoClienteData, cep: valor});
                            }}
                            onBlur={(e) => {
                              const cep = unformatCep(e.target.value);
                              if (cep.length === 8) {
                                handleBuscarCepCliente(cep);
                              }
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`text-sm flex-1 ${errosValidacao.cep_cliente ? 'border-red-500' : ''}`}
                          />
                          {buscandoCepCliente && (
                            <span className="text-xs text-gray-500 self-center">Buscando...</span>
                          )}
                        </div>
                        {errosValidacao.cep_cliente && <p className="text-xs text-red-600 mt-1">{errosValidacao.cep_cliente}</p>}
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                        <Input
                          value={novoClienteData.rua || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, rua: e.target.value})}
                          placeholder="Rua, Avenida, etc."
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
                        <Input
                          value={novoClienteData.numero || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, numero: e.target.value})}
                          placeholder="123"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
                        <Input
                          value={novoClienteData.bairro || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, bairro: e.target.value})}
                          placeholder="Bairro"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Município/Cidade</label>
                        <Input
                          value={novoClienteData.cidade || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, cidade: e.target.value})}
                          placeholder="Cidade"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <select
                          value={novoClienteData.estado || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione...</option>
                          {ESTADOS_BRASILEIROS.map(estado => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label} ({estado.value})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Complemento</label>
                        <Input
                          value={novoClienteData.complemento || ''}
                          onChange={(e) => setNovoClienteData({...novoClienteData, complemento: e.target.value})}
                          placeholder="Apto, sala, bloco, etc."
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card de Informações do Cliente */}
                {clienteSelecionado && !editandoCliente && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-blue-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        Dados do Cliente Selecionado
                      </h4>
                      <Button
                        type="button"
                        onClick={handleEditarCliente}
                        variant="secondary"
                        size="sm"
                        className="bg-black hover:bg-gray-50 text-blue-700 border-blue-300"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded px-3 py-2">
                        <span className="font-medium text-gray-600 block text-xs mb-1">Telefone</span>
                        <span className="text-gray-900">{clienteSelecionado.telefone || '-'}</span>
                      </div>
                      <div className="bg-white rounded px-3 py-2">
                        <span className="font-medium text-gray-600 block text-xs mb-1">CPF/CNPJ</span>
                        <span className="text-gray-900">{clienteSelecionado.cpf_cnpj || '-'}</span>
                      </div>
                      {clienteSelecionado.email && (
                        <div className="bg-white rounded px-3 py-2 sm:col-span-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Email</span>
                          <span className="text-gray-900 break-all">{clienteSelecionado.email}</span>
                        </div>
                      )}
                      {clienteSelecionado.endereco_completo && (
                        <div className="bg-white rounded px-3 py-2 sm:col-span-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Endereço Completo</span>
                          <span className="text-gray-900">{clienteSelecionado.endereco_completo}</span>
                        </div>
                      )}
                      {clienteSelecionado.cidade && clienteSelecionado.estado && (
                        <div className="bg-white rounded px-3 py-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Cidade/Estado</span>
                          <span className="text-gray-900">{clienteSelecionado.cidade}/{clienteSelecionado.estado}</span>
                        </div>
                      )}
                      {clienteSelecionado.cep && (
                        <div className="bg-white rounded px-3 py-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">CEP</span>
                          <span className="text-gray-900">{clienteSelecionado.cep}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulário de Edição do Cliente */}
                {clienteSelecionado && editandoCliente && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-amber-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editando Dados do Cliente
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSalvarCliente}
                          disabled={salvandoCliente}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {salvandoCliente ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancelarEdicaoCliente}
                          variant="secondary"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                        <Input
                          value={clienteEditData.nome || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, nome: e.target.value})}
                          className="text-sm"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                        <Input
                          value={formatTelefone(clienteEditData.telefone || '')}
                          onChange={(e) => setClienteEditData({...clienteEditData, telefone: e.target.value.replace(/\D/g, '')})}
                          className="text-sm"
                          placeholder="(11) 99999-9999"
                          maxLength={15}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                        <Input
                          value={formatCpfOrCnpj(clienteEditData.cpf_cnpj || '')}
                          onChange={(e) => setClienteEditData({...clienteEditData, cpf_cnpj: e.target.value.replace(/\D/g, '')})}
                          className="text-sm"
                          placeholder="000.000.000-00"
                          maxLength={18}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          type="email"
                          value={clienteEditData.email || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, email: e.target.value})}
                          className="text-sm"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      
                      {/* Separador de Endereço */}
                      <div className="sm:col-span-2">
                        <hr className="my-2 border-gray-300" />
                        <h5 className="text-xs font-semibold text-gray-700 mb-2">Endereço</h5>
                      </div>
                      
                      {/* CEP primeiro - com busca automática */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">CEP</label>
                        <div className="flex gap-2">
                          <Input
                            value={formatCep(clienteEditData.cep || '')}
                            onChange={(e) => setClienteEditData({...clienteEditData, cep: unformatCep(e.target.value)})}
                            onBlur={(e) => {
                              const cep = unformatCep(e.target.value);
                              if (cep.length === 8) handleBuscarCepEditCliente(cep);
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`text-sm flex-1 ${errosValidacao.cep_edit_cliente ? 'border-red-500' : ''}`}
                          />
                          {buscandoCepEditCliente && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando...
                            </div>
                          )}
                        </div>
                        {errosValidacao.cep_edit_cliente && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.cep_edit_cliente}</p>
                        )}
                      </div>
                      
                      {/* Rua/Logradouro */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                        <Input
                          value={clienteEditData.rua || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, rua: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da rua"
                        />
                      </div>
                      
                      {/* Número e Bairro */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
                        <Input
                          value={clienteEditData.numero || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, numero: e.target.value})}
                          className="text-sm"
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
                        <Input
                          value={clienteEditData.bairro || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, bairro: e.target.value})}
                          className="text-sm"
                          placeholder="Nome do bairro"
                        />
                      </div>
                      
                      {/* Município/Cidade e Estado */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Município/Cidade</label>
                        <Input
                          value={clienteEditData.cidade || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, cidade: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <select
                          value={clienteEditData.estado || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione</option>
                          {ESTADOS_BRASILEIROS.map(estado => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Complemento */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Complemento</label>
                        <Input
                          value={clienteEditData.complemento || ''}
                          onChange={(e) => setClienteEditData({...clienteEditData, complemento: e.target.value})}
                          className="text-sm"
                          placeholder="Apto, sala, etc"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seção 2: Local do Evento */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3">
                <h3 className="text-base font-bold text-white flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Local do Evento
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Local de Entrega <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    name="id_local"
                    value={criandoNovoLocal ? 'novo' : formData.id_local}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    disabled={editandoLocal || criandoNovoLocal}
                  >
                    <option value={0}>Selecione um local</option>
                    <option value="novo">➕ Criar Novo Local</option>
                    <option value={0} disabled>──────────────</option>
                    {locais.map(local => (
                      <option key={local.id_local} value={local.id_local}>
                        {local.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formulário de Criação de Novo Local */}
                {criandoNovoLocal && (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-green-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Criar Novo Local
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCriarNovoLocal}
                          disabled={salvandoLocal}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {salvandoLocal ? 'Salvando...' : 'Salvar Local'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancelarNovoLocal}
                          variant="secondary"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nome do Local <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={novoLocalData.nome || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, nome: e.target.value})}
                          className={`text-sm ${errosValidacao.nome_local ? 'border-red-500' : ''}`}
                          required
                        />
                        {errosValidacao.nome_local && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.nome_local}</p>
                        )}
                      </div>
                      
                      {/* CEP primeiro - com busca automática */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          CEP
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={formatCep(novoLocalData.cep || '')}
                            onChange={(e) => setNovoLocalData({...novoLocalData, cep: unformatCep(e.target.value)})}
                            onBlur={(e) => {
                              const cep = unformatCep(e.target.value);
                              if (cep.length === 8) handleBuscarCepLocal(cep);
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`text-sm flex-1 ${errosValidacao.cep_local ? 'border-red-500' : ''}`}
                          />
                          {buscandoCepLocal && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando...
                            </div>
                          )}
                        </div>
                        {errosValidacao.cep_local && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.cep_local}</p>
                        )}
                      </div>
                      
                      {/* Rua/Logradouro */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                        <Input
                          value={novoLocalData.rua || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, rua: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da rua"
                        />
                      </div>
                      
                      {/* Número e Bairro */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
                        <Input
                          value={novoLocalData.numero || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, numero: e.target.value})}
                          className="text-sm"
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
                        <Input
                          value={novoLocalData.bairro || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, bairro: e.target.value})}
                          className="text-sm"
                          placeholder="Nome do bairro"
                        />
                      </div>
                      
                      {/* Município/Cidade e Estado */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Município/Cidade</label>
                        <Input
                          value={novoLocalData.cidade || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, cidade: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <select
                          value={novoLocalData.estado || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Selecione</option>
                          {ESTADOS_BRASILEIROS.map(estado => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Complemento e Capacidade */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Complemento</label>
                        <Input
                          value={novoLocalData.complemento || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, complemento: e.target.value})}
                          className="text-sm"
                          placeholder="Apto, sala, etc"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Capacidade</label>
                        <Input
                          type="number"
                          value={novoLocalData.capacidade || ''}
                          onChange={(e) => setNovoLocalData({...novoLocalData, capacidade: parseInt(e.target.value) || 0})}
                          className="text-sm"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card de Informações do Local */}
                {localSelecionado && !editandoLocal && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-green-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Detalhes do Local Selecionado
                      </h4>
                      <Button
                        type="button"
                        onClick={handleEditarLocal}
                        variant="secondary"
                        size="sm"
                        className="bg-black hover:bg-gray-50 text-green-700 border-green-300"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {localSelecionado.endereco_completo && (
                        <div className="bg-white rounded px-3 py-2 sm:col-span-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Endereço</span>
                          <span className="text-gray-900">{localSelecionado.endereco_completo}</span>
                        </div>
                      )}
                      {localSelecionado.cidade && localSelecionado.estado && (
                        <div className="bg-white rounded px-3 py-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Cidade/Estado</span>
                          <span className="text-gray-900">{localSelecionado.cidade}/{localSelecionado.estado}</span>
                        </div>
                      )}
                      {localSelecionado.capacidade && (
                        <div className="bg-white rounded px-3 py-2">
                          <span className="font-medium text-gray-600 block text-xs mb-1">Capacidade</span>
                          <span className="text-gray-900">{localSelecionado.capacidade} pessoas</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulário de Edição do Local */}
                {localSelecionado && editandoLocal && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-amber-900 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Editando Dados do Local
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSalvarLocal}
                          disabled={salvandoLocal}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {salvandoLocal ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancelarEdicaoLocal}
                          variant="secondary"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Local</label>
                        <Input
                          value={localEditData.nome || ''}
                          onChange={(e) => setLocalEditData({...localEditData, nome: e.target.value})}
                          className="text-sm"
                        />
                      </div>
                      
                      {/* CEP primeiro - com busca automática */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">CEP</label>
                        <div className="flex gap-2">
                          <Input
                            value={formatCep(localEditData.cep || '')}
                            onChange={(e) => setLocalEditData({...localEditData, cep: unformatCep(e.target.value)})}
                            onBlur={(e) => {
                              const cep = unformatCep(e.target.value);
                              if (cep.length === 8) handleBuscarCepEditLocal(cep);
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                            className={`text-sm flex-1 ${errosValidacao.cep_edit_local ? 'border-red-500' : ''}`}
                          />
                          {buscandoCepEditLocal && (
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando...
                            </div>
                          )}
                        </div>
                        {errosValidacao.cep_edit_local && (
                          <p className="text-xs text-red-600 mt-1">{errosValidacao.cep_edit_local}</p>
                        )}
                      </div>
                      
                      {/* Rua/Logradouro */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                        <Input
                          value={localEditData.rua || ''}
                          onChange={(e) => setLocalEditData({...localEditData, rua: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da rua"
                        />
                      </div>
                      
                      {/* Número e Bairro */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Número</label>
                        <Input
                          value={localEditData.numero || ''}
                          onChange={(e) => setLocalEditData({...localEditData, numero: e.target.value})}
                          className="text-sm"
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Bairro</label>
                        <Input
                          value={localEditData.bairro || ''}
                          onChange={(e) => setLocalEditData({...localEditData, bairro: e.target.value})}
                          className="text-sm"
                          placeholder="Nome do bairro"
                        />
                      </div>
                      
                      {/* Município/Cidade e Estado */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Município/Cidade</label>
                        <Input
                          value={localEditData.cidade || ''}
                          onChange={(e) => setLocalEditData({...localEditData, cidade: e.target.value})}
                          className="text-sm"
                          placeholder="Nome da cidade"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado (UF)</label>
                        <select
                          value={localEditData.estado || ''}
                          onChange={(e) => setLocalEditData({...localEditData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Selecione</option>
                          {ESTADOS_BRASILEIROS.map(estado => (
                            <option key={estado.value} value={estado.value}>
                              {estado.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Complemento e Capacidade */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Complemento</label>
                        <Input
                          value={localEditData.complemento || ''}
                          onChange={(e) => setLocalEditData({...localEditData, complemento: e.target.value})}
                          className="text-sm"
                          placeholder="Apto, sala, etc"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Capacidade</label>
                        <Input
                          type="number"
                          value={localEditData.capacidade || ''}
                          onChange={(e) => setLocalEditData({...localEditData, capacidade: parseInt(e.target.value) || 0})}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Seção 4: Condições de Pagamento */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3">
                <h3 className="text-base font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Condições de Pagamento
                </h3>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Forma de Pagamento
                    </label>
                    <select
                      name="forma_pagamento"
                      value={formData.forma_pagamento}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="dinheiro">💵 Dinheiro</option>
                      <option value="pix">📱 PIX</option>
                      <option value="cartao_credito">💳 Cartão de Crédito</option>
                      <option value="cartao_debito">💳 Cartão de Débito</option>
                      <option value="boleto">🧾 Boleto</option>
                      <option value="transferencia">🏦 Transferência</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Caução (%)
                    </label>
                    <Input
                      type="number"
                      name="caucao_percentual"
                      value={formData.caucao_percentual}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full border-2 focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      Valor: R$ {calculateCaucao().toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Validade (dias)
                    </label>
                    <Input
                      type="number"
                      name="validade_dias"
                      value={formData.validade_dias}
                      onChange={handleChange}
                      min="1"
                      max="30"
                      className="w-full border-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 5: Valores Adicionais */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                <h3 className="text-base font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valores Adicionais (Opcional)
                </h3>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Frete */}
                  <div>
                    <label htmlFor="valor_frete" className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor do Frete (R$)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      id="valor_frete"
                      name="valor_frete"
                      value={formData.valor_frete}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full border-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Custo de entrega e retirada dos produtos</p>
                  </div>

                  {/* Desconto */}
                  <div>
                    <label htmlFor="valor_desconto" className="block text-sm font-semibold text-gray-700 mb-2">
                      Desconto (R$)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      id="valor_desconto"
                      name="valor_desconto"
                      value={formData.valor_desconto}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full border-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Desconto total a ser aplicado no orçamento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 6: Observações */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3">
                <h3 className="text-base font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Observações e Detalhes Adicionais
                </h3>
              </div>
              
              <div className="p-5">
                <Textarea
                  name="observacoes"
                  rows={4}
                  placeholder="Ex: Horário de montagem, instruções especiais, condições particulares, observações sobre o evento..."
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="w-full border-2 focus:ring-2 focus:ring-gray-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Direita - Resumo do Pedido */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-xl shadow-2xl overflow-hidden border-4 border-white">
                {/* Header do Resumo */}
                <div className="px-6 py-4 bg-black/10 border-b border-white/20">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Resumo do Pedido
                  </h3>
                  <p className="text-white/80 text-sm mt-1">{items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}</p>
                </div>
                
                {/* Lista de Itens */}
                <div className="bg-white p-6">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                    {produtosEditaveis.map((item, index) => {
                      if (!item || !item.produto) return null;
                      const dias = calcularDiasPeriodo();
                      const subtotal = Number(item.produto.valor_locacao || 0) * item.quantidade * dias;
                      const valorReposicao = Number(item.produto.valor_danificacao || 0) * item.quantidade;
                      return (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-2 flex-shrink-0">
                                  {index + 1}
                                </span>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                  {item.produto.nome}
                                </h4>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-green-600">
                                R$ {subtotal.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="ml-8 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quantidade:</span>
                              <span className="font-semibold text-gray-900">{item.quantidade} un.</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Período:</span>
                              <span className="font-semibold text-gray-900">{dias} {dias === 1 ? 'dia' : 'dias'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Valor/dia:</span>
                              <span className="font-semibold text-gray-900">R$ {Number(item.produto.valor_locacao || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray-200">
                              <span className="text-gray-600">Valor reposição:</span>
                              <span className="font-semibold text-orange-600">R$ {valorReposicao.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totais */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 border-t-4 border-blue-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Subtotal Locação</span>
                      <span className="text-base font-bold text-gray-900">R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Total Reposição</span>
                      <span className="text-base font-bold text-gray-900">R$ {calculateTotalReposicao().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-orange-300">
                      <span className="text-sm font-medium text-orange-700">
                        Caução ({formData.caucao_percentual}%)
                      </span>
                      <span className="text-base font-bold text-orange-600">R$ {calculateCaucao().toFixed(2)}</span>
                    </div>
                    
                    {/* Total Geral - Destaque */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-lg mt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="block text-xs text-green-100 font-medium mb-1">TOTAL A PAGAR</span>
                          <span className="text-2xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</span>
                        </div>
                        <svg className="w-10 h-10 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-xs text-blue-900 space-y-1">
                          <p><strong>Caução:</strong> {formData.caucao_percentual}% sobre valor total da locação</p>
                          <p><strong>Validade:</strong> {formData.validade_dias} {formData.validade_dias === 1 ? 'dia' : 'dias'} consecutivos</p>
                          <p><strong>Período:</strong> Diárias de 24 horas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação - Footer Fixo */}
        <div className="sticky bottom-0 bg-white border-t-4 border-gray-200 mt-8 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 shadow-2xl">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Seus dados estão seguros</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-8 py-3 text-base font-semibold"
              >
                ← Voltar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || carregandoOrcamento || produtosEditaveis.length === 0 || (idOrcamento && !orcamentoCarregado)}
                className="flex-1 sm:flex-none px-8 py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    {idOrcamento ? (
                      <>
                        Salvar Alterações
                        <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Criar Orçamento
                        <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Sucesso */}
      {showSucessoModal && orcamentoCriado && (
        <OrcamentoSucessoModal
          orcamentoId={orcamentoCriado}
          onClose={handleFecharModalSucesso}
          onGerarPDF={handleGerarPDF}
          onGerarAssinatura={handleGerarAssinatura}
        />
      )}
    </div>
  );
};

export default OrcamentoCheckoutForm;