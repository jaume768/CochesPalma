'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

/**
 * Componente de formulario de filtros con submit automático
 */
export default function FilterForm({ search, combustible, carroceria }) {
  const router = useRouter();
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(search || '');
  
  // Verificar si se está usando la búsqueda inteligente
  useEffect(() => {
    // Solo verificamos si hay un término de búsqueda
    if (search && search.trim() !== '') {
      checkIfUsingAI();
    }
  }, [search]);
  
  // Función para verificar si se está usando la búsqueda inteligente
  const checkIfUsingAI = async () => {
    try {
      const response = await fetch(`/api/intelligent-search?search=${encodeURIComponent(search)}&page=1&limit=1`);
      if (response.ok) {
        const data = await response.json();
        setIsUsingAI(data.aiGenerated === true);
      }
    } catch (error) {
      console.error('Error al verificar si se usa IA:', error);
      setIsUsingAI(false);
    }
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    // Obtenemos el formulario donde está el select
    const form = e.target.closest('form');
    
    // Creamos un objeto FormData para obtener los valores
    const formData = new FormData(form);
    
    // Construimos la URL con los parámetros
    const searchParams = new URLSearchParams();
    
    // Añadimos el valor de búsqueda si existe
    const searchValue = formData.get('search');
    if (searchValue) searchParams.set('search', searchValue);
    
    // Añadimos carrocería si existe
    const carroceriaValue = formData.get('carroceria');
    if (carroceriaValue) searchParams.set('carroceria', carroceriaValue);
    
    // Añadimos combustible si existe
    const combustibleValue = formData.get('combustible');
    if (combustibleValue) searchParams.set('combustible', combustibleValue);
    
    // Navegamos a la URL con los parámetros
    router.push(`/comprar-vehiculos?${searchParams.toString()}`);
  };
  
  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Construimos la URL con los parámetros
    const searchParams = new URLSearchParams();
    
    // Añadimos el valor de búsqueda si existe
    if (searchInput) searchParams.set('search', searchInput);
    
    // Añadimos carrocería si existe
    const carroceriaValue = e.target.carroceria.value;
    if (carroceriaValue) searchParams.set('carroceria', carroceriaValue);
    
    // Añadimos combustible si existe
    const combustibleValue = e.target.combustible.value;
    if (combustibleValue) searchParams.set('combustible', combustibleValue);
    
    // Navegamos a la URL con los parámetros
    router.push(`/comprar-vehiculos?${searchParams.toString()}`);
  };
  
  // Icono para el botón de búsqueda
  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  
  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          name="search"
          placeholder="Buscar por marca, modelo, características, precio..."
          className={styles.searchInput}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className={styles.searchButton}>
          {isLoading ? <span className={styles.loadingDot}></span> : <SearchIcon />}
        </button>
      </div>
      <div className={styles.filtersWrapper}>
        <select
          name="carroceria"
          className={styles.filterButton}
          defaultValue={carroceria}
          onChange={handleFilterChange}
        >
          <option value="">Tipo de Carrocería</option>
          <option value="Berlina">Berlina</option>
          <option value="SUV">SUV</option>
          <option value="Compacto">Compacto</option>
          <option value="Familiar">Familiar</option>
          <option value="Cabrio">Cabrio</option>
        </select>
        <select
          name="combustible"
          className={styles.filterButton}
          defaultValue={combustible}
          onChange={handleFilterChange}
        >
          <option value="">Tipo de Combustible</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diésel">Diésel</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Eléctrico">Eléctrico</option>
        </select>
        {(search || combustible || carroceria) && (
          <a href="/comprar-vehiculos" className={styles.clearFilters}>
            Limpiar filtros
          </a>
        )}
      </div>
    </form>
  );
}
