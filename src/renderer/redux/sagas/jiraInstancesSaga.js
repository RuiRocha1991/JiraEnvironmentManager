import { all, takeEvery, put } from 'redux-saga/effects';
import { addInstance } from '../slices/jiraInstanceSlice';
import { onToggleSnackBar } from '../slices/ui';

// eslint-disable-next-line require-yield
function* openToast({ payload }) {
  yield put(
    onToggleSnackBar({ message: payload.message, status: payload.status })
  );
}

function* jiraInstancesSaga() {
  yield all([takeEvery([addInstance.type], openToast)]);
}

export default jiraInstancesSaga;
