import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';

const openSecondWindow = () => {
  window.electron.ipcRenderer.sendMessage('openModal', []);
};

const Hello = () => {
  return (
    <>
      <div>
        <h1>Main window</h1>
      </div>
      <div>
        <button type="button" onClick={openSecondWindow}>
          Open Modal
        </button>
      </div>
    </>
  );
};

const closeModal = () => {
  window.electron.ipcRenderer.sendMessage('closeModal', []);
};

const SecondWindow = () => {
  return (
    <>
      <div>
        <h1>Modal window</h1>
      </div>
      <div>
        <button type="button" onClick={closeModal}>
          CLOSE
        </button>
      </div>
    </>
  );
};

export default function App() {
  window.electron.ipcRenderer.sendMessage('writeLog', [
    { level: 'debug', message: 'Message from react app', file: 'App' },
  ]);

  const RenderRoutes = () => {
    return (
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/secondWindow" element={<SecondWindow />} />
      </Routes>
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
