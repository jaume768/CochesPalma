'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Función auxiliar para normalizar los datos de imágenes
const normalizeImageData = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  // Convertir cada imagen a un formato consistente con propiedad url
  return images.map(img => {
    // Si es un string, asumimos que es directamente la URL
    if (typeof img === 'string') {
      return { url: img };
    }
    // Si ya tiene propiedad url, la dejamos como está
    if (img.url) {
      return img;
    }
    // Si tiene otra propiedad como src o path, la adaptamos
    if (img.src) {
      return { url: img.src };
    }
    if (img.path) {
      return { url: img.path };
    }
    // Si tiene ruta relativa y no comienza con http o /
    if (img.ruta && typeof img.ruta === 'string') {
      return { url: img.ruta.startsWith('http') || img.ruta.startsWith('/') ? img.ruta : `/${img.ruta}` };
    }
    
    // Caso fallback: devolver un objeto vacío
    return { url: null };
  });
};

/**
 * Componente de galería de imágenes para la página de detalle de vehículo
 * @param {object} props - Propiedades del componente
 * @param {array} props.images - Array de URLs de imágenes
 * @param {string} props.brand - Marca del vehículo
 * @param {string} props.model - Modelo del vehículo
 */
export default function VehicleImageGallery({ images, brand, model }) {
  const normalized = normalizeImageData(images); // tu función de normalización
  const imgs = normalized.length ? normalized : [{ url: '/images/no-image.png' }];
  
  // Estado para el carrusel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estado para manejar los eventos de swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Comprobar al cargar
    handleResize();
    
    // Listener para cambio de tamaño
    window.addEventListener('resize', handleResize);
    
    // Limpiar listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Manejar inicio del swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  // Manejar final del swipe
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  // Procesar el swipe cuando se suelta el dedo
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSignificantSwipe = Math.abs(distance) > 50; // Umbral mínimo para considerar swipe válido
    
    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swipe hacia la izquierda -> siguiente imagen
        nextSlide();
      } else {
        // Swipe hacia la derecha -> imagen anterior
        prevSlide();
      }
    }
    
    // Resetear los valores
    setTouchStart(0);
    setTouchEnd(0);
  };
  
  // Navegar al siguiente slide
  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % imgs.length);
  };
  
  // Navegar al slide anterior
  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + imgs.length) % imgs.length);
  };

  // Renderizado condicional: carrusel para móvil, galería vertical para escritorio
  if (isMobile) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.carousel}>
          <div 
            className={styles.carouselSlide}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={imgs[activeIndex].url}
              alt={`${brand} ${model} foto ${activeIndex + 1}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = '/images/no-image.png'; }}
              priority={true}
              draggable={false} // Evitar que la imagen sea arrastrable
            />
          </div>
          
          {/* Indicadores de slides */}
          <div className={styles.carouselIndicators}>
            {imgs.map((_, i) => (
              <span 
                key={i} 
                className={`${styles.carouselIndicator} ${i === activeIndex ? styles.carouselIndicatorActive : ''}`}
                onClick={() => setActiveIndex(i)}
              ></span>
            ))}
          </div>
          
          {/* Controles de navegación */}
          {imgs.length > 1 && (
            <>
              <button className={`${styles.carouselControl} ${styles.carouselControlPrev}`} onClick={prevSlide}>
                &#10094;
              </button>
              <button className={`${styles.carouselControl} ${styles.carouselControlNext}`} onClick={nextSlide}>
                &#10095;
              </button>
            </>
          )}
          
          <div className={styles.carouselCounter}>
            {activeIndex + 1} / {imgs.length}
          </div>
        </div>
      </div>
    );
  }
  
  // Vista de escritorio: galería vertical
  return (
    <div className={styles.vehicleImagesContainer}>
      {imgs.map((img, i) => (
        <div key={i} className={styles.stackImage}>
          <Image
            src={img.url}
            alt={`${brand} ${model} foto ${i + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            style={{ objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.src = '/images/no-image.png'; }}
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}