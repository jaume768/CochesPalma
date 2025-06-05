'use client';

import { useState } from 'react';
import styles from '../page.module.css';

export default function ServiciosAdicionales() {
  const [activeTab, setActiveTab] = useState('financing');

  // Define los servicios disponibles
  const servicios = {
    financing: {
      titulo: 'Te ayudamos a conseguir financiación',
      descripcion: 'Obtén pre-aprobación en minutos y deja que nuestro equipo de financiación te consiga la mejor tasa de nuestros principales prestamistas.',
      detalle: 'Nuestra amplia experiencia en el sector nos ha permitido cultivar relaciones valiosas que aprovechamos en tu beneficio. Esto incluye nuestras asociaciones con prestamistas de confianza, garantizándote las tasas más competitivas disponibles. Aplica ahora a través de nuestra segura aplicación de crédito y comienza tu viaje hacia un vehículo más nuevo y lujoso hoy mismo.',
      imagen: '/images/financing.png'
    },
    sellCar: {
      titulo: 'Vende tu coche',
      descripcion: 'Obtén una valoración instantánea y vende tu coche sin complicaciones.',
      detalle: 'Nuestro proceso simplificado hace que vender tu vehículo sea rápido y sencillo. Te ofrecemos un precio justo basado en el mercado actual y nos encargamos de todo el papeleo. Sin presiones y sin complicaciones.',
      imagen: '/images/sell-car.png'
    },
    rentCar: {
      titulo: 'Alquila un coche',
      descripcion: 'Opciones flexibles de alquiler para adaptarse a tus necesidades.',
      detalle: 'Ya sea que necesites un vehículo por un día, una semana o un mes, tenemos opciones que se adaptan a tus necesidades. Nuestra flota incluye desde económicos hasta vehículos de lujo, todos mantenidos con los más altos estándares.',
      imagen: '/images/rent-car.png'
    }
  };

  const activeService = servicios[activeTab];

  return (
    <section className={styles.serviciosSection}>
      <div className={styles.serviciosTitulo}>
        <h2>Estamos aquí <span className={styles.orangeText}>para ti.</span></h2>
        <p className={styles.serviciosSubtitulo}>
          Descubre a continuación nuestros servicios adicionales<br />
          que harán tu vida más fácil.
        </p>
      </div>

      <div className={styles.serviciosTabs}>
        <button 
          className={`${styles.servicioTab} ${activeTab === 'financing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('financing')}
        >
          Financiación
        </button>
        <button 
          className={`${styles.servicioTab} ${activeTab === 'sellCar' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('sellCar')}
        >
          Vende tu coche
        </button>
        <button 
          className={`${styles.servicioTab} ${activeTab === 'rentCar' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('rentCar')}
        >
          Alquila un coche
        </button>
      </div>

      <div className={styles.servicioContent}>
        <div className={styles.servicioImageContainer}>
          <img src={activeService.imagen} alt={activeService.titulo} className={styles.servicioImage} />
        </div>
        <div className={styles.servicioInfo}>
          <h3 className={styles.servicioTitulo}>
            {activeService.titulo.split(' ').map((word, idx, arr) => 
              idx === arr.length - 1 ? 
                <span key={idx} className={styles.blueText}>{word}.</span> : 
                <span key={idx}>{word} </span>
            )}
          </h3>
          <p className={styles.servicioDescripcion}>{activeService.descripcion}</p>
          <p className={styles.servicioDetalle}>{activeService.detalle}</p>
        </div>
      </div>
    </section>
  );
}
