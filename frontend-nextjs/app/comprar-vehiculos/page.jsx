import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorDisplay from './ErrorDisplay';
import FilterForm from './FilterForm';
import styles from './page.module.css';
import VehiclesPagination from './VehiclesPagination';

// Configurar revalidación cada 1 hora (3600 segundos)
export const revalidate = 3600;

// Iconos para el componente
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// Componente VehicleGrid que muestra la cuadrícula de vehículos
function VehicleGrid({ vehicles }) {
  if (!vehicles || vehicles.length === 0) {
    return <ErrorDisplay error="No se encontraron vehículos disponibles" />;
  }

  return (
    <div className={styles.vehiclesGrid}>
      {vehicles.map((vehicle, index) => (
        <a
          href={`/vehiculo/${vehicle.id}`}
          className={styles.carCardLink}
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
async function getVehicles(page = 1, search = '', filters = {}) {
  try {
    // Usamos URL absoluta para asegurar que funcione en producción
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';

    // Construir la URL con los parámetros de consulta
    const url = new URL(`${protocol}://${host}/api/vehicle-list`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', '12'); // Mostramos 12 vehículos por página

    // Añadir parámetros de búsqueda y filtros si existen
    if (search) url.searchParams.append('search', search);
    if (filters.combustible) url.searchParams.append('combustible', filters.combustible);
    if (filters.carroceria) url.searchParams.append('carroceria', filters.carroceria);

    const res = await fetch(url.toString(), {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch vehicles');
    const data = await res.json();

    // Si no hay datos o no hay vehículos, devolver un formato consistente con array vacío
    if (!data || !data.vehicles) {
      console.log('No se encontraron vehículos con los filtros aplicados');
      return { 
        vehicles: [], 
        pagination: { 
          currentPage: 1, 
          totalPages: 0, 
          totalItems: 0, 
          itemsPerPage: 12 
        } 
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return { vehicles: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 12 } };
  }
}

// Componente principal con renderizado del lado del servidor
export default async function ComprarVehiculos({ searchParams }) {
  // 1. Esperamos la promesa de searchParams
  const params = await searchParams;

  // 2. Desestructuramos con valores por defecto
  const {
    page: rawPage = '1',
    search = '',
    combustible = '',
    carroceria = ''
  } = params;

  const page = Number(rawPage) || 1;

  // Preparar filtros
  const filters = {};
  if (combustible) filters.combustible = combustible;
  if (carroceria) filters.carroceria = carroceria;

  // Obtener datos en renderización del servidor
  const result = await getVehicles(page, search, filters);

  // Si no hay vehículos y es una página distinta de la primera, mostrar 404
  if (result.vehicles.length === 0 && page > 1 && result.pagination.totalPages === 0) {
    notFound();
  }

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
            <FilterForm search={search} combustible={combustible} carroceria={carroceria} />

            <div className={styles.vehiclesContent}>
              <Suspense fallback={<LoadingVehicles />}>
                <VehicleGrid vehicles={result.vehicles} />
              </Suspense>

              {result.pagination && result.pagination.totalPages > 0 && (
                <VehiclesPagination
                  currentPage={result.pagination.currentPage}
                  totalPages={result.pagination.totalPages}
                  searchParams={{ search, combustible, carroceria }}
                />
              )}

              <div className={styles.resultsInfo}>
                <p>
                  Mostrando {result.vehicles.length} de {result.pagination?.totalItems || 0} vehículos
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
