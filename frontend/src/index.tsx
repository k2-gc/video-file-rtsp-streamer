import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLayout from './components/layout/AppLayout';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppLayout />
  </React.StrictMode>
);
