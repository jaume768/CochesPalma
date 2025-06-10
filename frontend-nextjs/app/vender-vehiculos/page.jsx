'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './vender.module.css';

// Tipos de combustible para el select
const tiposCombustible = [
  { id: 1, nombre: 'Gasolina' },
  { id: 2, nombre: 'Diésel' },
  { id: 3, nombre: 'Híbrido' },
  { id: 4, nombre: 'Eléctrico' },
  { id: 5, nombre: 'GLP' },
  { id: 6, nombre: 'GNC' }
];

export default function VenderVehiculos() {
  const [showPopup, setShowPopup] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para procesar el formulario
    // Por ahora solo mostramos el popup
    setShowPopup(true);
  };
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.venderSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerContent}>
              <h1>Venda su coche con nosotros</h1>
              <p>Completa el formulario y nos pondremos en contacto con usted para valorar su vehículo</p>
            </div>
          </div>

          <div className={styles.formContainer}>
            <form className={styles.venderForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formColumn}>
                  <h3 className={styles.formSectionTitle}>Datos del contacto</h3>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="nombre">Nombre completo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={styles.formInput}
                      required
                      placeholder="Ej. Juan Pérez García"
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={styles.formInput}
                      required
                      placeholder="Ej. juanperez@email.com"
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      className={styles.formInput}
                      required
                      placeholder="Ej. 666123456"
                    />
                  </div>
                </div>

                <div className={styles.formColumn}>
                  <h3 className={styles.formSectionTitle}>Datos del vehículo</h3>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="modelo">Marca y Modelo *</label>
                    <input
                      type="text"
                      id="modelo"
                      name="modelo"
                      className={styles.formInput}
                      required
                      placeholder="Ej. BMW Serie 3"
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="fecha_matriculado">Fecha de matriculación *</label>
                      <input
                        type="date"
                        id="fecha_matriculado"
                        name="fecha_matriculado"
                        className={styles.formInput}
                        required
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="kilometraje">Kilometraje *</label>
                      <input
                        type="number"
                        id="kilometraje"
                        name="kilometraje"
                        className={styles.formInput}
                        required
                        placeholder="Ej. 120000"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="color">Color *</label>
                      <input
                        type="text"
                        id="color"
                        name="color"
                        className={styles.formInput}
                        required
                        placeholder="Ej. Azul marino"
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="potencia">Potencia (CV) *</label>
                      <input
                        type="number"
                        id="potencia"
                        name="potencia"
                        className={styles.formInput}
                        required
                        placeholder="Ej. 150"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="combustible_id">Tipo de combustible *</label>
                    <select
                      id="combustible_id"
                      name="combustible_id"
                      className={styles.formSelect}
                      required
                    >
                      <option value="">Seleccione tipo de combustible</option>
                      {tiposCombustible.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.fullWidth}>
                <div className={styles.inputGroup}>
                  <label htmlFor="observaciones">Observaciones</label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    className={styles.formTextarea}
                    placeholder="Describa detalles relevantes de su vehículo (equipamiento, estado, etc.)"
                    rows="4"
                  ></textarea>
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="comentario">Comentarios adicionales</label>
                  <textarea
                    id="comentario"
                    name="comentario"
                    className={styles.formTextarea}
                    placeholder="Indique cualquier información adicional que considere relevante"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className={styles.termsGroup}>
                  <input
                    type="checkbox"
                    id="terminos"
                    name="terminos"
                    required
                    className={styles.formCheckbox}
                  />
                  <label htmlFor="terminos" className={styles.checkboxLabel}>
                    Acepto los términos y condiciones y la política de privacidad *
                  </label>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Enviar solicitud
                </button>
              </div>
            </form>
            
            <div className={styles.infoPanel}>
              <h3>¿Por qué vender su coche con nosotros?</h3>
              
              <ul className={styles.benefitsList}>
                <li>
                  <div className={styles.benefitIcon}>✓</div>
                  <div className={styles.benefitText}>
                    <strong>Valoración profesional</strong>
                    <p>Obtendrá el mejor precio de mercado para su vehículo</p>
                  </div>
                </li>
                <li>
                  <div className={styles.benefitIcon}>✓</div>
                  <div className={styles.benefitText}>
                    <strong>Proceso rápido y seguro</strong>
                    <p>Sin complicaciones ni intermediarios</p>
                  </div>
                </li>
                <li>
                  <div className={styles.benefitIcon}>✓</div>
                  <div className={styles.benefitText}>
                    <strong>Trámites gratuitos</strong>
                    <p>Nos encargamos de toda la gestión administrativa</p>
                  </div>
                </li>
                <li>
                  <div className={styles.benefitIcon}>✓</div>
                  <div className={styles.benefitText}>
                    <strong>Pago inmediato</strong>
                    <p>Recibirá el importe en su cuenta al momento</p>
                  </div>
                </li>
              </ul>
              
              <div className={styles.contactInfo}>
                <p>¿Tiene dudas? Llámenos al:</p>
                <p className={styles.phoneNumber}>971 123 456</p>
                <p>O escríbanos a: <a href="mailto:info@cochespalma.com">info@cochespalma.com</a></p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Popup de confirmación */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h3>¡Solicitud recibida!</h3>
              <p>Gracias por su interés en vender su vehículo con nosotros. Hemos recibido sus datos y un asesor se pondrá en contacto con usted en las próximas 24-48 horas para realizar una valoración de su vehículo.</p>
              <button 
                className={styles.popupButton}
                onClick={() => setShowPopup(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
