import React, { useState } from 'react';
import AIAssistant from '../components/AIAssistant';
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

const NandaPage: React.FC = () => {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredExamples = selectedCategory === 'all' 
    ? interactionExamples.interaction_examples
    : interactionExamples.interaction_examples.filter(ex => ex.categoria === selectedCategory);

  const categoryStats = interactionExamples.categories.map(category => {
    const categoryExamples = interactionExamples.interaction_examples.filter(ex => ex.categoria === category);
    const successRate = (categoryExamples.filter(ex => ex.success).length / categoryExamples.length) * 100;
    
    return {
      name: category,
      count: categoryExamples.length,
      successRate: Math.round(successRate)
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🤖</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Conheça a Nanda
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Sua assistente virtual inteligente para gestão completa do ERP de locação de itens para eventos.
              A Nanda pode responder perguntas, executar consultas e ajudar você a tomar decisões melhores.
            </p>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Conversar com a Nanda
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Capabilities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            O que a Nanda pode fazer por você
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '📊',
                title: 'Relatórios Inteligentes',
                description: 'Gere relatórios detalhados sobre faturamento, produtos mais alugados e performance do negócio'
              },
              {
                icon: '🔍',
                title: 'Consultas Rápidas',
                description: 'Encontre informações sobre produtos, clientes, estoque e reservas em segundos'
              },
              {
                icon: '⚠️',
                title: 'Alertas Automáticos',
                description: 'Receba avisos sobre estoque baixo, pagamentos pendentes e oportunidades de negócio'
              },
              {
                icon: '🎯',
                title: 'Análises Preditivas',
                description: 'Identifique tendências e oportunidades baseadas no histórico de dados'
              }
            ].map((capability, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="text-4xl mb-4">{capability.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{capability.title}</h3>
                <p className="text-gray-600 text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Estatísticas de Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {interactionExamples.interaction_examples.length}
              </div>
              <div className="text-sm text-gray-600">Exemplos de Interação</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((interactionExamples.interaction_examples.filter(ex => ex.success).length / interactionExamples.interaction_examples.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Sucesso</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {interactionExamples.categories.length}
              </div>
              <div className="text-sm text-gray-600">Categorias Cobertas</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Disponibilidade</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryStats.map((stat) => (
                <div key={stat.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {stat.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stat.count} exemplos
                  </div>
                  <div className={`text-sm font-medium mt-1 ${stat.successRate >= 90 ? 'text-green-600' : stat.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {stat.successRate}% sucesso
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Examples Gallery */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Exemplos de Interações
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Categorias</option>
                {interactionExamples.categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Testar Agora
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredExamples.slice(0, 6).map((example, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                    {example.categoria}
                  </span>
                  <span className={`text-sm ${example.success ? 'text-green-500' : 'text-red-500'}`}>
                    {example.success ? '✓ Sucesso' : '✗ Erro'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Pergunta:</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                    {example.pergunta}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resposta:</h4>
                  <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded line-clamp-4">
                    {example.resposta.replace(/\\n/g, ' ').substring(0, 200)}...
                  </p>
                </div>

                {example.sql_query && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-700">
                      SQL Query Executada
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredExamples.length > 6 && (
            <div className="text-center mt-8">
              <button 
                onClick={() => setShowAIAssistant(true)}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Ver mais exemplos na conversa →
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Pronto para experimentar a Nanda?
          </h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Descubra como nossa assistente IA pode transformar a gestão do seu negócio de locação de itens para eventos.
          </p>
          <button
            onClick={() => setShowAIAssistant(true)}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Começar Conversa
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />
    </div>
  );
};

export default NandaPage;
