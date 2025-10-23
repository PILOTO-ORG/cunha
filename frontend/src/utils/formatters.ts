export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '-';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  
  return cpf;
};

export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  
  return cnpj;
};

export const safeFormatDate = (date: string | null | undefined): string => {
  if (!date || date === '') return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '';
  return parsedDate.toISOString().slice(0, 10);
};

export const isValidDate = (date: string | null | undefined): boolean => {
  if (!date || date === '') return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const formatDateTimeForInput = (date: string | null | undefined): string => {
  if (!date || date === '') return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '';
  
  // Para datetime-local, precisamos do formato YYYY-MM-DDTHH:mm
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
