import styles from '../page.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img src="/images/logo.png" alt=".reliable." className={styles.logoImg} />
      </div>
      <div className={styles.navLinks}>
        <a href="#" className={styles.active}>Inicio</a>
        <a href="#">Comprar vehículos</a>
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
