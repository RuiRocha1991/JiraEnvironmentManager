import axios from 'axios'

export const REQUEST_INSTANCES = "REQUEST_INSTANCES";
export const RECEIVE_INSTANCES = "RECEIVE_POSTS";
export const UPDATE_JIRA_INSTANCE_START_STOP = "UPDATE_JIRA_INSTANCE_START_STOP";
export const HANDLE_RUNNING_ACTION_TRUE = "HANDLE_RUNNING_ACTION_TRUE";
export const HANDLE_RUNNING_ACTION_FALSE = "HANDLE_RUNNING_ACTION_FALSE";
export const SHOW_DIALOG = "SHOW_DIALOG";
export const HIDE_DIALOG = "HIDE_DIALOG";
export const CREATE_NEW_INSTANCE = "CREATE_NEW_INSTANCE";
export const EDIT_INSTANCE = "EDIT_INSTANCE";
export const START_PROCESSING = "START_PROCESSING";
export const END_PROCESSING = "END_PROCESSING";
export const STOP_PROCESSING = "STOP_PROCESSING";
export const UPDATE_PROCESS = "UPDATE_PROCESS";
export const UPDATE_JIRA_INSTANCE = "UPDATE_JIRA_INSTANCE";
export const SET_CONFIG_BASE_ON_CREATE = "SET_CONFIG_BASE_ON_CREATE";
export const UPDATE_SETENV = "UPDATE_SETENV";
export const ADD_INSTANCE_TO_LIST = "ADD_INSTANCE_TO_LIST";
export const DELETE_INSTANCE = "DELETE_INSTANCE";
export const START_DELETE_INSTANCE = "START_DELETE_INSTANCE";
export const UPDATE_LABEL_VALUE_SERVER_PATH = "UPDATE_LABEL_VALUE_SERVER_PATH";
export const UPDATE_LABEL_VALUE_NAME = "UPDATE_LABEL_VALUE_NAME";
export const UPDATE_LABEL_VALUE_HOME_PATH = "UPDATE_LABEL_VALUE_HOME_PATH";
export const PROCESS_ABORTED = "PROCESS_ABORTED";
export const ADD_ONE_ENVIRONMENT = "ADD_ONE_ENVIRONMENT";
export const ADD_ALL_ENVIRONMENT = "ADD_ALL_ENVIRONMENT";
export const KEEP_DATA_WHILE_PROCESSING = "KEEP_DATA_WHILE_PROCESSING";
export const UPDATE_REF_TEXTAREA = "UPDATE_REF_TEXTAREA";
export const SET_CONFIG_TYPE = "SET_CONFIG_TYPE";

export const requestInstances = () => ({
  type: REQUEST_INSTANCES,
});

export const receiveInstances = (data) => ({
  type: RECEIVE_INSTANCES,
  instances: data,
});

export const isHandleRunningActionTrue = (id) => ({
  type: HANDLE_RUNNING_ACTION_TRUE,
  payload: {id}
});

export const isHandleRunningActionFalse = (id) => ({
  type: HANDLE_RUNNING_ACTION_FALSE,
  payload: {id}
});

export const updateInstanceOnStartStop = (id, pid) => ({
  type: UPDATE_JIRA_INSTANCE_START_STOP,
  payload: {id, pid}

})

export const showDialog = (message) => ({
  type: SHOW_DIALOG,
  payload: {message}
})

export const hideDialog = () => ({
  type: HIDE_DIALOG
})

export const openCreateJiraPage = (jiraVersions) => ({
  type: CREATE_NEW_INSTANCE,
  payload: {jiraVersions}
})

export const openEditJiraPage = () => ({
  type: EDIT_INSTANCE
})

export const startProcessing = () => ({
  type: START_PROCESSING
})

export const stopProcessing = () => ({
  type: STOP_PROCESSING
})

export const endProcessing = () => ({
  type: END_PROCESSING
})

export const fetchInstances = () => (dispatch) => {
  dispatch(requestInstances());
  axios.get("/api/jirainstance/")
  .then(({data}) => {
    dispatch(receiveInstances(data))
  }).catch((response, xhr) => {
    var message = {
      title: "Error",
      message: response.toString(),
      isSuccess: false
    }
    dispatch(showDialog(message));
    //setTimeout(dispatch(fetchInstances()), 5000)
  })
};

