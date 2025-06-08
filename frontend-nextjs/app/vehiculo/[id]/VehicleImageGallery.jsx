'use client';

import { useState } from 'react';
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