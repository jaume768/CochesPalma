import styles from './page.module.css';

/**
 * Componente que muestra las especificaciones técnicas del vehículo
 * @param {object} props - Propiedades del componente
 */
export default function VehicleSpecs({
  year,
  km,
  fuelType,
  color,
  power,
  doors,
  bodyType,
  classification
}) {
  // Crear los items de especificaciones con etiquetas en inglés según la imagen de referencia
  const specs = [
    { label: 'AÑO', value: year || 'No disponible' },
    { label: 'KILOMETRAJE', value: km ? `${km.toLocaleString()}` : 'No disponible' },
    { label: 'COMBUSTIBLE', value: fuelType || 'No disponible' },
    { label: 'TIPO', value: bodyType || 'No disponible' },
    { label: 'TRANSMISIÓN', value: 'Automática' }, // Valor por defecto si no está disponible
    { label: 'TRACCIÓN', value: 'Delantera' }, // Valor por defecto si no está disponible
    { label: 'POTENCIA', value: power ? `${power} CV` : 'No disponible' },
    { label: 'COLOR', value: color || 'No disponible' }
  ];
  
  return (
    <>
      {specs.map((spec, index) => (
        <div key={index} className={styles.specItem}>
          <span className={styles.specLabel}>{spec.label}</span>
          <span className={styles.specValue}>{spec.value}</span>
        </div>
      ))}
    </>
  );
}
