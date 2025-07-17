import React from 'react';
import OrcamentoForm from './OrcamentoForm.tsx';
import { Orcamento } from '../types/api';

interface BudgetFormProps {
  budget?: Orcamento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSuccess, onCancel }) => {
  return (
    <OrcamentoForm
      orcamento={budget}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default BudgetForm;
