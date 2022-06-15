import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './theme';
import './App.css';
import { Page1, Page2 } from './pages';

export default function App() {
  window.electron.ipcRenderer.sendMessage('writeLog', [
    { level: 'debug', message: 'Message from react app', file: 'App' },
  ]);

  const RenderRoutes = () => {
    return (
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Page1 />} />
          <Route path="/secondWindow" element={<Page2 />} />
        </Routes>
      </ThemeProvider>
    );
  };

  const RenderDev = () => {
    return (
      <BrowserRouter>
        <RenderRoutes />
      </BrowserRouter>
    );
  };

  const RenderPro = () => {
    return (
      <HashRouter>
        <RenderRoutes />
      </HashRouter>
    );
  };

  const Render = () => {
    if (process.env.NODE_ENV === 'production') {
      return <RenderPro />;
    }
    return <RenderDev />;
  };

  return <Render />;
}
