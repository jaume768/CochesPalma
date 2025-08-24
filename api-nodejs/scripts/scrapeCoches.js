#!/usr/bin/env node

/**
 * scripts/scrapeCoches.js
 *
 * Scrapea vehículos de AutocasionMallorca y vendedores asociados.
 * Paginación automática y detección/creación de usuarios vendedores.
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { connectDB, query } = require('../config/db'); // Ajusta ruta según tu proyecto

// URLs base
const BASE_URL = 'https://www.autocasionmallorca.com';
const LIST_URL = `${BASE_URL}/es/coches-ocasion-mallorca/listado/vehiculos/0/-/-/-`;

// Mapas para catálogos
const clasificacionMap = { Nuevo: 1, 'Segunda mano': 2, 'Kilómetro 0': 3, Ocasión: 4, Flota: 5, Renting: 6, Particular: 7 };
const carroceriaMap = { 'Turismos y berlinas': 1, SUV: 2, Familiar: 3, Hatchback: 4, Coupé: 5, Descapotable: 6, 'Pick-up': 7, Monovolumen: 8, Roadster: 9, Todoterreno: 10 };
const combustibleMap = { Gasolina: 1, Diésel: 2, Eléctrico: 3, Híbrido: 4 };

// Meses para parseo de fechas
const monthMap = { enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06', julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12' };
function parseFecha(text) {
  if (!text) return null;
  const parts = text.trim().toLowerCase().split(' ');
  const mes = monthMap[parts[0]];
  const año = parts[1];
  return mes && año ? `${año}-${mes}-01` : null;
}

function fullUrl(u) {
  if (!u) return '';
  if (/^https?:/.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return BASE_URL + u;
  return `${BASE_URL}/${u}`;
}

// Obtiene HTML (axios + fallback puppeteer)
async function fetchContent(url) {
  try {
    const res = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.data;
  } catch (_) {
    console.warn(`Axios falló en ${url}, usando Puppeteer...`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    await browser.close();
    return html;
  }
}

// Scrapear listado de vehículos (paginado)
async function scrapeList(page = 1) {
  const url = `${LIST_URL}/${page}`;
  const html = await fetchContent(url);
  const $ = cheerio.load(html);
  const items = $('.div-mosaic').toArray();
  return items.map(el => {
    const $el = $(el);
    const title = $el.find('.retall_titol').text().trim();
    const [brand, ...rest] = title.split(' ');
    return {
      brand,
      model: rest.join(' '),
      price: $el.find('.precio_coche').first().text().trim(),
      detailUrl: fullUrl($el.find('a').first().attr('href')),
      year: $el.find('span[class^="caracteristicas_card_bottom"]').eq(0).text().trim(),
      fuelType: $el.find('span[class^="caracteristicas_card_bottom"]').eq(1).text().trim(),
      km: ($el.find('span[class^="caracteristicas_card_bottom"]').eq(2).text().trim() || '0').replace(' km', ''),
      image: fullUrl($el.find('img.max').attr('src'))
    };
  }).filter(v => v.brand && v.model);
}

// Scrapear detalle de vehículo + vendedor
async function scrapeDetail(url) {
  const html = await fetchContent(url);
  const $ = cheerio.load(html);

  // Características del coche
  const data = {};
  $('#caracteristiquesvehicle tr').each((i, row) => {
    const key = $(row).find('th').text().replace(':', '').trim().toLowerCase();
    const val = $(row).find('td').text().trim();
    data[key] = val;
  });

  // Observaciones e imágenes
  const observaciones = $('.sensehref').text().trim();
  const imagenes = $('#bulletLooper .item img').map((i, img) => fullUrl($(img).attr('src'))).get();

  // Datos del vendedor
  const vendCont = $('#dadesautovenda .grid-3').eq(2);
  const vendorName = vendCont.find('h3').text().trim();
  const address = vendCont.find('h5').eq(0).text().trim();
  const city = vendCont.find('h5').eq(1).text().trim();
  const phones = vendCont.find('.div-telefon a[href^="tel:"]').map((i, a) => $(a).text().trim()).get();
  const whatsappEl = vendCont.find('.div-whatsapp a').first();
  const whatsapp = whatsappEl.text().trim();
  const promoImg = fullUrl($('#dadesautovenda .grid-3 img').first().attr('src'));
  const concImg = fullUrl(vendCont.find('a.fotolocal img').attr('src'));

  return {
    clasificacion: data['clasificación']?.replace(/<.*?>/g, '') || '',
    carroceria: data['carrocería'] || '',
    puertas: data['nº de puertas'] || '0',
    matriculado: data['matriculado'] || '',
    km: data['kilometraje'] || '0',
    color: data['color'] || '',
    combustible: data['combustible'] || '',
    potencia: data['potencia']?.replace(/\D/g, '') || '0',
    precio: data['precio'] || '',
    observaciones,
    imagenes,
    vendor: { vendorName, address, city, phone: phones[0] || '', whatsapp, promoImg, concImg }
  };
}

(async () => {
  console.log('Conectando a MySQL...');
  await connectDB();

  // 1) Recolectar todos los vehículos
  let page = 1, allVehicles = [];
  while (true) {
    console.log(`Página ${page}...`);
    const list = await scrapeList(page);
    if (!list.length) break;
    allVehicles.push(...list);
    page++;
    // Límite eliminado para scraping completo
    if(page > (process.env.SCRAPE_MAX_PAGES || 999)) break;
  }
  console.log(`Total coches: ${allVehicles.length}`);

  for (const veh of allVehicles) {
    try {
      console.log(`Procesando ${veh.brand} ${veh.model}...`);
      const det = await scrapeDetail(veh.detailUrl);

      // -- Gestionar vendedor --
      const username = det.vendor.vendorName.toLowerCase().replace(/\s+/g, '_');
      const [exists] = await query('SELECT id FROM usuarios WHERE username = ?', [username]);
      let vendorId;
      if (exists && exists.id) {
        vendorId = exists.id;
      } else {
        const email = `${username}@autocasionmallorca.com`;
        const password = crypto.randomBytes(8).toString('hex');
        const direccion = `${det.vendor.address}, ${det.vendor.city}`;
        const resU = await query(
          `INSERT INTO usuarios
            (username,email,password,direccion,provincia_id,ciudad_id,descripcion,telefono,whatsapp,url_imagen_promocional,url_imagen_concesionario,rol)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [username, email, password, direccion, 1, 1, null, det.vendor.phone, det.vendor.whatsapp, det.vendor.promoImg, det.vendor.concImg, 'vendedor']
        );
        vendorId = resU.insertId;
        console.log(` -> Vendedor '${username}' creado con ID ${vendorId}`);
      }

      // -- Insertar coche --
      const cocheObj = {
        vendedor_id: vendorId,
        modelo: `${veh.brand} ${veh.model}`,
        observaciones: det.observaciones,
        fecha_incorporacion: new Date(),
        clasificacion_id: clasificacionMap[det.clasificacion] || 4,
        carroceria_id: carroceriaMap[det.carroceria] || 1,
        num_puertas: parseInt(det.puertas, 10),
        fecha_matriculado: parseFecha(det.matriculado),
        kilometraje: parseInt(det.km.replace(/\D/g, ''), 10),
        color: det.color || 'Desconocido',
        combustible_id: combustibleMap[det.combustible] || 1,
        potencia: parseInt(det.potencia, 10),
        precio: parseFloat(veh.price.replace(/[€\s\.]/g, '').replace(',', '.'))
      };
      const resC = await query(
        `INSERT INTO coches
         (vendedor_id,modelo,observaciones,fecha_incorporacion,clasificacion_id,carroceria_id,num_puertas,fecha_matriculado,kilometraje,color,combustible_id,potencia,precio)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        Object.values(cocheObj)
      );
      const cocheId = resC.insertId;
      console.log(` -> Coche ID ${cocheId} insertado.`);

      // -- Insertar imágenes de coche --
      for (let i = 0; i < det.imagenes.length; i++) {
        await query(
          `INSERT INTO coche_imagenes (coche_id,url_foto,orden) VALUES (?,?,?)`,
          [cocheId, det.imagenes[i], i + 1]
        );
      }
    } catch (err) {
      console.error('ERROR:', err.message);
    }
  }

  console.log('¡Proceso completado!');
  process.exit(0);
})();
