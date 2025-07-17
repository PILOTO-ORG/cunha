import React, { useState, useEffect } from 'react';
import type { Reserva, CriarReservaRequest } from '../types/api';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';

interface ReservaFormProps {
  reserva?: Reserva;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CriarReservaRequest>({
    id_cliente: 0,
    id_produto: 0,
    data_inicio: '',
    data_fim: '',
    quantidade: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reserva) {
      setFormData({
        id_cliente: reserva.id_cliente ?? 0,
        id_produto: reserva.id_produto ?? 0,
        data_inicio: reserva.data_inicio.split('T')[0],
        data_fim: reserva.data_fim.split('T')[0],
        quantidade: reserva.quantidade,
      });
    }
  }, [reserva]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Aqui você deve chamar o service de criar/atualizar reserva
      // await ReservaService.criarReserva(formData);
      onSuccess();
    } catch (err: any) {
      setError('Erro ao salvar reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Cliente (ID)</label>
        <Input
          name="id_cliente"
          type="number"
          value={formData.id_cliente}
          onChange={handleChange}
          min={1}
          required
        />
      </div>
      <div>
        <label className="block font-medium">Produto (ID)</label>
        <Input
          name="id_produto"
          type="number"
          value={formData.id_produto}
          onChange={handleChange}
          min={1}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Data Início</label>
          <Input
            type="date"
            name="data_inicio"
            value={formData.data_inicio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Data Fim</label>
          <Input
            type="date"
            name="data_fim"
            value={formData.data_fim}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-medium">Quantidade</label>
        <Input
          type="number"
          name="quantidade"
          value={formData.quantidade}
          onChange={handleChange}
          min={1}
          required
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default ReservaForm;
