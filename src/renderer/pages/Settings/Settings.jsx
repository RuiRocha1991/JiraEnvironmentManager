/* eslint-disable react/jsx-props-no-spreading */
import { Stack, TextField } from '@mui/material';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { Layout, RegisterButtonsContainer } from '../../components';

const isValidPath = (path) => {
  return /^((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\\[\]]+)/i.test(path);
};

const Settings = () => {
  const { settings } = useSelector((state) => state.appSettings);
  const closeSettingsWindow = () => {
    window.electron.ipcRenderer.sendMessage('closeSettingsWindow', []);
  };
  const RegisterSchema = Yup.object().shape({
    serverPath: Yup.string().test(
      'isValidPath',
      'Path is not valid',
      (value) => {
        return isValidPath(value);
      }
    ),
    homePath: Yup.string().test('isValidPath', 'Path is not valid', (value) => {
      return isValidPath(value);
    }),
    quickReloadPath: Yup.string(),
  });
  const formik = useFormik({
    initialValues: {
      serverPath: settings.serverPath || '',
      homePath: settings.homePath || '',
      memoryMin: settings.memoryMin || '',
      memoryMax: settings.memoryMax || '',
      quickReloadPath: settings.quickReloadPath || '',
      terminalName: settings.terminalName || '',
    },
    validationSchema: RegisterSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.electron.ipcRenderer.sendMessage('updateSettingsConfig', {
        ...values,
      });
      window.electron.ipcRenderer.once('updateSettingsConfig', (args) => {
        if (settings) {
          window.electron.ipcRenderer.sendMessage(
            'forceUpdateAndLoadSettings',
            []
          );
          setSubmitting(false);
          closeSettingsWindow();
        } else {
          window.electron.ipcRenderer.sendMessage('updateFirstLaunch', []);
          window.electron.ipcRenderer.once('updateFirstLaunch', (response) => {
            window.electron.ipcRenderer.sendMessage('forceUpdate', []);
            setSubmitting(false);
            closeSettingsWindow();
          });
        }
      });
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <Layout>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Server Path"
              {...getFieldProps('serverPath')}
              error={Boolean(touched.serverPath && errors.serverPath)}
              helperText={touched.serverPath && errors.serverPath}
            />

            <TextField
              fullWidth
              label="Home Path"
              {...getFieldProps('homePath')}
              error={Boolean(touched.homePath && errors.homePath)}
              helperText={touched.homePath && errors.homePath}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Memory MIN"
                {...getFieldProps('memoryMin')}
                error={Boolean(touched.memoryMin && errors.memoryMin)}
                helperText={touched.memoryMin && errors.memoryMin}
              />

              <TextField
                fullWidth
                label="Memory MAX"
                {...getFieldProps('memoryMax')}
                error={Boolean(touched.memoryMax && errors.memoryMax)}
                helperText={touched.memoryMax && errors.memoryMax}
              />
            </Stack>
            <TextField
              fullWidth
              label="Quick Reload Path"
              {...getFieldProps('quickReloadPath')}
              error={Boolean(touched.quickReloadPath && errors.quickReloadPath)}
              helperText={touched.quickReloadPath && errors.quickReloadPath}
            />

            <TextField
              fullWidth
              label="Terminal Name"
              {...getFieldProps('terminalName')}
              error={Boolean(touched.terminalName && errors.terminalName)}
              helperText={touched.terminalName && errors.terminalName}
            />
          </Stack>
          <RegisterButtonsContainer
            disabled={settings.isFirstLaunch}
            isSubmitting={isSubmitting}
            closeWindow={closeSettingsWindow}
          />
        </Form>
      </FormikProvider>
    </Layout>
  );
};

export default Settings;
