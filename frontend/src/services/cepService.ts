export interface CepApiResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const cepCache = new Map<string, CepApiResponse>();

export async function buscarEnderecoPorCep(cep: string): Promise<CepApiResponse> {
  const sanitized = (cep || '').replace(/\D/g, '').slice(0, 8);

  if (sanitized.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos');
  }

  if (cepCache.has(sanitized)) {
    return cepCache.get(sanitized)!;
  }

  const response = await fetch(`https://viacep.com.br/ws/${sanitized}/json/`);

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP informado.');
  }

  const data: CepApiResponse = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado na base dos Correios.');
  }

  cepCache.set(sanitized, data);
  return data;
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================

/**
 * Formata CEP: 12345678 → 12345-678
 */
export const formatCep = (cep: string): string => {
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Remove formatação do CEP: 12345-678 → 12345678
 */
export const unformatCep = (cep: string): string => {
  return cep.replace(/\D/g, '');
};

/**
 * Formata CPF: 12345678900 → 123.456.789-00
 */
export const formatCpf = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Formata CNPJ: 12345678000190 → 12.345.678/0001-90
 */
export const formatCnpj = (cnpj: string): string => {
  const numbers = cnpj.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

/**
 * Formata CPF ou CNPJ automaticamente
 */
export const formatCpfOrCnpj = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) return formatCpf(numbers);
  return formatCnpj(numbers);
};

/**
 * Formata telefone: 11999999999 → (11) 99999-9999 ou (11) 9999-9999
 */
export const formatTelefone = (telefone: string): string => {
  const numbers = telefone.replace(/\D/g, '');
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida formato de CEP brasileiro (8 dígitos)
 */
export const isValidCepFormat = (cep: string): boolean => {
  const numbers = unformatCep(cep);
  return numbers.length === 8 && /^\d{8}$/.test(numbers);
};

/**
 * Valida CPF com dígitos verificadores
 */
export const isValidCpf = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let rest;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(numbers.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(numbers.substring(10, 11))) return false;

  return true;
};

/**
 * Valida CNPJ com dígitos verificadores
 */
export const isValidCnpj = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;

  // Validação dos dígitos verificadores
  let tamanho = numbers.length - 2;
  let numeros = numbers.substring(0, tamanho);
  const digitos = numbers.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = numbers.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

/**
 * Valida CPF ou CNPJ
 */
export const isValidCpfOrCnpj = (documento: string): boolean => {
  const numbers = documento.replace(/\D/g, '');
  
  if (numbers.length === 11) return isValidCpf(numbers);
  if (numbers.length === 14) return isValidCnpj(numbers);
  
  return false;
};

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 */
export const isValidTelefone = (telefone: string): boolean => {
  const numbers = telefone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================
// LISTA DE ESTADOS
// ============================================

export const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];
