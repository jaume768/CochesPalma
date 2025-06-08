#!/usr/bin/env node

/**
 * Script para scrapear coches de autocasionmallorca.com y volcar los datos en MySQL
 * Asociando todos los coches al vendedor_id = 1
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs/promises');
const { connectDB, query } = require('../config/db'); // Ajusta la ruta según tu proyecto

// URL base y patrón de listados por página
const BASE_URL = 'https://www.autocasionmallorca.com';
const LIST_URL = `${BASE_URL}/es/coches-ocasion-mallorca/listado/vehiculos/0/-/-/-`;

// Mapas para catálogos (clasificaciones, carrocerías, combustibles)
const clasificacionMap = {
  'Nuevo': 1,
  'Segunda mano': 2,
  'Kilómetro 0': 3,
  'Ocasión': 4,
  'Flota': 5,
  'Renting': 6,
  'Particular': 7
};
const carroceriaMap = {
  'Turismos y berlinas': 1,
  'SUV': 2,
  'Familiar': 3,
  'Hatchback': 4,
  'Coupé': 5,
  'Descapotable': 6,
  'Pick-up': 7,
  'Monovolumen': 8,
  'Roadster': 9,
  'Todoterreno': 10
};
const combustibleMap = {
  'Gasolina': 1,
  'Diésel': 2,
  'Eléctrico': 3,
  'Híbrido': 4
};

// Conversión "Mes Año" -> YYYY-MM-DD (día 01)
const monthMap = {
  'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06',
  'julio':'07','agosto':'08','septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
};
function parseFecha(text) {
  if (!text) return null;
  const parts = text.trim().toLowerCase().split(' ');
  const mes = monthMap[parts[0]];
  const año = parts[1];
  return mes && año ? `${año}-${mes}-01` : null;
}

// Normaliza URL relativas a absolutas
function fullUrl(u) {
  if (!u) return '';
  if (/^https?:/.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return BASE_URL + u;
  return `${BASE_URL}/${u}`;
}

// Obtiene HTML con Axios y fallback a Puppeteer
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

// Scrapear lista de vehículos en una página
async function scrapeList(page = 1) {
  const url = `${LIST_URL}/${page}`;
  const html = await fetchContent(url);
  const $ = cheerio.load(html);
  const items = $('.div-mosaic').toArray();
  return items.map(elem => {
    const $el = $(elem);
    const title = $el.find('.retall_titol').text().trim();
    const [brand, ...rest] = title.split(' ');
    const model = rest.join(' ');
    const price = $el.find('.precio_coche').first().text().trim();
    const detailUrl = fullUrl($el.find('a').first().attr('href'));
    const spans = $el.find('span[class^="caracteristicas_card_bottom"]').toArray();
    const year = spans[0] ? $(spans[0]).text().trim() : '';
    const fuelType = spans[1] ? $(spans[1]).text().trim() : '';
    const km = spans[2] ? $(spans[2]).text().trim().replace(' km','') : '0';
    const image = fullUrl($el.find('img.max').attr('src'));
    return { brand, model, price, year, fuelType, km, image, detailUrl };
  }).filter(v => v.brand && v.model);
}

// Scrapear detalle de un vehículo (ficha)
async function scrapeDetail(url) {
  const html = await fetchContent(url);
  const $ = cheerio.load(html);
  const data = {};
  $('#caracteristiquesvehicle tr').each((i, row) => {
    const key = $(row).find('th').text().replace(':','').trim().toLowerCase();
    const val = $(row).find('td').text().trim();
    data[key] = val;
  });
  const observaciones = $('.sensehref').text().trim();
  const imagenes = $('#bulletLooper .item img').map((i, img) => fullUrl($(img).attr('src'))).get();
  return {
    clasificacion: data['clasificación']?.replace(/<.*?>/g,'') || '',
    carroceria:    data['carrocería'] || '',
    puertas:       data['nº de puertas'] || '0',
    matriculado:   data['matriculado'] || '',
    km:            data['kilometraje'] || '0',
    color:         data['color'] || '',
    combustible:   data['combustible'] || '',
    potencia:      data['potencia']?.replace(/\D/g,'') || '0',
    precio:        data['precio'] || '',
    observaciones,
    imagenes
  };
}

// Función principal
(async () => {
  console.log('Conectando a MySQL...');
  await connectDB();

  // 1) Recolectar todas las páginas
  let page = 1;
  const allVehicles = [];
  while (true) {
    console.log(`Scrapeando página ${page}...`);
    const list = await scrapeList(page);
    if (list.length === 0) {
      console.log('No hay más resultados.');
      break;
    }
    allVehicles.push(...list);
    page++;

    if (page > 20) break;
  }
  console.log(`Total vehículos recolectados: ${allVehicles.length}`);

  // 2) Procesar e insertar cada vehículo
  for (const veh of allVehicles) {
    try {
      console.log(`Procesando ${veh.brand} ${veh.model}...`);
      const det = await scrapeDetail(veh.detailUrl);

      const coche = {
        vendedor_id:           1,
        modelo:                `${veh.brand} ${veh.model}`,
        observaciones:         det.observaciones,
        fecha_incorporacion:   new Date(),
        clasificacion_id:      clasificacionMap[det.clasificacion] || 4,
        carroceria_id:         carroceriaMap[det.carroceria] || 1,
        num_puertas:           parseInt(det.puertas, 10),
        fecha_matriculado:     parseFecha(det.matriculado),
        kilometraje:           parseInt(det.km.replace(/\D/g,''), 10),
        color:                 det.color || 'Desconocido',
        combustible_id:        combustibleMap[det.combustible] || 1,
        potencia:              parseInt(det.potencia, 10),
        precio:                parseFloat(veh.price.replace(/[€\s\.]/g, '').replace(',','.'))
      };

      const res = await query(
        `INSERT INTO coches
         (vendedor_id, modelo, observaciones, fecha_incorporacion,
          clasificacion_id, carroceria_id, num_puertas, fecha_matriculado,
          kilometraje, color, combustible_id, potencia, precio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        Object.values(coche)
      );
      const cocheId = res.insertId;
      console.log(` -> Coche ID ${cocheId} insertado.`);

      // Insertar imágenes
      for (let i = 0; i < det.imagenes.length; i++) {
        await query(
          `INSERT INTO coche_imagenes (coche_id, url_foto, orden)
           VALUES (?, ?, ?)`,
          [cocheId, det.imagenes[i], i + 1]
        );
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }

  console.log('¡Scraping e inserción completados!');
  process.exit(0);
})();
