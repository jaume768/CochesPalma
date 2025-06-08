import styles from './page.module.css';

/**
 * Componente que muestra el listado de equipamiento del vehículo
 * @param {object} props - Propiedades del componente
 * @param {array} props.equipment - Array de equipamiento del vehículo
 */
export default function VehicleEquipment({ equipment = [] }) {
  if (!equipment || equipment.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.equipmentSection}>
      <h4 className={styles.equipmentTitle}>Equipamiento</h4>
      <div className={styles.equipmentList}>
        {equipment.map((item, index) => (
          <div key={index} className={styles.equipmentItem}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
