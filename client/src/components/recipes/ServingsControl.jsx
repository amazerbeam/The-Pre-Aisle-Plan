import styles from './ServingsControl.module.css';

export const ServingsControl = ({ servings, onChange, min = 1, max = 10 }) => {
  const handleDecrease = () => {
    if (servings > min) {
      onChange(servings - 1);
    }
  };

  const handleIncrease = () => {
    if (servings < max) {
      onChange(servings + 1);
    }
  };

  return (
    <div className={styles.control}>
      <button
        className={styles.button}
        onClick={handleDecrease}
        disabled={servings <= min}
        aria-label="Decrease servings"
      >
        −
      </button>
      <span className={styles.value}>
        {servings} {servings === 1 ? 'serving' : 'servings'}
      </span>
      <button
        className={styles.button}
        onClick={handleIncrease}
        disabled={servings >= max}
        aria-label="Increase servings"
      >
        +
      </button>
    </div>
  );
};
