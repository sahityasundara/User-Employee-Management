import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// These imports should now work perfectly after the successful install
import 'bootstrap/dist/css/bootstrap.min.css';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';



import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);