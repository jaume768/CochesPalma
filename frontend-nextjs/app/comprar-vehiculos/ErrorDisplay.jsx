'use client';

import styles from './page.module.css';

/**
 * Componente cliente para mostrar errores y permitir interactividad
 * @param {Object} props
 * @param {string} props.error - Mensaje de error a mostrar
 */
export default function ErrorDisplay({ error }) {
  return (
    <div className={styles.errorContainer}>
      <p>{error || 'No se pudieron cargar los vehículos. Por favor, inténtelo de nuevo más tarde.'}</p>
      <button
        className={styles.retryButton}
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </div>
  );
}
