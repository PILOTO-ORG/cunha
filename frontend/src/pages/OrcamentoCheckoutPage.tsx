import React from 'react';
import { useParams } from 'react-router-dom';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';

const OrcamentoCheckoutPage: React.FC = () => {
  const { id } = useParams();
  // Aqui você pode buscar os itens do orçamento se necessário, ou passar vazio para o form buscar pelo id
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout do Orçamento</h1>
      <OrcamentoCheckoutForm idOrcamento={id ? Number(id) : undefined} items={[]} onSuccess={() => {}} onCancel={() => {}} />
    </div>
  );
};

export default OrcamentoCheckoutPage;
