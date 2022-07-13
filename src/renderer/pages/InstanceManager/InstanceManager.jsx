/* eslint-disable react/jsx-props-no-spreading,no-underscore-dangle */
import { useEffect, useState } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import * as Yup from 'yup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, RegisterButtonsContainer } from '../../components';
import { startProcess } from '../../redux/slices/processSlice';
import { onToggleSnackBar } from '../../redux/slices/ui';

const Load = () => {
  return <CircularProgress size={30} sx={{ mr: 2 }} />;
};

const isValidPath = (path) => {
  return /^((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\\[\]]+)/i.test(path);
};

const InstanceManager = () => {
  const [isLoadingJiraVersions, setLoadingJiraVersions] = useState(false);
  const [jiraVersions, setJiraVersions] = useState([]);
  const dispatch = useDispatch();
  const {
    settings: { serverPath, homePath },
  } = useSelector((state) => state.appSettings);
  const { jiraInstances, selectedJiraInstance } = useSelector(
    (state) => state.jiraInstanceManager
  );
  const usedNames = jiraInstances.map((jira) => jira.name);
  const closeSettingsWindow = () => {
    if (selectedJiraInstance) {
      window.electron.ipcRenderer.sendMessage('removeSelectedInstance', []);
    }
    window.electron.ipcRenderer.sendMessage('closeInstanceManagerWindow', []);
  };
  const addNewJiraEnvironment = (values, setSubmitting) => {
    const major = `V ${values.jiraVersion.split('.')[0]}`;
    const minor = `${major}.${values.jiraVersion.split('.')[1]}`;

    const finalValues = {
      ...values,
      jiraVersion: jiraVersions[major][minor].find(
        (jiraInfo) => jiraInfo.version === values.jiraVersion
      ),
    };
    window.electron.ipcRenderer.sendMessage('addNewInstance', [finalValues]);
    window.electron.ipcRenderer.once('addNewInstance', ({ response }) => {
      const { status, data } = response;
      setSubmitting(false);
      if (status === 'OK') {
        dispatch({ type: startProcess.type, payload: data });
        window.electron.ipcRenderer.sendMessage(
          'redirectInstanceManagerWindow',
          ['/processInfo']
        );
      } else {
        dispatch({
          type: onToggleSnackBar.type,
          payload: {
            message: response.message,
            status: 'NOK',
          },
        });
      }
    });
  };

  const editJiraInstance = (values, setSubmitting) => {
    window.electron.ipcRenderer.sendMessage('updateJiraInstance', [
      { id: selectedJiraInstance._id, description: values.description },
    ]);
    window.electron.ipcRenderer.once('updateJiraInstance', (args) => {
      const { status, data } = args;
      setSubmitting(false);
      if (status === 'OK') {
        window.electron.ipcRenderer.sendMessage('finishUpdateInstance', [data]);
        closeSettingsWindow();
      } else {
        console.log('error on update instance');
      }
    });
  };

  const RegisterSchema = Yup.object().shape({
    jiraVersion: !selectedJiraInstance
      ? Yup.string().required('Jira Version is Required')
      : Yup.string(),
    name: Yup.string()
      .max(50, 'Too Long!')
      .required('Name is required')
      .test(
        'isUnique',
        'Name must be unique',
        (value) => selectedJiraInstance || !usedNames.includes(value)
      )
      .test(
        'hasWhitespaces',
        'Name must not contain white spaces',
        (value) => !/\s/.test(value)
      ),
    description: Yup.string().max(100, 'Too Long!'),
    serverPath: Yup.string()
      .required('Server Path is required')
      .test('isValidPath', 'Path is not valid', (value) => {
        return isValidPath(value);
      }),
    homePath: Yup.string()
      .required('Home Path is required')
      .test('isValidPath', 'Path is not valid', (value) => {
        return isValidPath(value);
      }),
    hasQuickReload: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      jiraVersion: '',
      name: selectedJiraInstance?.name || '',
      description: selectedJiraInstance?.description || '',
      serverPath: selectedJiraInstance?.serverPath || serverPath,
      homePath: selectedJiraInstance?.homePath || homePath,
      hasQuickReload: selectedJiraInstance?.hasQuickReload || false,
    },
    validationSchema: RegisterSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (selectedJiraInstance) {
        editJiraInstance(values, setSubmitting);
      } else {
        addNewJiraEnvironment(values, setSubmitting);
      }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  const loadJiraVersions = () => {
    if (!isLoadingJiraVersions && jiraVersions.length === 0) {
      setLoadingJiraVersions(true);
      window.electron.ipcRenderer.sendMessage('loadJiraVersions', []);
      window.electron.ipcRenderer.once('loadJiraVersions', ({ response }) => {
        const { status, data } = response;
        setLoadingJiraVersions(false);
        if (status === 'OK') {
          setJiraVersions(data);
        } else {
          console.log('error on loading jira versions');
        }
      });
    }
  };

  useEffect(() => {
    loadJiraVersions();
  }, []);

  return (
    <Layout>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="jira-version">Jira Version</InputLabel>
              <Select
                labelId="jira-version"
                label="Jira Version"
                disabled={isLoadingJiraVersions || !!selectedJiraInstance}
                {...getFieldProps('jiraVersion')}
                IconComponent={isLoadingJiraVersions ? Load : ArrowDropDownIcon}
              >
                {Object.keys(jiraVersions).map((major) =>
                  Object.keys(jiraVersions[major]).map((minor) =>
                    jiraVersions[major][minor].map((jira) => (
                      <MenuItem key={jira.version} value={jira.version}>
                        {jira.version}
                      </MenuItem>
                    ))
                  )
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              disabled={!!selectedJiraInstance}
              label="Name"
              {...getFieldProps('name')}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
            />

            <TextField
              fullWidth
              label="Description"
              {...getFieldProps('description')}
              error={Boolean(touched.description && errors.description)}
              helperText={touched.description && errors.description}
            />
            <TextField
              fullWidth
              disabled={!!selectedJiraInstance}
              label="Server Path (Full Path)"
              {...getFieldProps('serverPath')}
              error={Boolean(touched.serverPath && errors.serverPath)}
              helperText={touched.serverPath && errors.serverPath}
            />

            <TextField
              fullWidth
              disabled={!!selectedJiraInstance}
              label="Home Path (Full Path)"
              {...getFieldProps('homePath')}
              error={Boolean(touched.homePath && errors.homePath)}
              helperText={touched.homePath && errors.homePath}
            />
            <FormControlLabel
              disabled={!!selectedJiraInstance}
              control={<Checkbox {...getFieldProps('hasQuickReload')} />}
              label="Has Quick Reload"
            />
          </Stack>
          <RegisterButtonsContainer
            isSubmitting={isSubmitting}
            closeWindow={closeSettingsWindow}
          />
        </Form>
      </FormikProvider>
    </Layout>
  );
};

export default InstanceManager;
