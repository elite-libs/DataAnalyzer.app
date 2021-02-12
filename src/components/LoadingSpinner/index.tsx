import React from 'react';
import Refresh from '@material-ui/icons/Refresh';

import './LoadingSpinner.scss';

export default function LoadingSpinner() {
  return (
    <section className="spinner-container" aria-label="Loading... Please wait.">
      <Refresh fontSize="large" className="animate-spin" />
    </section>
  );
}
