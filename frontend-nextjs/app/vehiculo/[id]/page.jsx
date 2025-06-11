import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Componentes
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import VehicleImageGallery from './VehicleImageGallery';
import VehicleSpecs from './VehicleSpecs';
import VehicleEquipment from './VehicleEquipment';
import ContactForm from './ContactForm';

async function getVehicleData(id) {
  try {
    // En lugar de hacer una llamada a nuestra propia API en el lado del servidor,
    // llamamos directamente a la API de backend desde el server component
    const apiBaseUrl = process.env.API_URL || 'http://localhost:3001';
    const apiUrl = `${apiBaseUrl}/api/backend/coches/${id}`;
    
    console.log(`Obteniendo detalles del vehículo directamente del backend: ${apiUrl}`);
    
    // Usar solo una opción de caché: o bien no-store o bien revalidate, no ambas
    const response = await fetch(apiUrl, { 
      next: { revalidate: 300 } // Revalidar cada 5 minutos
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener datos del vehículo: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    // Si la API devuelve una estructura con data, accedemos a ella
    return result.data || result;
  } catch (error) {
    console.error(`Error obteniendo datos del vehículo ${id}:`, error);
    return null;
  }
}

// Generar metadatos dinámicos para SEO
export async function generateMetadata({ params }) {
  // Esperar y extraer el id
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const vehicleData = await getVehicleData(id);
  
  if (!vehicleData) {
    return {
      title: 'Vehículo no encontrado - CochesPalma',
      description: 'El vehículo que estás buscando no está disponible.'
    };
  }
  
  const { brand, model, year, price, fuelType } = vehicleData;
  
  return {
    title: `${brand} ${model} (${year}) - CochesPalma`,
    description: `${brand} ${model} del año ${year}. ${fuelType}, precio: ${price}. Encuentra este y más vehículos en CochesPalma.`,
    openGraph: {
      title: `${brand} ${model} (${year})`,
      description: `${brand} ${model} del año ${year}. ${fuelType}, precio: ${price}. Encuentra este y más vehículos en CochesPalma.`,
      images: vehicleData.images && vehicleData.images[0] ? [{ url: vehicleData.images[0] }] : []
    }
  };
}

export default async function VehicleDetailPage({ params }) {
  // Esperar y extraer el id
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const vehicleData = await getVehicleData(id);
  
  // Si no hay datos del vehículo, mostrar página 404
  if (!vehicleData) {
    notFound();
  }
  
  const { brand, model, price, year, km, fuelType, color, power, doors, bodyType, 
          classification, description, seller, images, equipment } = vehicleData;
  
  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <section className={styles.vehicleDetailSection}>
          <div className={styles.vehicleContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <Link href="/">Inicio</Link>
              <span>&gt;</span>
              <Link href="/comprar-vehiculos">Vehículos</Link>
              <span>&gt;</span>
              <span>{brand} {model}</span>
            </div>
            
            <div className={styles.vehicleLayout}>
              {/* Columna izquierda: Galería de imágenes */}
              <div className={styles.leftColumn}>
                <VehicleImageGallery images={images} brand={brand} model={model} />
              </div>
              
              {/* Columna derecha: Información del vehículo */}
              <div className={styles.rightColumn}>
                <div className={styles.vehicleHeader}>
                  <div className={styles.vehicleBrand}>
                    <h1>{brand}</h1>
                  </div>
                  <div className={styles.vehicleModel}>
                    <h2>{model}</h2>
                  </div>
                  <div className={styles.vehiclePrice}>
                    {price}
                  </div>
                </div>
                
                <div className={styles.vehicleSpecsGrid}>
                  <VehicleSpecs 
                    year={year}
                    km={km}
                    fuelType={fuelType}
                    color={color}
                    power={power}
                    doors={doors}
                    bodyType={bodyType}
                    classification={classification}
                  />
                </div>
                
                {/* Descripción */}
                {description && (
                  <div className={styles.description}>
                    <h4 className={styles.descriptionTitle}>Descripción</h4>
                    <p className={styles.descriptionText}>{description}</p>
                  </div>
                )}
                
                {/* Equipamiento */}
                {equipment && equipment.length > 0 && (
                  <VehicleEquipment equipment={equipment} />
                )}

                <div className={styles.inlineFormSection}>
                  <h4 className={styles.contactTitle}>¿Te interesa este vehículo?</h4>
                  <ContactForm
                    vehicleId={id}
                    vehicleName={`${brand} ${model}`}
                  />
                </div>  
                
                <div className={styles.contactActions}>
                  <div className={styles.contactItem}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>971 123 456</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

