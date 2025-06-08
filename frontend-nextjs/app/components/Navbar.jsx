'use client';

import Link from 'next/link';
import styles from './components.module.css';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  // Obtener la ruta actual para determinar la página activa
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <img src="/images/logo.png" alt=".reliable." className={styles.logoImg} />
      </Link>
      <div className={styles.navLinks}>
        <Link href="/" className={pathname === '/' ? styles.active : ''}>Inicio</Link>
        <Link href="/comprar-vehiculos" className={pathname === '/comprar-vehiculos' ? styles.active : ''}>Comprar un coche</Link>
        <Link href="/vender-vehiculos" className={pathname === '/vender-vehiculos' ? styles.active : ''}>Vender su coche</Link>
        <Link href="/alquilar-vehiculos" className={pathname === '/alquilar-vehiculos' ? styles.active : ''}>Alquilar un coche</Link>
        <Link href="/contacto" className={pathname === '/contacto' ? styles.active : ''}>Contacto</Link>
      </div>
    </nav>
  );
}