export const startStopJira = (id, running) => (dispatch) => {
  dispatch(isHandleRunningActionTrue(id))
  axios.post("/api/jirainstance/startAndStop", {
    id: id,
    isStart: running,
  })
  .then(({data}) => {
    dispatch(isHandleRunningActionFalse(id));
    if (data.success) {
      dispatch(updateInstanceOnStartStop(id,
          data.data !== "" ? data.data : "0"));
    } else {
      dispatch(showDialog({
        title: data.title,
        message: data.message,
        isSuccess: data.success
      }));
    }
  })
  .catch((response, xhr) => {
    console.log(response);
  });
}

export const fetchJiraVersions = () => (dispatch) => {
  dispatch(requestInstances());
  axios.get("/api/jirainstance/jira/versions")
  .then(({data}) => {
    if (data.data != null) {
      const list = Object.keys(data.data);
      list.sort((a, b) => b - a);
      let result = {};
      list.forEach(item => {
        result = {
          ...result,
          ["'" + item + "'"]: data.data[item]
        }
      });
      Object.keys(result).forEach(key => {
        let minors = {};
        const values = Object.keys(result[key]);
        values.sort((a, b) => b.split('.')[1] - a.split('.')[1]);
        values.forEach(i => {
          minors = {
            ...minors,
            ["'" + i + "'"]: result[key][i]
          }
        })
        result[key] = minors;
      });
      dispatch(openCreateJiraPage(result));
    } else {
      dispatch(showDialog(data));
      setTimeout(dispatch(fetchJiraVersions()), 5000)
    }

  })
  .catch((response, xhr) => {
    dispatch(showDialog(response));
  })
}

export const setConfigBaseOnCreate = (configBase) => ({
  type: SET_CONFIG_BASE_ON_CREATE,
  payload: {configBase}
})

