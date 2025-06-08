'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './VehiclesPagination.module.css';

/**
 * Componente de paginación para la lista de vehículos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {Object} props.searchParams - Parámetros de búsqueda actuales (search, filtros)
 */
export default function VehiclesPagination({ currentPage, totalPages, searchParams = {} }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  // Generar la URL con los parámetros de búsqueda actuales
  const createPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    
    // Añadir la página
    params.set('page', pageNum.toString());
    
    // Mantener los parámetros de búsqueda y filtros actuales
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.combustible) params.set('combustible', searchParams.combustible);
    if (searchParams.carroceria) params.set('carroceria', searchParams.carroceria);
    
    return `${pathname}?${params.toString()}`;
  };

  // Determinar qué números de página mostrar
  const getPageNumbers = () => {
    const pages = [];
    
    // Mostrar siempre la primera página
    pages.push(1);
    
    // Lógica para determinar qué páginas mostrar (max 7 números)
    if (totalPages <= 7) {
      // Si son pocas páginas, mostrar todas
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si la página actual está en las primeras 4
      if (currentPage <= 4) {
        pages.push(2, 3, 4, 5, '...', totalPages);
      }
      // Si la página actual está en las últimas 4
      else if (currentPage >= totalPages - 3) {
        pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      }
      // Si la página actual está en el medio
      else {
        pages.push(
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        );
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={styles.pagination}>
      {/* Botón de página anterior */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className={styles.paginationLink}
          aria-label="Página anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      ) : (
        <span className={`${styles.paginationLink} ${styles.disabled}`} aria-disabled="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      
      {/* Números de página */}
      {pageNumbers.map((pageNumber, index) => {
        if (pageNumber === '...') {
          return (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          );
        }
        
        return (
          <Link
            key={pageNumber}
            href={createPageUrl(pageNumber)}
            className={`${styles.paginationLink} ${currentPage === pageNumber ? styles.active : ''}`}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
          >
            {pageNumber}
          </Link>
        );
      })}
      
      {/* Botón de página siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className={styles.paginationLink}
          aria-label="Página siguiente"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      ) : (
        <span className={`${styles.paginationLink} ${styles.disabled}`} aria-disabled="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </nav>
  );
}
