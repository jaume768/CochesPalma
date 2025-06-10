import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * Endpoint para obtener detalles de un vehículo específico
 * @param {Request} request - Objeto Request
 * @param {Object} context - Contexto de la ruta con parámetros
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Construir la URL de la API para obtener los detalles del vehículo
    const apiBaseUrl = process.env.API_URL || 'http://localhost:3001';
    const apiUrl = `${apiBaseUrl}/api/backend/coches/${id}`;
    
    // Crear clave de caché única para este vehículo
    const cacheDir = path.join(process.cwd(), 'cache');
    const cacheKey = path.join(cacheDir, `vehicle_${id}.json`);
    
    // Verificar si tenemos una versión en caché y si es reciente (menos de 15 minutos)
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      
      const stats = await fs.stat(cacheKey).catch(() => null);
      
      if (stats && (Date.now() - stats.mtimeMs) < 15 * 60 * 1000) {
        const cachedData = await fs.readFile(cacheKey, 'utf-8');
        return NextResponse.json(JSON.parse(cachedData));
      }
    } catch (e) {
      console.log('Error verificando caché de vehículo:', e);
    }
    
    // Obtener los datos del vehículo desde nuestra API
    console.log(`Obteniendo detalles del vehículo ${id} desde la API: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
      }
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Si no hay datos, devolver 404
    if (!result.data) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
    }
    
    // Guardar en caché
    try {
      await fs.writeFile(cacheKey, JSON.stringify(result), 'utf-8');
      console.log(`Datos del vehículo ${id} guardados en caché`);
    } catch (cacheError) {
      console.error('Error guardando en caché:', cacheError);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error obteniendo vehículo:', error);
    return NextResponse.json(
      { error: 'Error al obtener los detalles del vehículo' }, 
      { status: 500 }
    );
  }
}
