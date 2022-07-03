/* eslint-disable react/jsx-props-no-spreading,no-underscore-dangle,react-hooks/exhaustive-deps,no-nested-ternary */
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Box, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import {
  Layout,
  RegisterButtonsContainer,
  SettingField,
} from '../../components';
import { updateProcess } from '../../redux/slices/processSlice';

const Row = (props) => {
  const { title, value } = props;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        p: 1,
        m: 1,
        borderRadius: 1,
      }}
    >
      <div style={{ width: '30%' }}>
        <Typography variant="subtitle1" align="right" sx={{ mr: 2 }}>
          {title}
        </Typography>
      </div>
      <div style={{ width: '70%', paddingTop: 8 }}>
        <LinearProgress
          variant={value > 0 ? 'determinate' : undefined}
          color={
            value !== 0 ? (value < 100 ? undefined : 'success') : 'inherit'
          }
          sx={{
            height: 10,
          }}
          {...props}
        />
      </div>
    </Box>
  );
};

Row.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

const SettingsContainer = (props) => {
  const { settings, jiraInstance } = props;
  return (
    <>
      <Divider />
      <SettingField
        sx={{ mt: 2 }}
        value={`${settings.homePath}${jiraInstance.name}`}
        title="Home Path"
        id="home-path"
      />
      <Stack direction={{ sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <SettingField
          value={settings.memoryMin}
          title="Memory Min"
          id="memory-min"
        />
        <SettingField
          value={settings.memoryMax}
          title="Memory Max"
          id="memory-max"
        />
      </Stack>
      {jiraInstance.quickReload && (
        <SettingField
          sx={{ mt: 2 }}
          value={settings.quickReloadPath}
          title="Quick Reload Path"
          id="quick-reload"
        />
      )}
    </>
  );
};

SettingsContainer.propTypes = {
  settings: PropTypes.shape({
    homePath: PropTypes.string.isRequired,
    memoryMin: PropTypes.string.isRequired,
    memoryMax: PropTypes.string.isRequired,
    quickReloadPath: PropTypes.string.isRequired,
  }).isRequired,
  jiraInstance: PropTypes.shape({
    name: PropTypes.string.isRequired,
    quickReload: PropTypes.bool.isRequired,
  }).isRequired,
};

const ProcessProgressInfo = () => {
  const { process } = useSelector((state) => state.processInfo);
  const { settings } = useSelector((state) => state.appSettings);
  const { task } = process;
  const dispatch = useDispatch();
  const [showSettings, setShowSettings] = useState(false);

  const closeWindow = () => {
    window.electron.ipcRenderer.sendMessage('abortInstallation', [process._id]);
    window.electron.ipcRenderer.sendMessage('closeInstanceManagerWindow', []);
  };

  const handleSubmit = () => {
    window.electron.ipcRenderer.sendMessage('deleteProcess', [process._id]);
    window.electron.ipcRenderer.sendMessage('closeInstanceManagerWindow', []);
    window.electron.ipcRenderer.sendMessage('reloadInstances', []);
  };

  const loadProgressInfo = () => {
    window.electron.ipcRenderer.sendMessage('fetchProcessInfo', [process._id]);
    window.electron.ipcRenderer.once('fetchProcessInfo', ({ response }) => {
      const { status, data } = response;
      if (status === 'OK') {
        if (data.status.name !== 'Finished') {
          setTimeout(() => {
            loadProgressInfo();
          }, 5000);
        } else {
          setShowSettings(true);
        }
        dispatch({ type: updateProcess.type, payload: data });
      } else {
        console.log('Something went wrong: ', response.message);
      }
    });
  };

  useEffect(() => {
    loadProgressInfo();
  }, []);
  return (
    <Layout>
      <Row value={task.Download} title="Download Instance" />
      <Row value={task.CreateFolder} title="Create Folders" />
      <Row value={task.Unzip} title="Unzip File" />
      <Row value={task.MoveFolder} title="Move Files" />
      <Row value={task.CleanTemp} title="Remove Temporary Files" />
      {showSettings && (
        <SettingsContainer
          settings={settings}
          jiraInstance={process.jiraInstance}
        />
      )}
      <RegisterButtonsContainer
        disabled={showSettings}
        isSubmitting={false}
        closeWindow={closeWindow}
        onSubmit={handleSubmit}
        disableSubmit={!showSettings}
      />
    </Layout>
  );
};
export default ProcessProgressInfo;
