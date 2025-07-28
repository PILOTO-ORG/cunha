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
      icon: '�',
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
      icon: '�',
      color: 'green' as 'green',
    },
    {
      title: 'Total de Clientes',
      value: dashboardIndicators.data.total_clientes ?? '-',
      icon: '�',
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
      icon: '�',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

                      {/* Navigation Cards */}
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
              name: 'Produtos',
              description: 'Gerencie o catálogo e estoque',
              icon: '🛒',
              path: '/produtos',
              color: 'bg-blue-500'
              },
              {
              name: 'Clientes',
              description: 'Cadastro e histórico de clientes',
              icon: '👥',
              path: '/clientes',
              color: 'bg-green-500'
              },
              {
              name: 'Orçamentos',
              description: 'Criação e aprovação de orçamentos',
              icon: '📊',
              path: '/orcamentos',
              color: 'bg-yellow-500'
              },
              {
              name: 'Reservas',
              description: 'Controle de reservas e eventos',
              icon: '📅',
              path: '/reservas',
              color: 'bg-purple-500'
              }
            ].map((module) => (
              <Link
              key={module.name}
              to={module.path}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
              >
              <div className="flex items-center space-x-4">
                <div className={`${module.color} p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                <span className="text-xl text-white">{module.icon}</span>
                </div>
                <div>
                <h3 className="font-medium text-gray-900">{module.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel de Gestão
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bem-vindo ao sistema de locação de itens para eventos
              </p>
            </div> */}
            {/* <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span className="text-lg">🤖</span>
                <span>Nanda IA</span>
              </button>
              <Link
                to="/nanda"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Sobre a Nanda →
              </Link>
            </div> */}
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          {/* <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <QuickAction
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={action.color}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </div> */}

          {/* Recent Activity */}
          {/* <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        <span className="text-sm">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 rounded-b-lg">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Ver todas as atividades →
                </button>
              </div>
            </div>
          </div> */}
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

export default HomePage;
