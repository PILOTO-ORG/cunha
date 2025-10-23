import React, { useState } from 'react';
import interactionExamplesData from '../data/n8n-interaction-examples.json';

interface InteractionExample {
  pergunta: string;
  sql_query: string;
  resposta: string;
  categoria: string;
  success: boolean;
}

interface InteractionData {
  ai_prompt: any;
  interaction_examples: InteractionExample[];
  categories: string[];
  metadata: any;
}

const interactionExamples = interactionExamplesData as InteractionData;

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    // Simular processamento da IA
    setTimeout(() => {
      // Encontrar exemplo similar
      const examples = interactionExamples.interaction_examples;
      const similarExample = examples.find(example => 
        example.pergunta.toLowerCase().includes(query.toLowerCase()) ||
        (query.toLowerCase().includes('produto') && example.categoria === 'produtos') ||
        (query.toLowerCase().includes('cliente') && example.categoria === 'clientes') ||
        (query.toLowerCase().includes('orçamento') && example.categoria === 'orcamentos')
      );

      if (similarExample) {
        setResponse(similarExample.resposta.replace(/\\n/g, '\n'));
      } else {
        setResponse('Olá! Sou sua assistente virtual. Não encontrei informações específicas sobre sua consulta, mas posso ajudar com:\n\n• Consultas sobre produtos e estoque\n• Informações de clientes e reservas\n• Relatórios e orçamentos\n• Gestão de eventos e contratos\n\nPode reformular sua pergunta ou escolher uma das opções acima?');
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const filteredExamples = selectedCategory === 'all' 
    ? interactionExamples.interaction_examples
    : interactionExamples.interaction_examples.filter(ex => ex.categoria === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assistente IA</h3>
                <p className="text-sm text-gray-500">Sua assistente virtual para gestão</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Fechar</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Converse com o Assistente</h4>
              
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                {response ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {response}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Faça uma pergunta para começar...
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleQuery}
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Enviar'}
                </button>
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Exemplos de Interação</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="all">Todas</option>
                  {interactionExamples.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredExamples.slice(0, 6).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(example.pergunta);
                      setResponse(example.resposta.replace(/\\n/g, '\n'));
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-purple-600 font-medium">
                        {example.categoria}
                      </span>
                      <span className={`text-xs ${example.success ? 'text-green-500' : 'text-red-500'}`}>
                        {example.success ? '✓' : '✗'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {example.pergunta}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
