import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Configuración de caché
const CACHE_FILE = path.join(process.cwd(), 'cache', 'vehicle-list.json');
const CACHE_DURATION = 900000; // 15 minutos en milisegundos

// URL de la API
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Fallback data in case scraping fails
const fallbackData = [
  {
    brand: "BMW",
    model: "Serie 3",
    price: "28.900 €",
    year: "2019",
    fuelType: "Diésel",
    km: "65.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_9379.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/bmw-serie-3/"
  },
  {
    brand: "Mercedes-Benz",
    model: "Clase A",
    price: "25.500 €",
    year: "2020",
    fuelType: "Gasolina",
    km: "35.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8953.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/mercedes-benz-clase-a/"
  },
  {
    brand: "Audi",
    model: "A4",
    price: "32.900 €",
    year: "2021",
    fuelType: "Diésel",
    km: "28.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8674.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/audi-a4/"
  },
  {
    brand: "Volkswagen",
    model: "Golf",
    price: "19.900 €",
    year: "2018",
    fuelType: "Gasolina",
    km: "45.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_9012.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/volkswagen-golf/"
  },
  {
    brand: "Toyota",
    model: "Corolla",
    price: "22.900 €",
    year: "2019",
    fuelType: "Híbrido",
    km: "38.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8790.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/toyota-corolla/"
  },
  {
    brand: "Seat",
    model: "León",
    price: "18.500 €",
    year: "2020",
    fuelType: "Gasolina",
    km: "42.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8522.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/seat-leon/"
  },
  {
    brand: "Renault",
    model: "Mégane",
    price: "17.900 €",
    year: "2019",
    fuelType: "Diésel",
    km: "55.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8389.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/renault-megane/"
  },
  {
    brand: "Hyundai",
    model: "Tucson",
    price: "26.900 €",
    year: "2020",
    fuelType: "Diésel",
    km: "32.000 km",
    image: "https://www.autocasionmallorca.com/images/vehiculos/IMG_8123.JPG",
    detailUrl: "https://www.autocasionmallorca.com/es/vehiculo/hyundai-tucson/"
  }
];

export async function GET(request) {
  try {
    // Extraer parámetros de la URL para paginación y filtros
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const search = searchParams.get('search') || '';
    const combustible = searchParams.get('combustible') || '';
    const carroceria = searchParams.get('carroceria') || '';
    
    // Construir la URL para nuestra API con parámetros de consulta
    const apiUrl = new URL(`${API_URL}/api/coches`);
    apiUrl.searchParams.append('page', page);
    apiUrl.searchParams.append('limit', limit);
    if (search) apiUrl.searchParams.append('search', search);
    if (combustible) apiUrl.searchParams.append('combustible', combustible);
    if (carroceria) apiUrl.searchParams.append('carroceria', carroceria);
    
    // Verificar caché
    const cacheKey = `${CACHE_FILE}-${page}-${limit}-${search}-${combustible}-${carroceria}`;
    try {
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true }).catch(() => {});
      const cacheExists = await fs.stat(cacheKey).catch(() => false);
      if (cacheExists) {
        const { mtime } = await fs.stat(cacheKey);
        // Si el caché es reciente, usarlo
        if (Date.now() - new Date(mtime).getTime() < CACHE_DURATION) {
          console.log(`Usando datos en caché para coches (página ${page})`);
          const cachedData = await fs.readFile(cacheKey, 'utf-8');
          return NextResponse.json(JSON.parse(cachedData));
        }
      }
    } catch (e) {
      console.log('Error verificando caché de coches:', e);
    }
    
    // Obtener los datos de coches desde nuestra API
    console.log(`Obteniendo coches de la API: ${apiUrl.toString()}`);
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Comprobar si tenemos datos
    if (!result.vehicles || result.vehicles.length === 0) {
      console.warn('No se encontraron vehículos en la API. Devolviendo datos de fallback.');
      return NextResponse.json(fallbackData);
    }
    
    // Guardar en caché
    try {
      await fs.writeFile(cacheKey, JSON.stringify(result), 'utf-8');
      console.log(`Datos de coches (página ${page}) guardados en caché`);
    } catch (cacheError) {
      console.error('Error guardando caché de coches:', cacheError);
      // Continuamos aunque falle el guardado en caché
    }
    
    // Devolver los datos
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    return NextResponse.json({
      vehicles: fallbackData,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: fallbackData.length,
        itemsPerPage: fallbackData.length
      }
    });
  }
}