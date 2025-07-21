import React, { useState, useEffect } from 'react';
import type { Reserva, Produto } from '../types/api';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import { useProdutos } from '../hooks/useProdutos.ts';
import { useClientes } from '../hooks/useClientes.ts';

interface OrcamentoFormProps {
  orcamento?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
  locais: any[];
  onLocaisAtualizados?: (locais: any[]) => void;
}

interface ItemOrcamento {
  id_produto: number;
  quantidade: number;
}

const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ orcamento, onSuccess, onCancel, locais, onLocaisAtualizados }) => {
  // Estado para busca de produto por item
  const [buscasLocais, setBuscasLocais] = useState<string[]>([]);
  const [frete, setFrete] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [id_local, setIdLocal] = useState(0);
  // Modal de cadastro rápido
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', email: '', cpf_cnpj: '' });
  const [showNovoLocal, setShowNovoLocal] = useState(false);
  const [novoLocal, setNovoLocal] = useState({ descricao: '', endereco: '', capacidade: '', tipo: '' });
  // ...existing code...
  // Importação do serviço de orçamento
  // Se não existir, crie em src/services/OrcamentoService.ts
  // import OrcamentoService from '../services/OrcamentoService';
  const { data: produtosData } = useProdutos();
  const produtos: Produto[] = produtosData?.data || [];
  const { data: clientesData } = useClientes();
  const [clientes, setClientes] = useState<any[]>(clientesData?.data || []);

  // Atualiza clientes quando hook retorna
  useEffect(() => {
    setClientes(clientesData?.data || []);
  }, [clientesData]);
  // Locais agora vêm por props

  const [id_cliente, setIdCliente] = useState(orcamento?.id_cliente || 0);
  const [data_inicio, setDataInicio] = useState(orcamento?.data_inicio ? orcamento.data_inicio.split('T')[0] : '');
  const [data_fim, setDataFim] = useState(orcamento?.data_fim ? orcamento.data_fim.split('T')[0] : '');
  const [observacoes, setObservacoes] = useState(orcamento?.observacoes || '');
  const [itens, setItens] = useState<ItemOrcamento[]>(
    orcamento ? [{ id_produto: orcamento.id_produto, quantidade: orcamento.quantidade }] : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [produtoBusca, setProdutoBusca] = useState('');

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

  // Produtos filtrados para busca
  const produtosFiltrados = produtoBusca
    ? produtos.filter(p => p.nome.toLowerCase().includes(produtoBusca.toLowerCase()))
    : produtos;

  // Valor total do orçamento
  const valorItens = itens.reduce((total, item) => {
    const produto = produtos.find(p => p.id_produto === item.id_produto);
    if (produto && typeof produto.valor_locacao === 'number' && !isNaN(produto.valor_locacao)) {
      return total + (produto.valor_locacao * item.quantidade * diasReservados);
    }
    return total;
  }, 0);
  const valorTotal = Math.max(0, valorItens + frete - desconto);

  useEffect(() => {
    if (orcamento) {
      setIdCliente(orcamento.id_cliente || 0);
      setDataInicio(orcamento.data_inicio ? orcamento.data_inicio.split('T')[0] : '');
      setDataFim(orcamento.data_fim ? orcamento.data_fim.split('T')[0] : '');
      setObservacoes(orcamento.observacoes || '');
      setItens([{ id_produto: orcamento.id_produto, quantidade: orcamento.quantidade }]);
    }
  }, [orcamento]);

  const handleItemChange = (index: number, field: keyof ItemOrcamento, value: any) => {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === 'quantidade' ? Number(value) : Number(value) } : item
      )
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
    try {
      // Chamada à API para salvar orçamento
      const payload = {
        id_cliente,
        data_inicio,
        data_fim,
        observacoes,
        itens,
      };
      // Se não existir, crie src/services/OrcamentoService.ts com método salvarOrcamento
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Erro ao salvar orçamento');
      }
      onSuccess();
    } catch (err: any) {
      setError('Erro ao salvar orçamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Cliente</label>
        <select
          name="id_cliente"
          value={id_cliente}
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
                  const resp = await fetch('http://localhost:4000/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoCliente)
                  });
                  if (resp.ok) {
                    const novo = await resp.json();
                    setShowNovoCliente(false);
                    setNovoCliente({ nome: '', telefone: '', email: '', cpf_cnpj: '' });
                    fetch('http://localhost:4000/clientes')
                      .then(r => r.json())
                      .then(data => {
                        setClientes(data?.data || []);
                        setIdCliente(novo.data?.id_cliente || 0);
                      });
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
          {props.locais.map(local => (
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
                  const resp = await fetch('http://localhost:4000/locais', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (resp.ok) {
                    const novo = await resp.json();
                    setShowNovoLocal(false);
                    setNovoLocal({ descricao: '', endereco: '', capacidade: '', tipo: '' });
                    fetch('http://localhost:4000/locais')
                      .then(r => r.json())
                      .then(data => {
                        if (onLocaisAtualizados) onLocaisAtualizados(data?.data || []);
                        setIdLocal(novo.data?.id_local || 0);
                      });
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
          let valorUnit = 0;
          let preco;
          let valorItem;
          if (item.id_produto && item.id_produto !== 0 && produto && typeof produto.valor_locacao === 'number' && !isNaN(produto.valor_locacao)) {
            valorUnit = Number(produto.valor_locacao);
            preco = `R$ ${valorUnit.toFixed(2)}`;
            valorItem = `R$ ${(valorUnit * item.quantidade * diasReservados).toFixed(2)}`;
          } else {
            preco = 'R$ 0,00';
            valorItem = 'R$ 0,00';
          }
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
                  className="border rounded px-3 py-2 w-full"
                  list={`produtos-list-${idx}`}
                  autoComplete="off"
                  required
                  onBlur={e => {
                    // Se o valor digitado corresponder a um produto, seleciona
                    const prod = produtosDisponiveis.find(p => p.nome.toLowerCase() === e.target.value.toLowerCase());
                    if (prod) handleItemChange(idx, 'id_produto', prod.id_produto);
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
        Valor total do orçamento: R$ {valorTotal.toFixed(2)}
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
                    <td className="p-2 text-right">R$ {valorUnit.toFixed(2)}</td>
                    <td className="p-2 text-right">R$ {valorTotalItem.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default OrcamentoForm;