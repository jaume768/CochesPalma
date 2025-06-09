'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from '../alquilar-vehiculos/alquilar.module.css';

const RentacarCard = ({ rentacar }) => {
  // Imagen por defecto si no hay url_foto_promocional
  const imageSrc = rentacar.url_foto_promocional || '/images/rental-default.jpg';
  
  return (
    <div className={styles.rentacarCard}>
      <div className={styles.cardImageContainer}>
        <Image
          src={imageSrc}
          alt={`${rentacar.nombre} - Alquiler de coches`}
          className={styles.cardImage}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{rentacar.nombre}</h3>
        
        <div className={styles.cardAddress}>
          <FaMapMarkerAlt size={16} style={{ minWidth: '16px', color: '#ff6b35' }} />
          <span>{rentacar.direccion}</span>
        </div>
        
        {rentacar.descripcion && (
          <p className={styles.cardDescription}>
            {rentacar.descripcion.length > 150 
              ? `${rentacar.descripcion.substring(0, 150)}...` 
              : rentacar.descripcion}
          </p>
        )}
        
        <Link href={rentacar.url_web || '#'} className={styles.websiteButton} target="_blank" rel="noopener noreferrer">
          Visitar sitio web
        </Link>
      </div>
    </div>
  );
};

export default RentacarCard;
