import { all } from 'redux-saga/effects';
import jiraInstancesSaga from './jiraInstancesSaga';

function* rootSaga() {
  yield all([jiraInstancesSaga()]);
}

export default rootSaga;
