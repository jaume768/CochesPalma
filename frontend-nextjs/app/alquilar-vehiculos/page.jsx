'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RentacarCard from '../components/RentacarCard';
import styles from './alquilar.module.css';

// Componente con useSearchParams envuelto en Suspense
function AlquilarCocheContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [rentacars, setRentacars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Función para cargar los rentacars desde la API
  const loadRentacars = async (searchFilter = '') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Construir la URL con el filtro de búsqueda si existe
      const apiBaseUrl = process.env.API_URL || 'http://localhost:3001';
      const url = `${apiBaseUrl}/api/backend/rentacars`;
      
      const response = await fetch(url);
      console.log(response);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(data);
      setRentacars(data.data || []);
    } catch (error) {
      console.error('Error al cargar rentacars:', error);
      setErrorMessage('No se pudieron cargar los datos. Por favor, intente nuevamente más tarde.');
      setRentacars([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar rentacars al montar el componente o cuando cambian los parámetros de búsqueda
  useEffect(() => {
    const searchFilter = searchParams.get('search') || '';
    setSearchTerm(searchFilter);
    loadRentacars(searchFilter);
  }, [searchParams]);
  
  // Manejar la búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/alquilar-vehiculos?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/alquilar-vehiculos');
    }
  };
  
  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <section className={styles.alquilarSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h1>Alquilar un coche</h1>
              <p>Encuentra las mejores opciones para alquilar un vehículo que se adapte a tus necesidades.</p>
            </div>
          </div>
          
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch} className={styles.searchBox}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar por ciudad o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar alquiler de coches"
              />
              <button type="submit" className={styles.searchButton}>
                <FaSearch /> Buscar
              </button>
            </form>
          </div>
          
          {isLoading ? (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <p>Cargando servicios de alquiler...</p>
            </div>
          ) : errorMessage ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#ff3333'}}>
              <p>{errorMessage}</p>
            </div>
          ) : rentacars.length > 0 ? (
            <div className={styles.rentacarGrid}>
              {rentacars.map((rentacar) => (
                <RentacarCard key={rentacar.id} rentacar={rentacar} />
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <p>No se encontraron servicios de alquiler con la búsqueda actual.</p>
              <p>Prueba con otra ubicación o elimina el filtro de búsqueda.</p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

// Componente principal con límite de Suspense para resolver el error de useSearchParams
export default function AlquilarCochePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AlquilarCocheContent />
    </Suspense>
  );
}
