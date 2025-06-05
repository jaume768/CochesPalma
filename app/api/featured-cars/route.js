import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    // 1) Lanzamos Puppeteer en modo headless con sandbox deshabilitado
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 2) Navegamos a la URL y esperamos a que cargue completamente (hasta 30 s)
    await page.goto('https://www.autocasionmallorca.com/es', {
      waitUntil: 'networkidle2',
      timeout: 30000
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
    await page.waitForSelector('#bulletLooper .grid-2', { timeout: 10000 });
    console.log('¡Ya están las tarjetas de coches en pantalla!');

    // 5) Obtenemos el HTML ya renderizado
    const html = await page.content();
    await browser.close(); // Cerramos Puppeteer

    // 6) Cargamos el HTML con Cheerio
    const $ = cheerio.load(html);
    const cars = [];

    // 7) Iteramos sobre cada tarjeta real de coche dentro de #bulletLooper
    $('#bulletLooper .grid-2').each((i, el) => {
      const $el = $(el);

      // Extraemos título (marca/modelo) y precio
      const title = $el.find('h5').text().trim();         // Ej. "Volkswagen Golf"
      const priceRaw = $el.find('h4').text().trim();       // Ej. "19.500 €"
      const imageUrl = $el.find('img').attr('src') || '';  // Ej. "/cache/vehiclesfotos/261056_250328123916744__180x134.JPG"

      // Convertimos el precio a número (quitamos puntos, comas y símbolo €)
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

      // Construimos la URL absoluta de la imagen (en caso de que sea ruta relativa)
      const fullImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : `https://www.autocasionmallorca.com${imageUrl}`;

      cars.push({
        id: i + 1,
        brand: brand || '',
        model: model,
        price: price,
        // En el slider de la home no hay año, combustible ni km exactos,
        // así que los dejamos vacíos o 0
        year: '',
        fuelType: '',
        km: 0,
        image: fullImageUrl
      });
    });

    // 8) Si no se encontró ningún coche, devolvemos datos fallback
    if (cars.length === 0) {
      return NextResponse.json([
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
          brand: 'Tesla',
          model: 'Model Y Long Range',
          price: 55990,
          year: '2023',
          fuelType: 'Eléctrico',
          km: 15000,
          image: '/images/car5.jpg',
        },
      ]);
    }

    // 9) Devolvemos la lista real de coches
    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error al hacer scraping:', error);

    // En caso de error, devolvemos el mismo fallback
    return NextResponse.json([
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
        brand: 'Tesla',
        model: 'Model Y Long Range',
        price: 55990,
        year: '2023',
        fuelType: 'Eléctrico',
        km: 15000,
        image: '/images/car5.jpg',
      },
    ]);
  }
}
