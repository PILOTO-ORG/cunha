import React, { useState, useEffect } from 'react';
import DashboardService from '../services/dashboardService.ts';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/DashboardCard.tsx';
import QuickAction from '../components/QuickAction.tsx';
import AIAssistant from '../components/AIAssistant.tsx';

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

  const dashboardData = dashboardIndicators && dashboardIndicators.data ? [
    {
      title: 'Reservas que Acabam Hoje',
      value: dashboardIndicators.data.reservas_fim_hoje ?? '-',
      icon: '⏰',
      color: 'yellow' as 'yellow',
    },
    {
      title: 'Reservas Concluídas',
      value: dashboardIndicators.data.reservas_concluidas ?? '-',
      icon: '✅',
      color: 'green' as 'green',
    },
    {
      title: 'Orçamentos Pendentes',
      value: dashboardIndicators.data.orcamentos_pendentes ?? '-',
      icon: '📄',
      color: 'yellow' as 'yellow',
    },
    {
      title: 'Reservas Ativas',
      value: dashboardIndicators.data.reservas_ativas ?? '-',
      icon: '📅',
      color: 'blue' as 'blue',
    },
    {
      title: 'Viagens Hoje',
      value: dashboardIndicators.data.viagens_hoje ?? '-',
      icon: '🚌',
      color: 'green' as 'green',
    },
    {
      title: 'Total de Clientes',
      value: dashboardIndicators.data.total_clientes ?? '-',
      icon: '👥',
      color: 'indigo' as 'indigo',
    },
    {
      title: 'Total de Locais',
      value: dashboardIndicators.data.total_locais ?? '-',
      icon: '🏢',
      color: 'purple' as 'purple',
    },
    {
      title: 'Total de Produtos Diferentes',
      value: dashboardIndicators.data.total_produtos ?? '-',
      icon: '📦',
      color: 'blue' as 'blue',
    },
    {
      title: 'Produtos com Campos Faltando',
      value: dashboardIndicators.data.produtos_campos_faltando ?? '-',
      icon: '⚠️',
      color: 'red' as 'red',
    }
  ] : [];

  const quickActions = [
    {
      title: 'Nova Reserva',
      description: 'Criar uma nova reserva para cliente',
      icon: '➕',
      color: 'blue' as const,
      onClick: () => navigate('/reservas/nova')
    },
    {
      title: 'Consultar Estoque',
      description: 'Verificar disponibilidade de produtos',
      icon: '🔍',
      color: 'green' as const,
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Aprovar Orçamentos',
      description: 'Revisar orçamentos pendentes',
      icon: '✅',
      color: 'yellow' as const,
      onClick: () => navigate('/orcamentos')
    },
    {
      title: 'Converse com Nanda',
      description: 'Assistente IA para consultas',
      icon: '🤖',
      color: 'purple' as const,
      onClick: () => setShowAIAssistant(true)
    }
  ];

  const recentActivity = [
    { 
      id: 1, 
      type: 'reserva', 
      description: 'Nova reserva criada - Casamento Silva', 
      time: '2 min atrás',
      status: 'success'
    },
    { 
      id: 2, 
      type: 'pagamento', 
      description: 'Pagamento recebido - R$ 3.200,00', 
      time: '15 min atrás',
      status: 'success'
    },
    { 
      id: 3, 
      type: 'estoque', 
      description: 'Estoque baixo - Cadeiras Tiffany', 
      time: '1 hora atrás',
      status: 'warning'
    },
    { 
      id: 4, 
      type: 'cliente', 
      description: 'Novo cliente cadastrado - Maria Santos', 
      time: '2 horas atrás',
      status: 'info'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reserva': return '📅';
      case 'pagamento': return '💰';
      case 'estoque': return '📦';
      case 'cliente': return '👤';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

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
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center ${module.bgHover} transform hover:-translate-y-1 active:translate-y-0`}
            >
              <div className={`${module.color} p-4 rounded-full mb-4 transition-all duration-300 flex items-center justify-center w-16 h-16`}>
                <span className="text-3xl">{module.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1.5">{module.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight px-1">{module.description}</p>
            </Link>
          ))}
            </div>
          </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {dashboardData.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={loading ? 'Carregando...' : error ? 'Erro' : card.value}
              icon={card.icon}
              color={card.color}
              onClick={() => {
                if (card.title.includes('Reservas')) navigate('/reservas');
                if (card.title.includes('Produtos')) navigate('/produtos');
                if (card.title.includes('Clientes')) navigate('/clientes');
                if (card.title.includes('Orçamentos')) navigate('/orcamentos');
              }}
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
