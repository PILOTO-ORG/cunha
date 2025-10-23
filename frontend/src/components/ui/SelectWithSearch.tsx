import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string | number;
  label: string;
  searchText?: string;
}

interface SelectWithSearchProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string | number | null;
  onChange: (value: string | number | null) => void;
  onSearchChange?: (search: string) => void;
  loading?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  label,
  placeholder = "Buscar...",
  options,
  value,
  onChange,
  onSearchChange,
  loading = false,
  error,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado na busca
  const filteredOptions = options.filter(option =>
    !search ||
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    (option.searchText && option.searchText.toLowerCase().includes(search.toLowerCase()))
  );

  // Encontrar a opção selecionada
  const selectedOption = options.find(option => option.value === value);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focar no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    onSearchChange?.(newSearch);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : ''}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            flex items-center justify-between
          `}
        >
          <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? selectedOption.label : (placeholder || 'Selecione...')}
          </span>
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base border border-gray-300 overflow-auto focus:outline-none">
            {/* Search Input */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-auto">
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  Carregando...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  {search ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
                </div>
              ) : (
                <>
                  {/* Opção para limpar seleção */}
                  {value && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      Limpar seleção
                    </button>
                  )}

                  {/* Opções filtradas */}
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full text-left px-3 py-2 text-sm hover:bg-gray-100 hover:text-gray-900
                        ${option.value === value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SelectWithSearch;