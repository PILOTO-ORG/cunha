import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import RelatoriosPage from './pages/RelatoriosPage'; // Removido pois não existe
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles/index.css';

// Layout
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ClientsPage from './pages/ClientsPage';
// import BudgetsPage from './pages/OrcamentosPageNew';
import ReservasPage from './pages/ReservasPage';
import ReservaEditPage from './pages/ReservaEditPage';
import LocaisPage from './pages/LocaisPage';
import MovimentosPage from './pages/MovimentosPage';
import NotFoundPage from './pages/NotFoundPage';
import OrcamentosPageMarketplace from './pages/OrcamentosPageMarketplace';
import OrcamentosListPage from './pages/OrcamentosListPage';
import OrcamentoCreatePage from './pages/OrcamentoCreatePage';
import OrcamentoCheckoutPage from './pages/OrcamentoCheckoutPage';
import OrcamentoEditPage from './pages/OrcamentoEditPage';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Extend the Window interface to include the ENV property
declare global {
  interface Window {
    ENV: {
      NODE_ENV: 'development' | 'production';
    };
  }
}

// Initialize window.ENV if it doesn't exist
if (!window.ENV) {
  window.ENV = {
    NODE_ENV: (window as any).process?.env?.NODE_ENV === 'production' ? 'production' : 'development'
  };
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/produtos" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/orcamentos" element={<ProtectedRoute><OrcamentosListPage /></ProtectedRoute>} />
                <Route path="/orcamentos/create" element={<ProtectedRoute><OrcamentoCreatePage /></ProtectedRoute>} />
                <Route path="/orcamentos/:id/checkout" element={<ProtectedRoute><OrcamentoCheckoutPage /></ProtectedRoute>} />
                <Route path="/orcamentos/:id/edit" element={<ProtectedRoute><OrcamentoEditPage /></ProtectedRoute>} />
                <Route path='/orcamentos/marketplace' element={<ProtectedRoute><OrcamentosPageMarketplace /></ProtectedRoute>} />
                {/* <Route path='/orcamentos/editar/:id' element={<ProtectedRoute><EditarOrcamentoPage /></ProtectedRoute>} /> */}
                <Route path="/reservas" element={<ProtectedRoute><ReservasPage /></ProtectedRoute>} />
                <Route path="/reservas/:id/edit" element={<ProtectedRoute><ReservaEditPage /></ProtectedRoute>} />
                <Route path="/locais" element={<ProtectedRoute><LocaisPage /></ProtectedRoute>} />
                <Route path="/movimentos" element={<ProtectedRoute><MovimentosPage /></ProtectedRoute>} />
                {/* <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} /> */}
                <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
      {window.ENV.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
