'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import CarCard from './CarCard';

export default function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const carsPerPage = 6;

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/featured-cars');

        if (!response.ok) {
          throw new Error('Error al obtener datos de coches');
        }

        const data = await response.json();
        setFeaturedCars(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los coches:', err);
        setError('No se pudieron cargar los coches destacados');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const totalPages = Math.ceil(featuredCars.length / carsPerPage);
  const startIndex = currentPage * carsPerPage;
  const displayCars = featuredCars.slice(startIndex, startIndex + carsPerPage);

  const nextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => (prevPage === 0 ? totalPages - 1 : prevPage - 1));
  };

  return (
    <section className={styles.featuredCarsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Coches Destacados</h2>
        <div className={styles.viewAllContainer}>
          <a href="/comprar-vehiculos" className={styles.viewAllLink}>
            Ver todos los vehículos <span className={styles.arrowIcon}>→</span>
          </a>
        </div>
      </div>
      
      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando coches destacados...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      )}

      <div className={styles.carGrid}>
        {displayCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}