export const fetchConfigBaseOnCreate = () => (dispatch) => {
  axios.get("/api/jirainstance/base/config/on/create")
  .then(({data}) => {
    const result = data.data.map(conf => ({name: conf.name, config: conf.config}));
    dispatch(setConfigBaseOnCreate(result))
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const updateProcess = (processCreate) => {
  return {
    type: UPDATE_PROCESS,
    payload: {processCreate}
  }
}

export const setJiraInstanceOnCreate = (jiraInstance) => ({
  type: UPDATE_JIRA_INSTANCE,
  payload: {jiraInstance}
})

export const fetchProcessInfo = (id) => (dispatch) => {
  axios.get("/api/process/" + id,)
  .then(({data}) => {
    const progress = data.data;
    if (progress.progress === 100) {
      dispatch(updateProcess(data.data));
      dispatch(fetchJiraInstanceByNameOnCreate(progress.jiraInstanceName));
      dispatch(fetchConfigBaseOnCreate())
      setTimeout(() => {
        dispatch(endProcessing())
      }, 1000);

    } else {
      setTimeout(() => {
        dispatch(updateProcess(data.data));
        dispatch(fetchProcessInfo(id));
      }, 3000);

    }
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const fetchJiraInstanceByNameOnCreate = (name) => (dispatch) => {
  axios.get("/api/jirainstance/getByName/" + name)
  .then(({data}) => {
    dispatch(setJiraInstanceOnCreate(data.data));
    dispatch(fetchSetEnv(data.data.id))
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const createJiraInstanceSubmit = (createJiraInstance) => (dispatch) => {
  dispatch(startProcessing());
  axios.post("/api/jirainstance/create", {
    ...createJiraInstance
  })
  .then(({data}) => {
    if (data.success) {
      const process = JSON.parse(data.data);
      const processCreate = {
        id: process.processId,
        progress: 0,
        status: "UNKNOWN",
        jiraInstanceName: process.jiraName
      }
      dispatch(updateProcess(processCreate));
      dispatch(fetchProcessInfo(process.processId));
    } else {
      dispatch(showDialog({
        title: data.title,
        message: data.message,
        isSuccess: data.success,
        isCreatingJira: true
      }))
    }

  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const updateSetEnv = (setenv) => ({
  type: UPDATE_SETENV,
  payload: {setenv}
})

export const fetchSetEnv = (id) => (dispatch) => {
  axios.get("/api/jirainstance/getSetenv/" + id)
  .then(({data}) => {
    dispatch(updateSetEnv(data.data));
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const fetchUpdateSetEnv = (id, setenv) => (dispatch) => {
  axios.post("/api/jirainstance/setenv/", {id, setenv})
  .then(({data}) => {
    dispatch(updateInstancesList(data.data));
    window.location.pathname = '/'
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const updateInstancesList = (instance) => ({
  type: ADD_INSTANCE_TO_LIST,
  payload: {instance}
})

export const deleteInstance = (id) => (dispatch) => {
  dispatch(startDeleteInstance(id));
  axios.delete("/api/jirainstance/" + id)
  .then(({data}) => {
    dispatch(deleteInstanceStore(id));
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const startDeleteInstance = (id) => ({
  type: START_DELETE_INSTANCE,
  payload: {id}
})

export const deleteInstanceStore = (id) => (
    {
      type: DELETE_INSTANCE,
      payload: {id}
    }
)

export const updateLabelValueServerPath = (value) => (
    {
      type: UPDATE_LABEL_VALUE_SERVER_PATH,
      payload: {value}
    }
)

export const updateLabelValueHomePath = (value) => (
    {
      type: UPDATE_LABEL_VALUE_HOME_PATH,
      payload: {value}
    }
)

export const updateLabelValueName = (value) => (
    {
      type: UPDATE_LABEL_VALUE_NAME,
      payload: {value}
    }
)

export const processAborted = () => (
    {
      type: PROCESS_ABORTED
    }
)

export const addOneEnvironment = () => (
    {type: ADD_ONE_ENVIRONMENT}
)
export const addAllEnvironment = () => (
    {type: ADD_ALL_ENVIRONMENT}
)

export const submitAddAllEnvironments = (paths) => (dispatch) => {
  dispatch(startProcessing());
  axios.post("/api/instance/addBulk", paths)
  .then(() => {
    window.location.pathname = '/'
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const submitAddOneEnvironment = (jira) => (dispatch) => {
  dispatch(startProcessing());
  axios.post("/api/jirainstance/", jira)
  .then(({data}) => {
    dispatch(stopProcessing())
    if (data.success) {
      window.location.pathname = '/'
    } else {
      dispatch(showDialog({
        title: data.title,
        message: data.message,
        isSuccess: data.success
      }));
    }

  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const deleteTmpFilesServer = (id) => (dispatch) => {
  axios.delete("api/jirainstance/delete/tmp/files/server/" + id)
  .then(({data}) => {
    dispatch(showDialog({
      title: data.title,
      message: data.message,
      isSuccess: data.success
    }));
    window.location.pathname = '/';
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const deleteTmpFilesHome = (id) => (dispatch) => {
  axios.delete("api/jirainstance/delete/tmp/files/home/" + id)
  .then(({data}) => {
    dispatch(showDialog({
      title: data.title,
      message: data.message,
      isSuccess: data.success
    }));
    window.location.pathname = '/';
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const deleteTmpFilesAll = (id) => {

}

export const handleUpdateTextareaRef = (node) => ({
  type:UPDATE_REF_TEXTAREA,
  payload: {node}
});

export const fetchConfigBase = () => (dispatch) => {
  axios.get("/api/jirainstance/base/config/")
  .then(({data}) => {
    dispatch(setConfigBaseOnCreate(data.data))
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const setConfigType = (config) => ({
  type: SET_CONFIG_TYPE,
  payload: {config}
})

export const fetchConfigType = () => (dispatch) => {
  axios.get("/api/jirainstance/base/config/type")
  .then(({data}) => {
    dispatch(setConfigType(data.data))
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

export const addBaseConfig = (value) => dispatch => {
  axios.post("/api/jirainstance/base/config/", value)
  .then(({data}) => {
    if (data.success) {
      window.location.pathname = '/'
    } else {
      dispatch(showDialog({
        title: data.title,
        message: data.message,
        isSuccess: data.success
      }));
    }
  })
  .catch((response) => {
    dispatch(showDialog(response));
  })
}

