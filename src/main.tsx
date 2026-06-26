import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { inject } from '@vercel/analytics';
import App from './App.tsx';
import './index.css';

// Inject Vercel analytics programmatically with custom proxy endpoints to bypass ad blockers
inject({
  scriptSrc: '/va/script.js',
  endpoint: '/va/event'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
