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
      <Footer />
    </div>
  );
}