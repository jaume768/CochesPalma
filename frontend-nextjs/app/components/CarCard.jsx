import styles from '../page.module.css';
import Link from 'next/link';

export default function CarCard({ car }) {
  const { id, brand, model, price, year, fuelType, km, image } = car;
  
  return (
    <Link href={`/vehiculo/${id}`} className={styles.carCardLink}>
      <div className={styles.carCard}>
        <div className={styles.carImageContainer}>
          <img src={image} alt={`${brand} ${model}`} className={styles.carImage} />
          <div className={styles.carImageGradient}></div>
        </div>
        <div className={styles.carInfo}>
          <div className={styles.carBrandModel}>
            <h3 className={styles.carBrand}>{brand}</h3>
            <h4 className={styles.carModel}>{model}</h4>
          </div>
          <div className={styles.carDetails}>
            <span className={styles.carYear}>{year}</span>
            <span className={styles.carFuelType}>{fuelType}</span>
            <span className={styles.carKm}>{km} km</span>
          </div>
          <div className={styles.carPriceContainer}>
            <span className={styles.carPrice}>{price.toLocaleString()} €</span>
          </div>
          <div className={styles.carDetailsLink}>
            <span className={styles.detailsText}>
              Ver Detalles <span className={styles.arrowIcon}>→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
