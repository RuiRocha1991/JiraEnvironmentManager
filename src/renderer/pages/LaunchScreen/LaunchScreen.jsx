import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Layout } from '../../components';
import { updateSettings } from '../../redux/slices/settingsSlice';
import { loadAllInstances } from '../../redux/slices/jiraInstanceSlice';

const Container = styled('div')(({ theme }) => ({
  height: '100%',
  position: 'relative',
}));

const ProgressContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'block',
  width: '100%',
}));

const LaunchScreen = () => {
  const [state, setState] = useState({
    progressInfo: 'Loading database configuration',
  });

  const dispatch = useDispatch();

  const loadDatabaseInformation = () => {
    window.electron.ipcRenderer.sendMessage('getSettings', []);
  };

  const loadJiraInstances = () => {
    window.electron.ipcRenderer.sendMessage('loadJiraInstances', []);
    window.electron.ipcRenderer.once('loadJiraInstances', ({ response }) => {
      const { status, data } = response;
      if (status === 'OK') {
        dispatch({
          type: loadAllInstances.type,
          payload: data,
        });
        window.electron.ipcRenderer.sendMessage('redirectMainWindow', [
          '/jiraInstances',
        ]);
      } else {
        console.log('error on load jira instances');
      }
    });
  };

  window.electron.ipcRenderer.once('getSettings', ({ response }) => {
    const { status, data } = response;
    if (status === 'OK') {
      if (!('isFirstLaunch' in data)) {
        setState({
          progressInfo: 'Redirect to Settings Page',
        });
        window.electron.ipcRenderer.sendMessage('openSettingsScreen', []);
        window.electron.ipcRenderer.on('forceUpdate', () => {
          loadDatabaseInformation();
        });
      } else {
        setState({
          progressInfo: 'Load Jira Instances',
        });
        dispatch({
          type: updateSettings.type,
          payload: { ...response.data, isFirstLaunch: false },
        });
        loadJiraInstances();
      }
    } else {
      console.log('error on load settings');
    }
  });

  useEffect(() => {
    loadDatabaseInformation();
  }, []);

  return (
    <Layout>
      <Container>
        <ProgressContainer>
          <Typography variant="h1" component="div" gutterBottom align="center">
            Jira Environment Manager
          </Typography>
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            <Typography
              variant="body2"
              component="div"
              gutterBottom
              align="center"
              sx={{ mt: 1 }}
            >
              {state.progressInfo} ...
            </Typography>
          </Box>
        </ProgressContainer>
      </Container>
    </Layout>
  );
};

export default LaunchScreen;
