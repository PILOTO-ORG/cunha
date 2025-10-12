import React, { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageGalleryViewerProps {
  images: string[];
  productName: string;
  mainImage?: string | null;
}

const ImageGalleryViewer: React.FC<ImageGalleryViewerProps> = ({ 
  images, 
  productName,
  mainImage 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = mainImage ? [mainImage, ...images] : images;

  if (allImages.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <PhotoIcon className="h-5 w-5" />
        <span>Sem imagens</span>
      </div>
    );
  }

  const getFullSrc = (src: string) => {
    return src.startsWith('http') || src.startsWith('/') 
      ? src 
      : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src}`;
  };

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeGallery();
  };

  return (
    <>
      {/* Grid de thumbnails */}
      <div className="flex flex-wrap gap-2">
        {allImages.map((image, index) => (
          <div 
            key={index}
            className="relative group cursor-pointer"
            onClick={() => openGallery(index)}
          >
            <img
              src={getFullSrc(image)}
              alt={`${productName} ${index + 1}`}
              className="h-16 w-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-300"
            />
            {index === 0 && mainImage && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                Principal
              </div>
            )}
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90"
          onClick={closeGallery}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="text-white">
              <p className="text-lg font-medium">{productName}</p>
              <p className="text-sm text-gray-300">
                Imagem {currentIndex + 1} de {allImages.length}
                {currentIndex === 0 && mainImage && ' (Principal)'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeGallery();
              }}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>

          {/* Imagem principal */}
          <div className="absolute inset-0 flex items-center justify-center p-16">
            <img
              src={getFullSrc(allImages[currentIndex])}
              alt={`${productName} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Navegação */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all duration-200 hover:scale-110"
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all duration-200 hover:scale-110"
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Thumbnails na parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex justify-center gap-2 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 ${
                    currentIndex === index 
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' 
                      : 'opacity-60 hover:opacity-100'
                  } transition-all duration-200`}
                >
                  <img
                    src={getFullSrc(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Indicador de teclas */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1.5 rounded-full">
            Use ← → para navegar ou ESC para fechar
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGalleryViewer;
