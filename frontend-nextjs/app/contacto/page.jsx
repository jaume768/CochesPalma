import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './contacto.module.css';

export default function Contacto() {
  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <section className={styles.contactoSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h1>Contacto</h1>
              <p>Estamos aquí para ayudarle. Contáctenos para cualquier consulta sobre nuestros vehículos.</p>
            </div>
          </div>
          
          <div className={styles.contactContent}>
            <div className={styles.formContainer}>
              <h2>Envíenos un mensaje</h2>
              
              <form className={styles.contactForm} action="#" method="post">
                <div className={styles.inputGroup}>
                  <label htmlFor="nombre">Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className={styles.formInput}
                    placeholder="Su nombre"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className={styles.formInput}
                    placeholder="Su correo electrónico"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    className={styles.formInput}
                    placeholder="Su número de teléfono"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="asunto">Asunto *</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    required
                    className={styles.formInput}
                    placeholder="Asunto de su mensaje"
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    className={styles.formTextarea}
                    placeholder="Escriba aquí su mensaje"
                    rows="5"
                  ></textarea>
                </div>
                
                <div className={styles.termsGroup}>
                  <input
                    type="checkbox"
                    id="politica"
                    name="politica"
                    required
                    className={styles.formCheckbox}
                  />
                  <label htmlFor="politica" className={styles.checkboxLabel}>
                    He leído y acepto la política de privacidad *
                  </label>
                </div>
                
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Enviar mensaje
                  </button>
                </div>
              </form>
            </div>
            
            <div className={styles.infoContainer}>
              <h2>Información de contacto</h2>
              
              <div className={styles.contactCard}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#0056b3"/>
                    </svg>
                  </div>
                  <div className={styles.contactText}>
                    <h3>Dirección</h3>
                    <p>Avenida Aragón, 25</p>
                    <p>07005 - Palma de Mallorca</p>
                    <p>Islas Baleares, España</p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#0056b3"/>
                    </svg>
                  </div>
                  <div className={styles.contactText}>
                    <h3>Email</h3>
                    <p><a href="mailto:info@cochespalma.com">info@cochespalma.com</a></p>
                    <p><a href="mailto:ventas@cochespalma.com">ventas@cochespalma.com</a></p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9H16.1C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9 8.4 9.1 8.2 9.1 7.9C9.1 7.8 9 7.7 9 7.6C8.6 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5ZM19 12H21C21 7 16 2 11 2V4C14.9 4 19 8.1 19 12ZM15 12H17C17 9.2 14.8 7 12 7V9C13.7 9 15 10.3 15 12Z" fill="#0056b3"/>
                    </svg>
                  </div>
                  <div className={styles.contactText}>
                    <h3>Teléfono</h3>
                    <p>Ventas: <strong>971 123 456</strong></p>
                    <p>Atención al cliente: <strong>971 123 457</strong></p>
                  </div>
                </div>
                
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#0056b3"/>
                    </svg>
                  </div>
                  <div className={styles.contactText}>
                    <h3>Horario</h3>
                    <p>Lunes a Viernes: <strong>9:00 - 20:00</strong></p>
                    <p>Sábado: <strong>10:00 - 14:00</strong></p>
                    <p>Domingo: <strong>Cerrado</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.mapContainer}>
            <h2>Encuéntrenos</h2>
            <div className={styles.map}>
              {/* En un proyecto real aquí iría el mapa de Google Maps o similar */}
              <div className={styles.mapPlaceholder}>
                <p>Aquí iría un mapa interactivo mostrando la ubicación de nuestro concesionario</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
