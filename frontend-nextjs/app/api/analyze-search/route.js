import { NextResponse } from 'next/server';

/**
 * API para analizar la intención de búsqueda y sugerir filtros
 */
export async function GET(request) {
  try {
    // Extraer el texto de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // Si no hay texto de búsqueda, devolver un objeto vacío
    if (!search.trim()) {
      return NextResponse.json({ filters: {} });
    }
    
    // Construir la URL para la API backend
    const apiUrl = new URL(`${process.env.API_URL || 'http://localhost:3001'}/api/backend/search/analyze-intent`);
    apiUrl.searchParams.append('search', search);
    
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
    console.error('Error al analizar la búsqueda:', error);
    return NextResponse.json(
      { 
        error: 'Error al analizar la búsqueda', 
        message: error.message,
        filters: {}
      }, 
      { status: 500 }
    );
  }
}
