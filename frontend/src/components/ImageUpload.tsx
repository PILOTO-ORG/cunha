import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  label?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = 'Imagem Principal',
  maxSizeMB = 5,
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setPreview(value);
      setImageError(false);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setImageError(false);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const getImageSrc = (src: string) => {
    if (src.startsWith('http') || src.startsWith('https')) {
      return src;
    }
    if (src.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src}`;
    }
    if (src.startsWith('data:')) {
      return src; // Base64
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          <span className="ml-1 text-xs font-normal text-gray-500">
            (máx. {maxSizeMB}MB)
          </span>
        </label>
      )}

      <div className="relative">
        {preview && !imageError ? (
          // Preview da imagem
          <div className="relative group">
            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm">
              <img
                src={getImageSrc(preview)}
                alt={label || 'Imagem do produto'}
                className="h-64 w-full object-contain bg-white"
                onError={() => {
                  console.error('Erro ao carregar imagem:', preview);
                  setImageError(true);
                }}
              />
              
              {/* Overlay ao passar o mouse */}
              {!disabled && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2">
                    <button
                      type="button"
                      onClick={handleClick}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Badge de sucesso */}
            <div className="absolute top-3 right-3">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                <CheckCircleIcon className="h-4 w-4" />
                Carregada
              </div>
            </div>
          </div>
        ) : (
          // Upload area
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative h-64 border-2 border-dashed rounded-xl
              flex flex-col items-center justify-center gap-3
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
              }
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            <div className={`
              p-4 rounded-full transition-all duration-200
              ${isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'}
            `}>
              <PhotoIcon className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            
            <div className="text-center px-4">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? (
                  <span className="text-blue-600">Solte a imagem aqui</span>
                ) : (
                  <>
                    <span className="text-blue-600 hover:text-blue-700">Clique para fazer upload</span>
                    {!disabled && <span className="text-gray-500"> ou arraste e solte</span>}
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF até {maxSizeMB}MB
              </p>
            </div>

            {isDragging && (
              <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none" />
            )}
          </div>
        )}

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
