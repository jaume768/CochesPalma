import React from 'react';
import styles from '../page.module.css';

export default function HistoriaEmpresa() {
  return (
    <div className={styles.historiaSection}>
      <div className={styles.historiaContainer}>
        <div className={styles.historiaContent}>
          <h2 className={styles.historiaTitle}>
            En el mercado
            <br /> 
            desde hace más de <span className={styles.orangeText}>30 años</span>
          </h2>
          <p className={styles.historiaText}>
            Explore nuestra selección cuidadosamente elegida de vehículos. 
            Tenemos el coche perfecto para ti.
          </p>
          <button className={styles.historiaButton}>
            Contactar <span className={styles.arrowIcon}>→</span>
          </button>
        </div>
        <div className={styles.historiaImageContainer}>
          <img 
            src="/images/concesionario.png" 
            alt="Concesionario de coches premium" 
            className={styles.historiaImage} 
          />
        </div>
      </div>
    </div>
  );
}
