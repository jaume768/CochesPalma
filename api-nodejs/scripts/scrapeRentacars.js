#!/usr/bin/env node

/**
 * scripts/scrapeRentacars.js
 *
 * Scrapea rentacars de AutocasionMallorca para todas las ubicaciones disponibles
 * y los registra en la base de datos.
 *
 * Uso:
 *   NODE_ENV=production node scripts/scrapeRentacars.js
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('querystring');
const { connectDB, query } = require('../config/db'); // Ajusta la ruta según tu proyecto

const BASE_URL = 'https://www.autocasionmallorca.com';
const LIST_URL = `${BASE_URL}/es/alquiler`;

function fullUrl(u) {
  if (!u) return '';
  if (/^https?:/.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return BASE_URL + u;
  return `${BASE_URL}/${u}`;
}

async function fetchContent(url, method = 'GET', data = null) {
  try {
    if (method === 'POST') {
      const res = await axios.post(url, qs.stringify(data), {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return res.data;
    }
    const res = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.data;
  } catch (_) {
    console.warn(`Axios falló en ${url}, usando Puppeteer...`);
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    if (method === 'POST' && data) {
      await page.goto(LIST_URL, { waitUntil: 'networkidle2' });
      await page.evaluate((d) => {
        const form = document.getElementById('form_cerca');
        Object.entries(d).forEach(([k, v]) => {
          form.querySelector(`[name="${k}"]`).value = v;
        });
        form.submit();
      }, data);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      await page.goto(url, { waitUntil: 'networkidle2' });
    }
    const html = await page.content();
    await browser.close();
    return html;
  }
}

async function getZones() {
  const html = await fetchContent(LIST_URL);
  const $ = cheerio.load(html);
  return $('#form_cerca select[name="zona"] option')
    .map((i, o) => $(o).attr('value').trim())
    .get()
    .filter(z => z);
}

async function scrapeListByZone(zone) {
  const html = zone
    ? await fetchContent(LIST_URL, 'POST', { zona: zone })
    : await fetchContent(LIST_URL);
  const $ = cheerio.load(html);
  return $('.mosaic-container .div-mosaic')
    .toArray()
    .map(el => {
      const $el = $(el);
      const rel = $el.find('.boton-mas-info').parent('a').attr('href');
      const detailUrl = fullUrl(rel);
      const thumbImg = fullUrl($el.find('img').first().attr('src'));
      const rating = parseFloat($el.find('h3.center').text().trim()) || null;
      const mapUrl = $el.find('.price-column a').attr('href') || '';
      const lugares = $el.find('.lista-lugares ul li').map((i, li) => $(li).text().trim()).get();
      const bookingUrl = fullUrl($el.find('a.redireccionador').attr('href') || '');
      return { detailUrl, thumbImg, rating, mapUrl, lugares, bookingUrl };
    });
}

async function scrapeDetail(url) {
  const html = await fetchContent(url);
  const $ = cheerio.load(html);
  const nombre = $('h1').first().text().trim();
  const textBlocks = [];
  $('.grid-7 p').each((i, p) => {
    const t = $(p).text().trim(); if (t) textBlocks.push(t);
  });
  $('.grid-7 div').each((i, div) => {
    const t = $(div).text().trim(); if (t.startsWith('*')) textBlocks.push(t.replace(/\*\s*/g, '* '));
  });
  const description = textBlocks.join('\n\n');
  const lugares = [];
  $('.grid-7 h2').each((i, h2) => {
    if ($(h2).text().toLowerCase().includes('lugares')) {
      $(h2).next('.center').find('li').each((j, li) => lugares.push($(li).text().trim()));
    }
  });
  const promoImage = fullUrl($('.grid-4.push-1 img').attr('src'));
  const bookingUrl = $('a.redireccionador').attr('href') || '';
  return { nombre, description, promoImage, bookingUrl, lugares };
}

(async () => {
  console.log('Conectando a MySQL...');
  await connectDB();
  console.log('Obteniendo zonas...');
  const zones = await getZones();
  zones.unshift(''); // incluye default sin filtro

  const seen = new Set();
  const allItems = [];
  for (const zone of zones) {
    console.log(`Zona: ${zone || 'Todas'}...`);
    const list = await scrapeListByZone(zone);
    list.forEach(item => seen.has(item.detailUrl) || (seen.add(item.detailUrl) && allItems.push(item)));
  }

  console.log(`Total rentacars únicos: ${allItems.length}`);
  for (const item of allItems) {
    try {
      console.log(`Procesando ${item.detailUrl}...`);
      const det = await scrapeDetail(item.detailUrl);
      const [exists] = await query('SELECT id FROM rentacars WHERE nombre = ?', [det.nombre]);
      let rentacarId;
      if (exists && exists.id) {
        rentacarId = exists.id;
      } else {
        const direccion = det.lugares[0] || '';
        const res = await query(
          `INSERT INTO rentacars (nombre, url_foto_promocional, direccion, descripcion, url_web)
           VALUES (?,?,?,?,?)`,
          [det.nombre, det.promoImage, direccion, det.description, det.bookingUrl]
        );
        rentacarId = res.insertId;
        console.log(` -> Rentacar '${det.nombre}' creado ID ${rentacarId}`);
      }
      for (const lugar of det.lugares) {
        const [city] = await query('SELECT id FROM ciudades WHERE nombre = ?', [lugar]);
        if (city && city.id) {
          await query(
            'INSERT IGNORE INTO rentacar_ciudades (rentacar_id, ciudad_id) VALUES (?,?)',
            [rentacarId, city.id]
          );
        }
      }
    } catch (err) {
      console.error('ERROR en', item.detailUrl, err.message);
    }
  }

  console.log('¡Proceso completado!');
  process.exit(0);
})();
