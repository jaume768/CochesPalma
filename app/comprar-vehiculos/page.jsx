import Image from 'next/image';
import styles from '../page.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Suspense } from 'react';

// Configurar revalidación cada 1 hora (3600 segundos)
export const revalidate = 3600;

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
        <div className={styles.vehicleCard} key={index}>
          <div className={styles.vehicleImageContainer}>
            <Image
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={styles.vehicleImage}
              priority={index < 4} // Cargar con prioridad las primeras 4 imágenes
            />
            <div className={styles.imageOverlay}></div>
          </div>
          <div className={styles.vehicleDetails}>
            <div className={styles.vehiclePrice}>{vehicle.price}</div>
            <h3 className={styles.vehicleName}>
              {`${vehicle.brand} ${vehicle.model}`}
            </h3>
            <div className={styles.vehicleSpecs}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Año:</span>
                <span>{vehicle.year}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Combustible:</span>
                <span>{vehicle.fuelType}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Kilómetros:</span>
                <span>{vehicle.km}</span>
              </div>
            </div>
            <a href={vehicle.detailUrl} target="_blank" rel="noopener noreferrer" className={styles.viewDetailsButton}>
              Ver Detalles
            </a>
          </div>
        </div>
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
          <div className={styles.sectionHeader}>
            <h2>Comprar Vehículos</h2>
            <p>Encuentra el vehículo perfecto para ti entre nuestra selección de coches de calidad</p>
          </div>

          <Suspense fallback={<LoadingVehicles />}>
            <VehicleGrid vehicles={vehicles} />
          </Suspense>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
