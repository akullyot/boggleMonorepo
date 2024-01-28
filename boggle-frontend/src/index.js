//Import all Hooks and Dependencies
import React    from 'react';
import ReactDOM from 'react-dom/client';
//Import our main application component
import App      from './App';
//Import in all styling and bootstrap components
//Importing in all styling and CSS
import './Assets/CSS/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
