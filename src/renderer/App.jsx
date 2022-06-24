import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import ThemeProvider from './theme';
import './App.css';
import {
  InstanceManager,
  JiraInstancesList,
  LaunchScreen,
  Settings,
  ProcessProgressInfo,
} from './pages';

export default function App() {
  const RenderRoutes = () => {
    return (
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LaunchScreen />} />
          <Route path="/jiraInstances" element={<JiraInstancesList />} />
          <Route path="/instanceManager" element={<InstanceManager />} />
          <Route path="/processInfo" element={<ProcessProgressInfo />} />
          <Route path="/settings" element={<Settings />} />
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
