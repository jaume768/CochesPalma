'use client';

import { useState } from 'react';
import styles from './page.module.css';

/**
 * Componente de formulario de contacto para consultas sobre el vehículo
 * @param {object} props - Propiedades del componente
 * @param {string} props.vehicleId - ID del vehículo
 * @param {string} props.vehicleName - Nombre del vehículo (marca y modelo)
 */
export default function ContactForm({ vehicleId, vehicleName }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hola, estoy interesado/a en el ${vehicleName} y me gustaría recibir más información.`
  });

  // Estado de envío y mensajes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus('');

    try {
      // En una implementación real, enviaríamos estos datos a una API
      // Por ahora, simulamos una respuesta exitosa después de un breve retraso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulación de respuesta exitosa
      setSubmitStatus('success');
      setSubmitMessage('Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.');
      
      // Reiniciar formulario excepto el mensaje predeterminado
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: `Hola, estoy interesado/a en el ${vehicleName} y me gustaría recibir más información.`
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
      setSubmitMessage('Ha ocurrido un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit}>
      {/* Nombre */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="name">Nombre *</label>
        <input
          type="text"
          id="name"
          name="name"
          className={styles.formInput}
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Tu nombre"
        />
      </div>
      
      {/* Email */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          className={styles.formInput}
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="tu@email.com"
        />
      </div>
      
      {/* Teléfono */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="phone">Teléfono</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={styles.formInput}
          value={formData.phone}
          onChange={handleChange}
          placeholder="Tu número de teléfono"
        />
      </div>
      
      {/* Mensaje */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="message">Mensaje *</label>
        <textarea
          id="message"
          name="message"
          className={styles.formTextarea}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Tu mensaje"
        />
      </div>
      
      {/* Mensaje de estado */}
      {submitMessage && (
        <div className={`${styles.submitMessage} ${styles[submitStatus]}`}>
          {submitMessage}
        </div>
      )}
      
      {/* Botón de envío */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  );
}
