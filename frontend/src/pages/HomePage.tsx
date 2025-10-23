import React, { useState, useEffect } from 'react';
import DashboardService from '../services/dashboardService';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard';
import AIAssistant from '../components/AIAssistant';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showAIAssistant, setShowAIAssistant] = useState(false);


  // Novo estado para indicadores do dashboard
  const [dashboardIndicators, setDashboardIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    DashboardService.obterDadosDashboard()
      .then(data => {
        setDashboardIndicators(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Erro ao carregar dashboard');
        setLoading(false);
      });
  }, []);

  const dashboardData = dashboardIndicators ? [
    {
      title: 'Orçamentos Pendentes',
      value: dashboardIndicators.orcamentos_pendentes ?? '0',
      icon: '📄',
      color: 'yellow' as const,
      onClick: () => navigate('/orcamentos')
    },
    {
      title: 'Reservas Ativas',
      value: dashboardIndicators.reservas_ativas ?? '0',
      icon: '📅',
      color: 'blue' as const,
      onClick: () => navigate('/reservas')
    },
    {
      title: 'Viagens Hoje',
      value: dashboardIndicators.viagens_hoje ?? '0',
      icon: '🚌',
      color: 'green' as const,
    },
    {
      title: 'Total de Clientes',
      value: dashboardIndicators.total_clientes ?? '0',
      icon: '👥',
      color: 'indigo' as const,
      onClick: () => navigate('/clientes')
    },
    {
      title: 'Total de Locais',
      value: dashboardIndicators.total_locais ?? '0',
      icon: '🏢',
      color: 'purple' as const,
      onClick: () => navigate('/locais')
    },
    {
      title: 'Total de Produtos',
      value: dashboardIndicators.total_produtos ?? '0',
      icon: '📦',
      color: 'blue' as const,
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Produtos Incompletos',
      value: dashboardIndicators.produtos_campos_faltando ?? '0',
      icon: '⚠️',
      color: 'red' as const,
      onClick: () => navigate('/produtos?filtro=incompletos')
    },
    {
      title: 'Reservas Finalizando Hoje',
      value: dashboardIndicators.reservas_fim_hoje ?? '0',
      icon: '⏰',
      color: 'yellow' as const,
      onClick: () => navigate('/reservas?filtro=finalizando-hoje')
    },
    {
      title: 'Reservas Concluídas',
      value: dashboardIndicators.reservas_concluidas ?? '0',
      icon: '✅',
      color: 'green' as const,
      onClick: () => navigate('/reservas?filtro=concluidas')
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 px-2">Módulos do Sistema</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[ 
            {
              name: 'Produtos',
              description: 'Gerencie o catálogo e estoque',
              icon: '🛒',
              path: '/produtos',
              color: 'bg-blue-500 hover:bg-blue-600',
              bgHover: 'hover:bg-blue-50'
            },
            {
              name: 'Clientes',
              description: 'Cadastro e histórico de clientes',
              icon: '👥',
              path: '/clientes',
              color: 'bg-green-500 hover:bg-green-600',
              bgHover: 'hover:bg-green-50'
            },
            {
              name: 'Locais',
              description: 'Gerenciar locais de eventos',
              icon: '🏢',
              path: '/locais',
              color: 'bg-indigo-500 hover:bg-indigo-600',
              bgHover: 'hover:bg-indigo-50'
            },
            {
              name: 'Orçamentos',
              description: 'Criação e aprovação de orçamentos',
              icon: '📊',
              path: '/orcamentos',
              color: 'bg-yellow-500 hover:bg-yellow-600',
              bgHover: 'hover:bg-yellow-50'
            },
            {
              name: 'Reservas',
              description: 'Controle de reservas e eventos',
              icon: '📅',
              path: '/reservas',
              color: 'bg-purple-500 hover:bg-purple-600',
              bgHover: 'hover:bg-purple-50'
            },
            {
              name: 'Movimentos',
              description: 'Anotar entrada e saídas',
              icon: '➕',
              path: '/movimentos',
              color: 'bg-indigo-500 hover:bg-indigo-600',
              bgHover: 'hover:bg-indigo-50'
            }
          ].map((module) => (
            <Link
              key={module.name}
              to={module.path}
              className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center ${module.bgHover} transform hover:-translate-y-1 active:translate-y-0`}
            >
              <div className={`${module.color} p-3 sm:p-4 rounded-full mb-3 sm:mb-4 transition-all duration-300 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16`}>
                <span className="text-2xl sm:text-3xl">{module.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 sm:mb-1.5">{module.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight px-1 hidden sm:block">{module.description}</p>
            </Link>
          ))}
            </div>
          </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 px-2">Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardData.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={loading ? 'Carregando...' : error ? 'Erro' : card.value}
              icon={card.icon}
              color={card.color}
              onClick={card.onClick}
            />
          ))}
        </div>
      </div>
      <AIAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />
        </div>
  );
};

export default HomePage;
