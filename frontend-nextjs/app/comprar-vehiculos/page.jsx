'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorDisplay from './ErrorDisplay';
import FilterForm from './FilterForm';
import styles from './page.module.css';
import VehiclesPagination from './VehiclesPagination';

// Componente principal con animaciones como cliente
export default function ComprarVehiculos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estado para manejar vehículos y animaciones
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const resultsCounterRef = useRef(null);
  
  // Extraer los parámetros de búsqueda
  const rawPage = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const combustible = searchParams.get('combustible') || '';
  const carroceria = searchParams.get('carroceria') || '';
  
  const page = Number(rawPage) || 1;
  
  // Preparar filtros
  const filters = {};
  if (combustible) filters.combustible = combustible;
  if (carroceria) filters.carroceria = carroceria;
  
  // Función para obtener vehículos - definida con useCallback para evitar recreaciones
  const fetchVehicles = useCallback(async () => {
    try {
      // Determinar qué API usar
      const apiEndpoint = search ? 'intelligent-search' : 'vehicle-list';
      
      // Construir la URL con los parámetros
      const url = new URL(`/api/${apiEndpoint}`, window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '12');
      
      if (search) url.searchParams.append('search', search);
      if (combustible) url.searchParams.append('combustible', combustible);
      if (carroceria) url.searchParams.append('carroceria', carroceria);
      
      console.log('Fetching vehicles from:', url.toString());
      const res = await fetch(url.toString(), { cache: 'no-store' });
      
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      const data = await res.json();
      console.log('Fetch result:', data);
      
      return data || { vehicles: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 12 } };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return { vehicles: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 12 } };
    }
  }, [search, combustible, carroceria, page]);

  // Cargar vehículos cuando cambien los parámetros
  useEffect(() => {
    let isMounted = true;
    
    const loadVehicles = async () => {
      setIsLoading(true);
      setIsFiltering(false);
      
      try {
        const result = await fetchVehicles();
        
        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          // Animar la entrada de los nuevos vehículos
          setTimeout(() => {
            if (isMounted) {
              setVehicles(result.vehicles || []);
              setPagination(result.pagination || {});
              setIsLoading(false);
              setIsFiltering(false);
              
              // Animar el contador de resultados
              setAnimateResults(true);
              setTimeout(() => {
                if (isMounted) setAnimateResults(false);
              }, 1000);
            }
          }, 300);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
        if (isMounted) {
          setIsLoading(false);
          setIsFiltering(false);
        }
      }
    };
    
    loadVehicles();
    
    // Limpieza para evitar actualizaciones de estado en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [fetchVehicles]);
  

  
  // Manejo de filtros
  const handleFilterChange = (newFilters) => {
    setIsFiltering(true);
    
    // Construir nueva URL con filtros
    const url = new URL(window.location.pathname, window.location.origin);
    
    if (newFilters.search) url.searchParams.append('search', newFilters.search);
    if (newFilters.combustible) url.searchParams.append('combustible', newFilters.combustible);
    if (newFilters.carroceria) url.searchParams.append('carroceria', newFilters.carroceria);
    
    // Navegar sin recargar la página
    router.push(url.pathname + url.search);
  };
  
  // Si no hay vehículos y es una página distinta de la primera, mostrar un error
  if (vehicles.length === 0 && page > 1 && pagination.totalPages === 0 && !isLoading) {
    router.push('/comprar-vehiculos');
    return null;
  }

  // Componente modificado para mostrar esqueleto durante carga
  const AnimatedVehicleGrid = () => {
    if (isLoading || isFiltering) {
      // Mostrar esqueletos de carga
      return (
        <div className={`${styles.vehiclesGrid} ${styles.animatedGrid}`}>
          {Array(6).fill(0).map((_, index) => (
            <div className={`${styles.carCardLink}`} key={`skeleton-${index}`}>
              <div className={`${styles.carCard} ${styles.carCardLoading}`}>
                <div className={styles.carImageContainer}></div>
                <div className={styles.carInfo}>
                  <div className={styles.carBrandModel}></div>
                  <div className={styles.carDetails}></div>
                  <div className={styles.carPriceContainer}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Si no hay vehículos
    if (!vehicles || vehicles.length === 0) {
      return <ErrorDisplay error="No se encontraron vehículos disponibles" />;
    }

    // Mostrar vehículos con animación
    return (
      <div className={`${styles.vehiclesGrid} ${styles.animatedGrid}`}>
        {vehicles.map((vehicle, index) => (
          <a
            href={`/vehiculo/${vehicle.id}`}
            className={`${styles.carCardLink} ${styles.carCardAnimated}`}
            key={vehicle.id ?? index}
          >
            <div className={styles.carCard}>
              <div className={styles.carImageContainer}>
                <Image
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className={styles.carImage}
                  priority={index < 4}
                />
                <div className={styles.carImageGradient}></div>
              </div>
              <div className={styles.carInfo}>
                <div className={styles.carBrandModel}>
                  <h3 className={styles.carBrand}>{vehicle.brand}</h3>
                  <h4 className={styles.carModel}>{vehicle.model}</h4>
                </div>
                <div className={styles.carDetails}>
                  <span className={styles.carYear}>{vehicle.year}</span>
                  <span className={styles.carFuelType}>{vehicle.fuelType}</span>
                  <span className={styles.carKm}>{vehicle.km}</span>
                </div>
                <div className={styles.carPriceContainer}>
                  <span className={styles.carPrice}>{parseInt(vehicle.price)} €</span>
                </div>
                <div className={styles.carDetailsLink}>
                  <span className={styles.detailsText}>
                    Ver Detalles <span className={styles.arrowIcon}>→</span>
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.vehiclesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h1>Nuestros Vehículos</h1>
              <p>Explora nuestra selección de vehículos.</p>
            </div>
          </div>

          <div className={styles.vehiclesContainer}>
            <FilterForm 
              search={search} 
              combustible={combustible} 
              carroceria={carroceria} 
              onFilterChange={handleFilterChange} 
            />

            <div className={styles.vehiclesContent}>
              <AnimatedVehicleGrid />

              {pagination && pagination.totalPages > 0 && (
                <VehiclesPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  searchParams={{ search, combustible, carroceria }}
                />
              )}

              <div className={`${styles.resultsInfo} ${animateResults ? styles.resultsCounterAnimate : ''}`} ref={resultsCounterRef}>
                <p>
                  Mostrando {vehicles.length} de {pagination?.totalItems || 0} vehículos
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
