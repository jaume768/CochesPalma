import React from 'react';
import styles from './components.module.css';

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Menú</h3>
          <ul className={styles.footerLinks}>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Comprar un coche</a></li>
            <li><a href="#">Vender su coche</a></li>
            <li><a href="#">Alquilar un coche</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contactos</h3>
          <div className={styles.footerContactInfo}>
            <div>
              <p className={styles.footerContactLabel}>DIRECCIÓN</p>
              <p className={styles.footerContactText}>Vía Palma 100, 2ºF<br />Manacor (I. Balears)</p>
            </div>
            <div>
              <p className={styles.footerContactLabel}>TELÉFONO</p>
              <p className={styles.footerContactText}>+34 971 845 624</p>
            </div>
            <div>
              <p className={styles.footerContactLabel}>EMAIL</p>
              <p className={styles.footerContactText}>info@corsoft.es</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>© {year} Corsoft. Todos los derechos reservados.</p>
        <div className={styles.footerLegal}>
          <a href="#">Términos y Condiciones</a>
          <span className={styles.footerDivider}>•</span>
          <a href="#">Política de Privacidad</a>
        </div>
      </div>
    </footer>
  );
}
