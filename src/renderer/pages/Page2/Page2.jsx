import { Button } from '@mui/material';
import { Layout } from '../../components';

const Page2 = () => {
  const closeModal = () => {
    window.electron.ipcRenderer.sendMessage('closeModal', []);
  };
  return (
    <Layout>
      <div>
        <h1>Modal window</h1>
      </div>
      <div>
        <Button type="button" onClick={closeModal}>
          CLOSE
        </Button>
      </div>
    </Layout>
  );
};

export default Page2;
