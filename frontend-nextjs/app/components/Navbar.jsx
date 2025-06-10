'use client';

import Link from 'next/link';
import styles from './components.module.css';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  // Obtener la ruta actual para determinar la página activa
  const pathname = usePathname();
  // Estado para controlar la visibilidad del menú móvil
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para controlar si estamos en versión móvil
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si estamos en móvil (solo en el cliente)
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Si cambiamos a desktop y el menú está abierto, lo cerramos
      if (window.innerWidth >= 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    
    // Comprobar el tamaño de la ventana al cargar
    checkIfMobile();
    
    // Agregar listener para cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar el listener cuando se desmonte el componente
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [menuOpen]);
  
  // Cerrar menú cuando se hace clic en un enlace
  const handleLinkClick = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <img src="/images/logo.png" alt=".reliable." className={styles.logoImg} />
      </Link>
      
      {/* Botón hamburguesa para móvil */}
      <button 
        className={`${styles.hamburger} ${menuOpen ? styles.active : ''}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Menú de navegación */}
      <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
        <Link onClick={handleLinkClick} href="/" className={pathname === '/' ? styles.active : ''}>Inicio</Link>
        <Link onClick={handleLinkClick} href="/comprar-vehiculos" className={pathname === '/comprar-vehiculos' ? styles.active : ''}>Comprar un coche</Link>
        <Link onClick={handleLinkClick} href="/vender-vehiculos" className={pathname === '/vender-vehiculos' ? styles.active : ''}>Vender su coche</Link>
        <Link onClick={handleLinkClick} href="/alquilar-vehiculos" className={pathname === '/alquilar-vehiculos' ? styles.active : ''}>Alquilar un coche</Link>
        <Link onClick={handleLinkClick} href="/contacto" className={pathname === '/contacto' ? styles.active : ''}>Contacto</Link>
      </div>
    </nav>
  );
}
