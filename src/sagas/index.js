import {
  call,
  delay,
  fork,
  put,
  take,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import { hideModal, showModal } from '../actions/modal';
import {
  addTaskFailed,
  addTaskSuccess,
  fetchListTask,
  fetchListTaskFailed,
  fetchListTaskSuccess,
} from '../actions/task';
import { hideLoading, showLoading } from '../actions/ui';
import { addTask, getList, updateTask } from '../apis/task';
import { STATUSES, STATUSES_CODE } from '../constants';
import * as taskTypes from '../constants/task';

function* watchFetchListTaskAction() {
  while (true) {
    const action = yield take(taskTypes.FETCH_TASK);
    yield put(showLoading());
    const { params } = action.payload;
    const response = yield call(getList, params);
    const { status, data } = response;
    if (status === STATUSES_CODE.SUCCESS) {
      // dispatch action fetchListTaskSuccess
      yield put(fetchListTaskSuccess(data));
    } else {
      // dispatch action fetchListTaskFailed
      yield put(fetchListTaskFailed(data));
    }
    yield delay(500);
    yield put(hideLoading());
  }
}

function* filterTaskSaga({ payload }) {
  yield delay(500);
  const { keyword } = payload;
  yield put(fetchListTask({ q: keyword }));
}

function* addTaskSaga({ payload }) {
  const { title, description } = payload;
  yield put(showLoading());
  yield put(hideModal());
  const response = yield call(addTask, {
    title,
    description,
    status: STATUSES[0].value,
  });

  const { data, status } = response;
  if (status === STATUSES_CODE.CREATED) {
    yield put(addTaskSuccess(data));
  } else {
    yield put(addTaskFailed(data));
    yield put(showModal());
  }
  yield put(hideLoading());
}

function* updateTaskSaga({ payload }) {
  const { title, description, status } = payload.data;
  yield put(showLoading());
  yield put(hideModal());
  const response = yield call(updateTask, {
    title,
    description,
    status,
  });
}

function* rootSaga() {
  yield fork(watchFetchListTaskAction);
  yield takeLatest(taskTypes.FILTER_TASK, filterTaskSaga);
  yield takeEvery(taskTypes.ADD_TASK, addTaskSaga);
  yield takeLatest(taskTypes.UPDATE_TASK, updateTaskSaga);
}

export default rootSaga;
