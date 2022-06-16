import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, LinearProgress, Typography } from '@mui/material';
import { Layout } from '../../components';

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

  window.electron.ipcRenderer.once('isFirstLaunch', (arg) => {
    console.log(arg);
    if (arg.isFirstLaunch) {
      console.log('is first launch and redirect to settings page...');
      setState({
        progressInfo: 'Is first launch and you will redirect to Settings page',
      });
      setTimeout(() => {
        window.electron.ipcRenderer.sendMessage('updateFirstLaunch', []);
      }, 5000);
    } else {
      console.log('is not first launch and redirect to Jira instances page...');
      setState({
        progressInfo: 'Is not first launch and redirect to Jira instances page',
      });
    }
  });
  const loadDatabaseInformation = () => {
    window.electron.ipcRenderer.sendMessage('isFirstLaunch', []);
  };

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
