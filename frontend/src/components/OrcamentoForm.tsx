import React, { useState, useEffect } from 'react';
import type { Reserva, Produto } from '../types/api';
import type { OrcamentoAgrupado } from '../types/orcamento';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import { useProdutos } from '../hooks/useProdutos.ts';
import { useClientes } from '../hooks/useClientes.ts';
import { jwtFetch } from '../services/jwtFetch.ts';
import { formatCurrency } from '../utils/formatters.ts';
// Access API URL from environment
declare const process: { env: { REACT_APP_API_URL?: string } };
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

type OrcamentoFormProps = {
  orcamento?: Reserva | OrcamentoAgrupado;
  onSuccess: () => void;
  onCancel: () => void;
  locais: any[];
  atualizarClientes?: () => void;
  atualizarLocais?: () => void;
};

interface ItemOrcamento {
  id_produto: number;
  quantidade: number;
}

const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ orcamento, onSuccess, onCancel, locais, atualizarClientes, atualizarLocais }) => {
  // Estado inicial e props
  const [buscasLocais, setBuscasLocais] = useState<string[]>([]);
  const [frete, setFrete] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [id_local, setIdLocal] = useState(0);
  
  // Modal de cadastro rápido
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '', cpf_cnpj: '' });
  const [showNovoLocal, setShowNovoLocal] = useState(false);
  const [novoLocal, setNovoLocal] = useState({ descricao: '', endereco: '', capacidade: '', tipo: '' });
  
  // Para armazenar IDs recém-criados
  const [novoIdLocal, setNovoIdLocal] = useState<number | null>(null);
  const [novoIdCliente, setNovoIdCliente] = useState<number | null>(null);

  // Hooks
  const { data: produtosData } = useProdutos();
  const produtos: Produto[] = produtosData?.data || [];
  const { data: clientesData } = useClientes();
  const [clientes, setClientes] = useState<any[]>(clientesData?.data || []);

  // Estado do formulário
  const [id_cliente, setIdCliente] = useState(0);
  const [data_inicio, setDataInicio] = useState('');
  const [data_fim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualiza clientes quando hook retorna
  useEffect(() => {
    setClientes(clientesData?.data || []);
  }, [clientesData]);

  // Seleciona automaticamente o local recém-criado quando a lista de locais muda
  useEffect(() => {
    if (novoIdLocal && locais.some(l => (l.id_local || l.id) === novoIdLocal)) {
      setIdLocal(novoIdLocal);
      setNovoIdLocal(null);
    }
  }, [locais, novoIdLocal]);

  // Seleciona automaticamente o cliente recém-criado quando a lista de clientes muda
  useEffect(() => {
    if (novoIdCliente && clientes.some(c => c.id_cliente === novoIdCliente)) {
      setIdCliente(novoIdCliente);
      setNovoIdCliente(null);
    }
  }, [clientes, novoIdCliente]);

  // Carrega dados do orçamento para edição
  useEffect(() => {
    if (orcamento) {
      if ('itens' in orcamento) {
        // OrcamentoAgrupado
        setIdCliente(orcamento.id_cliente || 0);
        // Busca id_local tanto no formato original quanto mapeado
        const localId = orcamento.id_local || (orcamento as any).id_local || 0;
        setIdLocal(localId);
        setDataInicio(orcamento.data_inicio ? orcamento.data_inicio.split('T')[0] : '');
        setDataFim(orcamento.data_fim ? orcamento.data_fim.split('T')[0] : '');
        setObservacoes(orcamento.observacoes || '');
        setFrete((orcamento as any).frete || 0);
        setDesconto((orcamento as any).desconto || 0);
        setItens(orcamento.itens.map(i => ({ id_produto: i.id_produto, quantidade: i.quantidade })));
        
        // Inicializa buscas locais com nomes dos produtos
        const buscas = orcamento.itens.map(item => item.produto_nome || '');
        setBuscasLocais(buscas);
        
        console.log('Carregando OrcamentoAgrupado para edição:', {
          id_reserva: orcamento.id_reserva,
          id_cliente: orcamento.id_cliente,
          id_local: localId,
          frete: (orcamento as any).frete,
          desconto: (orcamento as any).desconto,
          itens: orcamento.itens
        });
      } else {
        // Reserva individual
        setIdCliente(orcamento.id_cliente || 0);
        setIdLocal(orcamento.id_local || 0);
        setDataInicio(orcamento.data_inicio ? orcamento.data_inicio.split('T')[0] : '');
        setDataFim(orcamento.data_fim ? orcamento.data_fim.split('T')[0] : '');
        setObservacoes(orcamento.observacoes || '');
        setFrete(orcamento.frete || 0);
        setDesconto(orcamento.desconto || 0);
        setItens([{ id_produto: orcamento.id_produto, quantidade: orcamento.quantidade }]);
        
        // Inicializa busca local com nome do produto
        const produto = produtos.find(p => p.id_produto === orcamento.id_produto);
        setBuscasLocais([produto?.nome || '']);
        
        console.log('Carregando Reserva individual para edição:', {
          id_cliente: orcamento.id_cliente,
          id_local: orcamento.id_local,
          frete: orcamento.frete,
          desconto: orcamento.desconto
        });
      }
    } else {
      // Novo orçamento - inicializar com pelo menos um item
      if (itens.length === 0) {
        setItens([{ id_produto: 0, quantidade: 1 }]);
        setBuscasLocais(['']);
        console.log('Inicializando novo orçamento');
      }
    }
  }, [orcamento, produtos]);

  // Cálculo de dias
  const diasReservados = (() => {
    if (!data_inicio || !data_fim) return 0;
    const ini = new Date(data_inicio);
    const fim = new Date(data_fim);
    const diff = Math.ceil((fim.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  // Validação de datas
  const dataHoje = new Date();
  const dataInicioValida = data_inicio && new Date(data_inicio) > dataHoje;
  const dataFimValida = data_fim && new Date(data_fim) > dataHoje;
  const periodoValido = diasReservados > 0 && diasReservados <= 30;

  // Valor total do orçamento
  const valorItens = itens.reduce((total, item) => {
    // Só calcula se temos um produto válido selecionado
    if (!item.id_produto || item.id_produto === 0) return total;
    
    const produto = produtos.find(p => p.id_produto === item.id_produto);
    if (!produto || !produto.valor_locacao) return total;
    
    const valorLocacao = Number(produto.valor_locacao);
    const quantidade = Number(item.quantidade) || 0;
    
    if (isNaN(valorLocacao) || quantidade <= 0) return total;
    
    return total + (valorLocacao * quantidade * diasReservados);
  }, 0);
  const valorTotal = Math.max(0, Number(valorItens) + Number(frete) - Number(desconto));

  // Debug do cálculo do valor total
  console.log('Cálculo do valor total:', {
    itens: itens.map(item => ({
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      produto: produtos.find(p => p.id_produto === item.id_produto)?.nome,
      valor_locacao: produtos.find(p => p.id_produto === item.id_produto)?.valor_locacao
    })),
    diasReservados,
    valorItens,
    frete,
    desconto,
    valorTotal
  });

  const handleItemChange = (index: number, field: keyof ItemOrcamento, value: any) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        
        const newValue = field === 'id_produto' ? Number(value) : Number(value) || 0;
        return { ...item, [field]: newValue };
      })
    );
  };

  const handleAddItem = () => {
    setItens([...itens, { id_produto: 0, quantidade: 1 }]);
    setBuscasLocais([...buscasLocais, '']);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
    setBuscasLocais(buscasLocais.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!dataInicioValida || !dataFimValida || !periodoValido) {
      setError('Selecione datas futuras e período de até 30 dias.');
      setLoading(false);
      return;
    }
    
    // Validação básica dos itens
    if (itens.length === 0) {
      setError('Adicione pelo menos um item ao orçamento.');
      setLoading(false);
      return;
    }
    
    const itensInvalidos = itens.filter(item => {
      if (!item.id_produto || item.quantidade <= 0) return true;
      const produto = produtos.find(p => p.id_produto === item.id_produto);
      return !produto || !produto.valor_locacao;
    });
    if (itensInvalidos.length > 0) {
      setError('Todos os itens devem ter produto válido selecionado e quantidade maior que zero.');
      setLoading(false);
      return;
    }
    
    try {
      const isEdicao = orcamento && ('itens' in orcamento ? orcamento.id_reserva : false);
      
      console.log('Enviando orçamento:', {
        isEdicao,
        id_reserva: isEdicao ? orcamento.id_reserva : null,
        id_cliente,
        id_local,
        data_inicio,
        data_fim,
        frete,
        desconto,
        itens
      });
      
      // Preparar payload dos itens
      const itensPayload = itens.map(item => ({
        id_cliente,
        id_local,
        data_inicio,
        data_fim,
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        status: 'iniciada',
        observacoes,
        frete,
        desconto
      }));
      
      let response;
      
      if (isEdicao) {
        // Atualizar orçamento existente
        response = await jwtFetch(`${API_URL}/reservas/atualizar-orcamento`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            id_reserva: orcamento.id_reserva,
            itens: itensPayload 
          }),
        });
      } else {
        // Criar novo orçamento
        response = await jwtFetch(`${API_URL}/reservas/orcamento-multiplo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itens: itensPayload }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', response.status, errorData);
        throw new Error(`Erro ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Erro ao salvar orçamento');
      }
    } catch (err: any) {
      console.error('Erro ao salvar orçamento:', err);
      setError(`Erro ao salvar orçamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form id="orcamento-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Cliente</label>
        <select
          name="id_cliente"
          value={id_cliente || 0}
          onChange={e => {
            if (e.target.value === 'novo') {
              setShowNovoCliente(true);
              return;
            }
            setIdCliente(Number(e.target.value));
          }}
          className="border rounded px-2 py-1 w-full"
          required
        >
          <option value={0}>Selecione</option>
          {clientes.map(cliente => (
            <option key={cliente.id_cliente} value={cliente.id_cliente}>
              {cliente.nome}
            </option>
          ))}
          <option value="novo">+ Novo cliente...</option>
        </select>
        {showNovoCliente && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h3 className="font-bold mb-2">Novo Cliente</h3>
              <input type="text" placeholder="Nome" value={novoCliente.nome} onChange={e => setNovoCliente(c => ({ ...c, nome: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" autoFocus />
              <input type="text" placeholder="Telefone" value={novoCliente.telefone} onChange={e => setNovoCliente(c => ({ ...c, telefone: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" />
              <input type="email" placeholder="Email" value={novoCliente.email} onChange={e => setNovoCliente(c => ({ ...c, email: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" />
              <input type="text" placeholder="CPF/CNPJ" value={novoCliente.cpf_cnpj} onChange={e => setNovoCliente(c => ({ ...c, cpf_cnpj: e.target.value }))} className="border rounded px-2 py-1 w-full mb-3" />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowNovoCliente(false); setNovoCliente({ nome: '', telefone: '', email: '', cpf_cnpj: '' }); }}>Cancelar</Button>
                <Button type="button" onClick={async () => {
                  if (!novoCliente.nome.trim()) return;
                  const resp = await jwtFetch(`${API_URL}/clientes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoCliente)
                  });
                  if (resp.ok) {
                    const novo = await resp.json();
                    setShowNovoCliente(false);
                    setNovoCliente({ nome: '', telefone: '', email: '', cpf_cnpj: '' });
                    const clientesResp = await jwtFetch(`${API_URL}/clientes`);
                    if (clientesResp.ok) {
                      const data = await clientesResp.json();
                      setClientes(data?.data || []);
                      setNovoIdCliente(novo.data?.id_cliente || 0);
                      if (atualizarClientes) atualizarClientes();
                    }
                  }
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block font-medium">Local</label>
        <select
          name="id_local"
          value={id_local}
          onChange={e => {
            if (e.target.value === 'novo') {
              setShowNovoLocal(true);
              return;
            }
            setIdLocal(Number(e.target.value));
          }}
          className="border rounded px-2 py-1 w-full"
          required
        >
          <option value={0}>Selecione</option>
          {locais.map(local => (
            <option key={local.id_local} value={local.id_local}>
              {local.descricao || local.nome}
            </option>
          ))}
          <option value="novo">+ Novo local...</option>
        </select>
        {showNovoLocal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h3 className="font-bold mb-2">Novo Local</h3>
              <input type="text" placeholder="Descrição" value={novoLocal.descricao} onChange={e => setNovoLocal(l => ({ ...l, descricao: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" autoFocus />
              <input type="text" placeholder="Endereço" value={novoLocal.endereco} onChange={e => setNovoLocal(l => ({ ...l, endereco: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" />
              <input type="number" placeholder="Capacidade" value={novoLocal.capacidade} onChange={e => setNovoLocal(l => ({ ...l, capacidade: e.target.value }))} className="border rounded px-2 py-1 w-full mb-2" />
              <input type="text" placeholder="Tipo (ex: salao, externa)" value={novoLocal.tipo} onChange={e => setNovoLocal(l => ({ ...l, tipo: e.target.value }))} className="border rounded px-2 py-1 w-full mb-3" />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowNovoLocal(false); setNovoLocal({ descricao: '', endereco: '', capacidade: '', tipo: '' }); }}>Cancelar</Button>
                <Button type="button" onClick={async () => {
                  if (!novoLocal.descricao.trim()) return;
                  const payload = { ...novoLocal, capacidade: novoLocal.capacidade ? Number(novoLocal.capacidade) : undefined };
                  const resp = await jwtFetch(`${API_URL}/locais`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (resp.ok) {
                    const novo = await resp.json();
                    setShowNovoLocal(false);
                    setNovoLocal({ descricao: '', endereco: '', capacidade: '', tipo: '' });
                    // Atualização automática: seleciona o novo local quando a lista de locais recebida por prop for atualizada
                    setNovoIdLocal(novo.data?.id_local || 0);
                    if (atualizarLocais) atualizarLocais();
                  }
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block font-medium">Data Início</label>
          <Input
            type="date"
            name="data_inicio"
            value={data_inicio}
            onChange={e => setDataInicio(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Data Fim</label>
          <Input
            type="date"
            name="data_fim"
            value={data_fim}
            onChange={e => setDataFim(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <span className="block font-medium">Dias reservados:</span>
          <span className="text-blue-700 font-bold">{diasReservados}</span>
        </div>
      </div>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block font-medium">Frete (R$)</label>
          <Input
            type="number"
            name="frete"
            value={frete}
            min={0}
            onChange={e => setFrete(Number(e.target.value))}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Desconto (R$)</label>
          <Input
            type="number"
            name="desconto"
            value={desconto}
            min={0}
            onChange={e => setDesconto(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>
      {!dataInicioValida && data_inicio && (
        <div className="text-red-500">A data de início deve ser futura.</div>
      )}
      {!dataFimValida && data_fim && (
        <div className="text-red-500">A data de fim deve ser futura.</div>
      )}
      {!periodoValido && data_inicio && data_fim && (
        <div className="text-red-500">O período deve ser de até 30 dias.</div>
      )}
      <div>
        <label className="block font-medium mb-2">Itens do Orçamento</label>
        {itens.map((item, idx) => {
          const produto = produtos.find(p => p.id_produto === item.id_produto);
          
          // Busca local para este item
          // Se houver produto selecionado, sincroniza o campo de busca com o nome do produto
          let buscaLocal = buscasLocais[idx] || '';
          if (item.id_produto && item.id_produto !== 0 && produto && buscaLocal !== produto.nome) {
            buscaLocal = produto.nome;
            const novasBuscas = [...buscasLocais];
            novasBuscas[idx] = produto.nome;
            setBuscasLocais(novasBuscas);
          }
          const handleBuscaLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const novasBuscas = [...buscasLocais];
            novasBuscas[idx] = e.target.value;
            setBuscasLocais(novasBuscas);
            // Se o valor digitado corresponder a um produto, seleciona automaticamente
            const prod = produtos.find(p => p.nome.toLowerCase() === e.target.value.toLowerCase());
            if (prod) handleItemChange(idx, 'id_produto', prod.id_produto);
          };
          // Produtos disponíveis para seleção (exclui os já selecionados, exceto o atual)
          let produtosDisponiveis = produtos.filter(p =>
            p.id_produto === item.id_produto || !itens.some((it, i) => i !== idx && it.id_produto === p.id_produto)
          );
          if (buscaLocal) {
            produtosDisponiveis = produtosDisponiveis.filter(p => p.nome.toLowerCase().includes(buscaLocal.toLowerCase()));
          }
          return (
            <div key={idx} className="flex items-center gap-4 mb-3">
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Selecione ou busque..."
                  value={buscaLocal}
                  onChange={handleBuscaLocalChange}
                  className={`border rounded px-3 py-2 w-full ${
                    item.id_produto === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  list={`produtos-list-${idx}`}
                  autoComplete="off"
                  required
                  onBlur={e => {
                    // Se o valor digitado corresponder a um produto, seleciona
                    const prod = produtosDisponiveis.find(p => p.nome.toLowerCase() === e.target.value.toLowerCase());
                    if (prod) {
                      handleItemChange(idx, 'id_produto', prod.id_produto);
                    } else if (e.target.value && !prod) {
                      // Se digitou algo mas não encontrou produto, limpa a seleção
                      handleItemChange(idx, 'id_produto', 0);
                    }
                  }}
                />
                <datalist id={`produtos-list-${idx}`}>
                  <option value="Selecione" />
                  {produtosDisponiveis.map(prod => (
                    <option key={prod.id_produto} value={prod.nome} />
                  ))}
                </datalist>
              </div>
              <Input
                type="number"
                name="quantidade"
                value={item.quantidade || ''}
                onChange={e => handleItemChange(idx, 'quantidade', e.target.value)}
                min={1}
                className="w-24 border rounded px-3 py-2 text-right"
                required
              />
              <Button type="button" variant="outline" onClick={() => handleRemoveItem(idx)} className="ml-2">
                Remover
              </Button>
            </div>
          );
        })}
        <Button type="button" variant="primary" onClick={handleAddItem}>
          Adicionar Item
        </Button>
      </div>
      <div>
        <label className="block font-medium">Observações</label>
        <textarea
          name="observacoes"
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
          rows={2}
        />
      </div>
      <div className="mt-4 text-lg font-bold text-blue-800">
        Valor total do orçamento: {formatCurrency(valorTotal)}
      </div>
      {/* Resumo dos itens do orçamento */}
      {itens.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-gray-700">Resumo dos itens:</h3>
          <table className="w-full text-sm border rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Produto</th>
                <th className="p-2 text-right">Qtd</th>
                <th className="p-2 text-right">Valor unitário</th>
                <th className="p-2 text-right">Valor total</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, idx) => {
                const produto = produtos.find(p => p.id_produto === item.id_produto);
                if (!produto) return null;
                const valorUnit = Number(produto.valor_locacao) || 0;
                const valorTotalItem = valorUnit * item.quantidade * diasReservados;
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{produto.nome}</td>
                    <td className="p-2 text-right">{item.quantidade}</td>
                    <td className="p-2 text-right">{formatCurrency(valorUnit)}</td>
                    <td className="p-2 text-right">{formatCurrency(valorTotalItem)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={3} className="p-2 text-right font-medium">Subtotal dos itens:</td>
                <td className="p-2 text-right font-medium">{formatCurrency(valorItens)}</td>
              </tr>
              {frete > 0 && (
                <tr>
                  <td colSpan={3} className="p-2 text-right">Frete:</td>
                  <td className="p-2 text-right">+ {formatCurrency(frete)}</td>
                </tr>
              )}
              {desconto > 0 && (
                <tr>
                  <td colSpan={3} className="p-2 text-right">Desconto:</td>
                  <td className="p-2 text-right">- {formatCurrency(desconto)}</td>
                </tr>
              )}
              <tr className="border-t">
                <td colSpan={3} className="p-2 text-right font-bold">Total Final:</td>
                <td className="p-2 text-right font-bold text-blue-700">{formatCurrency(valorTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
};

export default OrcamentoForm;