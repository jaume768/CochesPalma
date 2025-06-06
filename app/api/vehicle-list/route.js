import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Configuración de caché
const CACHE_FILE = path.join(process.cwd(), 'cache', 'vehicle-list.json');
const CACHE_DURATION = 3600000; // 1 hora en milisegundos
const MAX_VEHICLES = 24; // Limitar a 24 coches para respuesta más rápida

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
          console.log('Usando datos en caché');
          const cachedData = await fs.readFile(CACHE_FILE, 'utf-8');
          return NextResponse.json(JSON.parse(cachedData));
        }
      }
    } catch (e) {
      console.log('Error verificando caché:', e);
    }
    
    // Intentar primero con axios (mucho más rápido)
    let content;
    let usedPuppeteer = false;
    
    try {
      console.log('Intentando scraping con axios...');
      const response = await axios.get('https://www.autocasionmallorca.com/es', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      content = response.data;
    } catch (error) {
      console.log('Axios falló, usando puppeteer:', error.message);
      usedPuppeteer = true;
      
      // Si falla axios, usar puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
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
      
      // Desactivar recursos innecesarios para acelerar
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'font' || resourceType === 'stylesheet') {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto('https://www.autocasionmallorca.com/es', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      try {
        const cookieConsentSelector = '.cookiesjsr-btn.cookiesjsr-btn--accept-all';
        await page.waitForSelector(cookieConsentSelector, { timeout: 3000 });
        await page.click(cookieConsentSelector);
        await page.waitForTimeout(500); // Reducido el tiempo de espera
      } catch (error) {
        console.log('No se encontró el banner de cookies o no se pudo hacer clic.');
      }

      content = await page.content();
      await browser.close();
    }

    console.time('procesamiento-dom');
    const $ = cheerio.load(content);
    const baseUrl = 'https://www.autocasionmallorca.com';
    
    // Obtenemos todos los elementos de una vez y limitamos el número
    const vehicleElements = $('.div-mosaic').toArray().slice(0, MAX_VEHICLES);
    
    // Procesamos en paralelo con Promise.all para mayor velocidad
    const vehicles = await Promise.all(vehicleElements.map(async (element) => {
      try {
        const $element = $(element); // Optimización: creamos una referencia para evitar múltiples jQuery lookups
        
        // Extraemos todos los datos de una vez para minimizar operaciones DOM
        const title = $element.find('.retall_titol').text().trim();
        const price = $element.find('.precio_coche').first().text().trim();
        
        if (!title || !price) return null; // Si no hay título o precio, lo saltamos
        
        const titleParts = title.split(' ');
        const brand = titleParts[0] || '';
        const model = titleParts.slice(1).join(' ') || '';
        
        // Obtenemos todos los spans de detalles de una vez
        const detailSpans = $element.find('span[class^="caracteristicas_card_bottom"]').toArray();
        const year = detailSpans[0] ? $(detailSpans[0]).text().trim() : '';
        const fuelType = detailSpans[1] ? $(detailSpans[1]).text().trim() : '';
        const km = detailSpans[2] ? $(detailSpans[2]).text().trim().replace(' km', '') : '';
        
        // Imagen y URL
        let imageUrl = $element.find('img.max').attr('src') || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl.startsWith('https') ? imageUrl : baseUrl + imageUrl;
        }
        
        let detailUrl = $element.find('a').first().attr('href') || '';
        if (detailUrl && !detailUrl.startsWith('http')) {
          detailUrl = baseUrl + detailUrl;
        }
        
        return {
          brand,
          model,
          price,
          year,
          fuelType,
          km: `${km} km`,
          image: imageUrl,
          detailUrl
        };
      } catch (err) {
        console.error('Error al procesar vehículo:', err);
        return null;
      }
    }));
    
    // Filtramos los null (elementos que fallaron)
    const validVehicles = vehicles.filter(vehicle => vehicle !== null);
    console.timeEnd('procesamiento-dom');

    console.log(`Scraping finalizado. Se encontraron ${validVehicles.length} vehículos. Método: ${usedPuppeteer ? 'Puppeteer' : 'Axios'}`);

    // Guardar resultados en caché si son válidos
    if (validVehicles.length > 0) {
      try {
        await fs.writeFile(CACHE_FILE, JSON.stringify(validVehicles));
        console.log('Datos guardados en caché');
      } catch (e) {
        console.error('Error guardando caché:', e);
      }
      
      return NextResponse.json(validVehicles);
    } else {
      console.warn('No se encontraron vehículos. Devolviendo datos de fallback.');
      return NextResponse.json(fallbackData);
    }

  } catch (error) {
    console.error('Error general en el proceso de scraping:', error);
    // En caso de un error grave, devolvemos los datos de fallback.
    return NextResponse.json(fallbackData);
  }
}