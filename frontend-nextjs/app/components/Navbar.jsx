'use client';

import Link from 'next/link';
import styles from './components.module.css';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  // Obtener la ruta actual para determinar la página activa
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="/images/logo.png" alt=".reliable." className={styles.logoImg} />
      </div>
      <div className={styles.navLinks}>
        <Link href="/" className={pathname === '/' ? styles.active : ''}>Inicio</Link>
        <Link href="/comprar-vehiculos" className={pathname === '/comprar-vehiculos' ? styles.active : ''}>Comprar vehículos</Link>
        <a href="#">Servicios</a>
        <a href="#">Sobre Nosotros</a>
        <a href="#">Contacto</a>
      </div>
      <div className={styles.languageSelector}>
        <button className={styles.languageButton}>ES</button>
        <span className={styles.languageSeparator}>|</span>
        <button className={styles.languageButton}>EN</button>
      </div>
    </nav>
  );
}
