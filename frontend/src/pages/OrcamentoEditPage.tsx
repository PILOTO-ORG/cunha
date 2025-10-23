import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';

const OrcamentoEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(-1); // Volta para a página anterior
  };

  const handleCancel = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Editar Orçamento</h1>
      <OrcamentoCheckoutForm
        idOrcamento={id ? Number(id) : undefined}
        items={[]}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode="edit"
      />
    </div>
  );
};

export default OrcamentoEditPage;
