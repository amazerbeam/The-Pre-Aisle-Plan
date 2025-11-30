import { useWakeLock } from '../hooks/useWakeLock';
import { ShoppingList } from '../components/shopping/ShoppingList';
import styles from './ShoppingPage.module.css';

export const ShoppingPage = () => {
  useWakeLock(true);

  return (
    <div className={styles.shoppingPage}>
      <ShoppingList />
    </div>
  );
};
