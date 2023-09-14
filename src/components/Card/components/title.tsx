import React from 'react';
import styles from './title.less';

const SetPanelLayout: React.FC<{
  currentTitle?: any;
}> = ({ currentTitle }) => {
  const handle = () => {
    if (currentTitle) {
      return (
        <div className={styles.generalTitle}>
          <div className={styles.verticalLine} />
          <span className={styles.title}>{currentTitle}</span>
        </div>
      );
    }
    return null;
  };

  return handle();
};

export default SetPanelLayout;
