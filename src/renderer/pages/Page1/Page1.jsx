import { Button } from '@mui/material';
import { Layout } from '../../components';

const Page1 = () => {
  const openSecondWindow = () => {
    window.electron.ipcRenderer.sendMessage('openModal', []);
  };
  return (
    <Layout>
      <div>
        <h1>Main window</h1>
      </div>
      <div>
        <Button variant="outlined" type="button" onClick={openSecondWindow}>
          Open Modal
        </Button>
      </div>
    </Layout>
  );
};

export default Page1;
