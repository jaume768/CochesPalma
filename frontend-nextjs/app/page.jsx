'use client';

import styles from './page.module.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedCars from './components/FeaturedCars';
import HistoriaEmpresa from './components/HistoriaEmpresa';
import ServiciosAdicionales from './components/ServiciosAdicionales';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <Hero />
      <FeaturedCars />
      <HistoriaEmpresa />
      <ServiciosAdicionales />
      
      <div className={styles.zoomControls}>
        <button className={styles.zoomButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3h-6" />
          </svg>
        </button>
        <button className={styles.zoomButton}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h4" />
          </svg>
        </button>
      </div>
      <Footer />
    </div>
  );
}