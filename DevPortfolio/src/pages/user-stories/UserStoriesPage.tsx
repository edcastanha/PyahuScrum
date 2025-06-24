import React from 'react';
import styles from './UserStoriesPage.module.css';

const UserStoriesPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>User Stories</h1>
      <p>Gerencie suas user stories aqui.</p>
    </div>
  );
};

export default UserStoriesPage;
