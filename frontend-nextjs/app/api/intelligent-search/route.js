import { NextResponse } from 'next/server';

/**
 * API para la búsqueda inteligente de vehículos utilizando ChatGPT en el backend
 */
export async function GET(request) {
  try {
    // Extraer los parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const combustible = searchParams.get('combustible') || '';
    const carroceria = searchParams.get('carroceria') || '';
    
    // Construir la URL para la API backend
    const apiUrl = new URL(`${process.env.API_URL || 'http://localhost:3001'}/api/backend/search/vehicles`);
    apiUrl.searchParams.append('search', search);
    apiUrl.searchParams.append('page', page);
    apiUrl.searchParams.append('limit', limit);
    if (combustible) apiUrl.searchParams.append('combustible', combustible);
    if (carroceria) apiUrl.searchParams.append('carroceria', carroceria);
    
    console.log(`Realizando búsqueda inteligente: ${apiUrl.toString()}`);
    
    // Realizar la solicitud a la API del backend
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
    
    // Devolver los resultados
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en la búsqueda inteligente:', error);
    return NextResponse.json(
      { 
        error: 'Error al buscar vehículos', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}
