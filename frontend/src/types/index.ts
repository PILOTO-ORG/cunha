export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  available: number;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cpf?: string;
  cnpj?: string;
  type: 'individual' | 'company';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
}

export interface Budget {
  id: string;
  clientId: string;
  client: Client;
  items: BudgetItem[];
  eventDate: string;
  eventAddress: string;
  totalValue: number;
  discount: number;
  finalValue: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'contracted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  budgetId: string;
  budget: Budget;
  contractNumber: string;
  signedAt?: string;
  deliveryDate: string;
  returnDate: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
