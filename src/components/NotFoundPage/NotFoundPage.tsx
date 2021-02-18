import React from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
export default function NotFoundPage() {
  const location = useLocation();

  return (
    <section>
      <h4>Path not found!</h4>
      <h5>
        {location.pathname} {location.hash}
      </h5>
    </section>
  );
}
