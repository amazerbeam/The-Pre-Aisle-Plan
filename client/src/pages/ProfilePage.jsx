import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
  const { user, updatePreferences } = useAuth();
  const [defaultServings, setDefaultServings] = useState(
    user?.defaultServings || 2
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await updatePreferences({ defaultServings });
      setMessage('Preferences saved successfully!');
    } catch (error) {
      setMessage('Failed to save preferences.');
      console.error('Save preferences error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Profile Settings</h1>

        <div className={styles.userInfo}>
          <p className={styles.label}>Name</p>
          <p className={styles.value}>{user?.name}</p>

          <p className={styles.label}>Email</p>
          <p className={styles.value}>{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.sectionTitle}>Preferences</h2>

          <div className={styles.formGroup}>
            <label htmlFor="defaultServings" className={styles.formLabel}>
              Default Servings
            </label>
            <input
              id="defaultServings"
              type="number"
              min="1"
              max="10"
              value={defaultServings}
              onChange={(e) => setDefaultServings(parseInt(e.target.value))}
              className={styles.input}
            />
            <p className={styles.hint}>
              This will be the default number of servings when adding recipes to
              your meal plan.
            </p>
          </div>

          {message && (
            <p
              className={
                message.includes('success') ? styles.success : styles.error
              }
            >
              {message}
            </p>
          )}

          <Button type="submit" fullWidth disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </div>
    </div>
  );
};
