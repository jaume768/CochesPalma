import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Configuración de caché
const CACHE_FILE = path.join(process.cwd(), 'cache', 'featured-cars.json');
const CACHE_DURATION = 900000; // 15 minutos en milisegundos

// URL de la API
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Datos fallback en caso de error
const fallbackData = [
  {
    id: 1,
    brand: 'BMW',
    model: 'Serie 3 330e',
    price: 45900,
    year: '2023',
    fuelType: 'Híbrido enchufable',
    km: 10000,
    image: '/images/car1.jpg',
  },
  {
    id: 2,
    brand: 'Audi',
    model: 'Q5 Sportback',
    price: 59800,
    year: '2022',
    fuelType: 'Diésel',
    km: 25000,
    image: '/images/car2.png',
  },
  {
    id: 3,
    brand: 'Hyundai',
    model: 'IONIQ 6 SE',
    price: 42700,
    year: '2024',
    fuelType: 'Eléctrico',
    km: 5000,
    image: '/images/car3.jpg',
  },
  {
    id: 4,
    brand: 'Tesla',
    model: 'Model Y Long Range',
    price: 55990,
    year: '2023',
    fuelType: 'Eléctrico',
    km: 15000,
    image: '/images/car4.jpg',
  },
  {
    id: 5,
    brand: 'Kia',
    model: 'EV6 GT-Line',
    price: 51500,
    year: '2024',
    fuelType: 'Eléctrico',
    km: 8000,
    image: '/images/car5.jpg',
  },
  {
    id: 6,
    brand: 'Porsche',
    model: 'Taycan 4S',
    price: 98700,
    year: '2023',
    fuelType: 'Eléctrico',
    km: 12000,
    image: '/images/car4.jpg',
  }
];

// Función para devolver datos fallback
const returnFallbackData = (error) => {
  console.error('Error en featured-cars:', error);
  return NextResponse.json(fallbackData);
}

export async function GET() {
  try {
    // Verificar caché
    try {
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true }).catch(() => {});
      const cacheExists = await fs.stat(CACHE_FILE).catch(() => false);
      if (cacheExists) {
        const { mtime } = await fs.stat(CACHE_FILE);
        // Si el caché es reciente, usarlo
        if (Date.now() - new Date(mtime).getTime() < CACHE_DURATION) {
          console.log('Usando datos en caché para featured-cars');
          const cachedData = await fs.readFile(CACHE_FILE, 'utf-8');
          return NextResponse.json(JSON.parse(cachedData));
        }
      }
    } catch (e) {
      console.log('Error verificando caché de featured-cars:', e);
    }
    
    // Obtener los datos de coches destacados desde nuestra API
    console.log(`Obteniendo coches destacados de la API: ${API_URL}/api/backend/coches-destacados`);
    const response = await fetch(`${API_URL}/api/backend/coches-destacados`, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const cars = await response.json();
    
    // Si no hay datos, usar fallback
    if (!cars || cars.length === 0) {
      return returnFallbackData('No se encontraron coches destacados en la API');
    }
    
    // Guardar en caché
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(cars), 'utf-8');
      console.log('Datos de featured-cars guardados en caché');
    } catch (cacheError) {
      console.error('Error guardando caché de featured-cars:', cacheError);
      // Continuamos aunque falle el guardado en caché
    }
    
    // Devolver los datos
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error obteniendo coches destacados:', error);
    return returnFallbackData(error);
  }
}
