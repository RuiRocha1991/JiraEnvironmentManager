import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
