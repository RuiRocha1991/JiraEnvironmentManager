import { all } from 'redux-saga/effects';
import jiraInstancesSaga from './jiraInstancesSaga';
import processSaga from './processSaga';

function* rootSaga() {
  yield all([jiraInstancesSaga(), processSaga()]);
}

export default rootSaga;
