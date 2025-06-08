import styles from '../page.module.css';

export default function Hero() {
  return (
    <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.orangeText}>Somos </span>
            el portal mallorquín <span className={styles.orangeText}>nº1</span> de coches de <span className={styles.orangeText}> ocasión </span>en Mallorca
          </h1>
          
          <div className={styles.buttonContainer}>
            <button className={styles.primaryButton}>
              Ver Nuestros Coches <span className={styles.arrowIcon}>→</span>
            </button>
            <button className={styles.secondaryButton}>
              Ponte en Contacto <span className={styles.arrowIcon}>→</span>
            </button>
          </div>
          
          <div className={styles.searchContainer}>
            <h3 className={styles.searchTitle}>Encuentra tu coche soñado ahora mismo:</h3>
            <div className={styles.searchBar}>
              <input 
                type="text" 
                placeholder="Buscar por marca de coche, modelo, etc."
                className={styles.searchInput} 
              />
              <button className={styles.searchButton}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.searchIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
