import { all, takeEvery, put } from 'redux-saga/effects';
import { updateProcess } from '../slices/processSlice';

// eslint-disable-next-line require-yield
function* validateIfEnded({ payload }) {
  if (payload.status.name === 'Finished') {
    window.electron.ipcRenderer.sendMessage('openEditFile', [
      payload.jiraInstanceID,
    ]);
  }
}

function* jiraInstancesSaga() {
  yield all([takeEvery([updateProcess.type], validateIfEnded)]);
}

export default jiraInstancesSaga;
