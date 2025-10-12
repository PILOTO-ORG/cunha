import React from 'react';
import { useParams } from 'react-router-dom';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';

const OrcamentoEditPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Editar Orçamento</h1>
      <OrcamentoCheckoutForm idOrcamento={id ? Number(id) : undefined} items={[]} onSuccess={() => {}} onCancel={() => {}} />
    </div>
  );
};

export default OrcamentoEditPage;
