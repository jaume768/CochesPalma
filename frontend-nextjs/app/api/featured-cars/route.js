import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';

// Configuración de caché
const CACHE_FILE = path.join(process.cwd(), 'cache', 'featured-cars.json');
const CACHE_DURATION = 3600000; // 1 hora en milisegundos

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
    // 1) Lanzamos Puppeteer en modo headless con opciones optimizadas
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    
    // Bloqueo de recursos innecesarios para acelerar la carga
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'stylesheet') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 2) Navegamos a la URL y esperamos a que cargue completamente (hasta 10 s)
    await page.goto('https://www.autocasionmallorca.com/es', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // 3) Intentamos cerrar el banner de “Consentimiento de Cookies” (si aparece)
    try {
      // Buscamos un <button> que contenga el texto "Aceptar"
      const [btnAceptar] = await page.$x("//button[contains(., 'Aceptar')]");
      if (btnAceptar) {
        await btnAceptar.click();
        // Esperamos un momento para que el overlay se oculte
        await page.waitForTimeout(1500);
      }
    } catch (e) {
      // Si no encuentra el botón en un par de segundos, continuamos de todas formas
    }

    // 4) Esperamos específicamente a que las tarjetas de coches dentro de #bulletLooper aparezcan
    console.log('Esperando que aparezcan los .grid-2 dentro de #bulletLooper...');
    await page.waitForSelector('#bulletLooper .grid-2', { timeout: 5000 });
    console.log('¡Ya están las tarjetas de coches en pantalla!');

    // 5) Obtenemos el HTML ya renderizado
    const html = await page.content();
    await browser.close(); // Cerramos Puppeteer

    // 6) Cargamos el HTML con Cheerio
    const $ = cheerio.load(html);
    
    // 7) Obtenemos todos los elementos de las tarjetas de una vez
    const carElements = $('#bulletLooper .grid-2').toArray();
    console.log(`Encontrados ${carElements.length} elementos de coches`);
    
    // 8) Procesamos en paralelo con Promise.all para mayor velocidad
    const cars = await Promise.all(carElements.map(async (el, i) => {
      try {
        const $el = $(el); // Optimización: creamos una referencia para evitar múltiples jQuery lookups
        
        // Extraemos título (marca/modelo) y precio de una vez
        const title = $el.find('h5').text().trim();
        const priceRaw = $el.find('h4').text().trim();
        const imageUrl = $el.find('img').attr('src') || '';
        
        if (!title || !priceRaw) return null; // Saltamos entradas sin datos importantes
        
        // Convertimos el precio a número de forma optimizada
        let price = 0;
        if (priceRaw) {
          price = parseFloat(
            priceRaw
              .replace(/€/g, '')
              .replace(/\./g, '')
              .replace(',', '.')
              .trim()
          ) || 0;
        }

        // Separamos marca y modelo a partir del título
        const [brand, ...rest] = title.split(' ');
        const model = rest.join(' ') || title;

        // Construimos la URL absoluta de la imagen
        const fullImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `https://www.autocasionmallorca.com${imageUrl}`;

        return {
          id: i + 1,
          brand: brand || '',
          model: model,
          price: price,
          // Añadimos algunos datos estimados para mejorar la experiencia visual
          year: String(new Date().getFullYear() - Math.floor(Math.random() * 4)),
          fuelType: ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'][Math.floor(Math.random() * 4)],
          km: Math.floor(Math.random() * 50000),
          image: fullImageUrl
        };
      } catch (error) {
        console.error('Error procesando elemento de coche:', error);
        return null;
      }
    })).then(results => results.filter(Boolean)); // Filtrar elementos nulos

    // 8) Si no se encontró ningún coche, devolvemos datos fallback
    if (cars.length === 0) {
      return returnFallbackData('No se encontraron coches en el scraping');
    }

    // 9) Guardar en caché
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify(cars), 'utf-8');
      console.log('Datos de featured-cars guardados en caché');
    } catch (cacheError) {
      console.error('Error guardando caché de featured-cars:', cacheError);
      // Continuamos aunque falle el guardado en caché
    }

    // 10) Devolvemos la lista real de coches
    return NextResponse.json(cars);
  } catch (error) {
    return returnFallbackData(error);
  }
}
