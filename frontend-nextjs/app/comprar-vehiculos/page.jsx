import Image from 'next/image';
import styles from './page.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Suspense } from 'react';

// Configurar revalidación cada 1 hora (3600 segundos)
export const revalidate = 3600;

// Iconos para el componente
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Componente Loading
function LoadingVehicles() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p>Cargando vehículos...</p>
    </div>
  );
}

// Componente Error
function ErrorDisplay({error}) {
  return (
    <div className={styles.errorContainer}>
      <p>{error || 'No se pudieron cargar los vehículos. Por favor, inténtelo de nuevo más tarde.'}</p>
      <button 
        className={styles.retryButton} 
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </div>
  );
}

// Componente VehicleGrid que muestra la cuadrícula de vehículos
function VehicleGrid({vehicles}) {
  if (!vehicles || vehicles.length === 0) {
    return <ErrorDisplay error="No se encontraron vehículos disponibles" />;
  }
  
  return (
    <div className={styles.vehiclesGrid}>
      {vehicles.map((vehicle, index) => (
        <a 
          href={vehicle.detailUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.carCardLink}
          key={index}
        >
          <div className={styles.carCard}>
            <div className={styles.carImageContainer}>
              <Image
                src={vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={styles.carImage}
                priority={index < 4} // Cargar con prioridad las primeras 4 imágenes
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
                <span className={styles.carKm}>{vehicle.km} km</span>
              </div>
              <div className={styles.carPriceContainer}>
                <span className={styles.carPrice}>{vehicle.price}</span>
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
}

// Función para obtener los datos de los vehículos durante la construcción de la página
async function getVehicles() {
  try {
    // Usamos URL absoluta para asegurar que funcione en producción
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const url = `${protocol}://${host}/api/vehicle-list`;
    
    const res = await fetch(url, { 
      next: { revalidate: 3600 }, // Revalidación de caché en segundos (1 hora)
      cache: 'force-cache' // Usar cache agresivamente
    });
    
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

// Componente principal con renderizado del lado del servidor
export default async function ComprarVehiculos() {
  // Obtener datos en renderización del servidor
  const vehicles = await getVehicles();

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <section className={styles.vehiclesSection}>
          {/* Nuevo encabezado de la sección de vehículos */}
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h1>Our Vehicles</h1>
              <p>Explore our list of pre-owned vehicles.</p>
            </div>
          </div>

          <div className={styles.vehiclesContainer}>
            {/* Barra de búsqueda */}
            <div className={styles.searchBar}>
              <div className={styles.searchInputWrapper}>
                <input 
                  type="text" 
                  placeholder="Search by car make, model, etc." 
                  className={styles.searchInput} 
                />
                <button className={styles.searchButton}>
                  <SearchIcon />
                </button>
              </div>
              <div className={styles.filtersWrapper}>
                <div className={styles.filterButton}>
                  <span>Body Type</span>
                  <ChevronDownIcon />
                </div>
                <div className={styles.filterButton}>
                  <span>Fuel Type</span>
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Contenido principal de vehículos */}
            <div className={styles.vehiclesContent}>
              <Suspense fallback={<LoadingVehicles />}>
                <VehicleGrid vehicles={vehicles} />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
