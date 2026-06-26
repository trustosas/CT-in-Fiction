import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App.tsx';
import './index.css';

// Inject Vercel analytics programmatically with custom proxy endpoints to bypass ad blockers
inject({
  scriptSrc: '/va/script.js',
  endpoint: '/va'
});

// Inject Vercel Speed Insights programmatically with custom proxy endpoints to bypass ad blockers
injectSpeedInsights({
  scriptSrc: '/vsi/script.js',
  endpoint: '/vsi'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
