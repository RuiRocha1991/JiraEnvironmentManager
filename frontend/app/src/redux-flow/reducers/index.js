import {
  ADD_ALL_ENVIRONMENT,
  ADD_INSTANCE_TO_LIST,
  ADD_ONE_ENVIRONMENT,
  CREATE_NEW_INSTANCE,
  DELETE_INSTANCE,
  EDIT_INSTANCE,
  END_PROCESSING,
  HANDLE_RUNNING_ACTION_FALSE,
  HANDLE_RUNNING_ACTION_TRUE,
  HIDE_DIALOG,
  PROCESS_ABORTED,
  RECEIVE_INSTANCES,
  REQUEST_INSTANCES,
  SET_CONFIG_BASE_ON_CREATE, SET_CONFIG_TYPE,
  SHOW_DIALOG,
  START_DELETE_INSTANCE,
  START_PROCESSING,
  STOP_PROCESSING,
  UPDATE_JIRA_INSTANCE,
  UPDATE_JIRA_INSTANCE_START_STOP,
  UPDATE_LABEL_VALUE_HOME_PATH,
  UPDATE_LABEL_VALUE_NAME,
  UPDATE_LABEL_VALUE_SERVER_PATH,
  UPDATE_PROCESS, UPDATE_REF_TEXTAREA,
  UPDATE_SETENV
} from '../actions';

const instancesReducer = (state = {
  isFetching: false,
  instances: [],
  instance: {
    isHandleRunningAction: false,
    pid: 0,
    isDeleting: false
  },
  message: {},
  isShowDialog: false,
  jiraVersions: [],
  isCreateNewInstance: true,
  isProcessing: false,
  processCreate: {
    id: 0,
    progress: 0,
    status: "UNKNOWN",
    jiraInstanceName: ""
  },
  jiraBaseConfig: {},
  isConfig: false,
  setenv: "",
  labelServerPath: "",
  labelHomePath: "",
  labelName: "",
  error: "",
  showError: false,
  addOneEnvironment: false,
  isSelected: false,
  keepData: {},
  textarea: {},
  configType: []
}, action) => {
  switch (action.type) {
    case REQUEST_INSTANCES:
      return {
        ...state,
        isFetching: true,
      }
    case RECEIVE_INSTANCES:
      return {
        ...state,
        isFetching: false,
        instances: action.instances
      }
    case HANDLE_RUNNING_ACTION_TRUE:
      return {
        ...state,
        instances: state.instances.map(
            instance => instance.id === action.payload.id ? {
              ...instance,
              isHandleRunningAction: !instance.isHandleRunningAction
            } : instance)
      }
    case HANDLE_RUNNING_ACTION_FALSE:
      return {
        ...state,
        instances: state.instances.map(
            instance => instance.id === action.payload.id ? {
              ...instance,
              isHandleRunningAction: !instance.isHandleRunningAction,
            } : instance)
      }
    case UPDATE_JIRA_INSTANCE_START_STOP:
      return {
        ...state,
        instances: state.instances.map(
            instance => instance.id === action.payload.id ? {
              ...instance,
              running: !instance.running,
              pid: action.payload.pid
            } : instance)
      }
    case SHOW_DIALOG:
      return {
        ...state,
        message: action.payload.message,
        isShowDialog: true
      }
    case HIDE_DIALOG:
      return {
        ...state,
        message: {},
        isShowDialog: false
      }
    case CREATE_NEW_INSTANCE:
      return {
        ...state,
        isCreateNewInstance: true,
        jiraVersions: action.payload.jiraVersions,
        isFetching: false,
      }
    case EDIT_INSTANCE:
      return {
        ...state,
        isCreateNewInstance: false
      }
    case START_PROCESSING:
      return {
        ...state,
        isProcessing: true,
        labelServerPath: "",
        labelHomePath: "",
        labelName: "",
      }
    case END_PROCESSING:
      return {
        ...state,
        isProcessing: false,
        isConfig: true,
      }
    case STOP_PROCESSING:
      return {
        ...state,
        isProcessing: false
      }
    case UPDATE_PROCESS:
      return {
        ...state,
        processCreate: action.payload.processCreate,

      }
    case UPDATE_JIRA_INSTANCE:
      return {
        ...state,
        instance: {
          ...state.instance,
          ...action.payload.jiraInstance
        }
      }
    case SET_CONFIG_BASE_ON_CREATE:
      return {
        ...state,
        jiraBaseConfig: action.payload.configBase
      }
    case UPDATE_SETENV:
      return {
        ...state,
        setenv: action.payload.setenv
      }
    case ADD_INSTANCE_TO_LIST:
      let list = state.instances;
      list.push(action.payload.instance);
      return {
        ...state,
        instances: list,
      }
    case DELETE_INSTANCE:
      return {
        ...state,
        instances: state.instances.filter(
            value => value.id !== action.payload.id)
      }
    case START_DELETE_INSTANCE:
      return {
        ...state,
        instances: state.instances.map(
            instance => instance.id === action.payload.id ? {
              ...instance,
              isDeleting: true,
            } : instance)
      }
    case UPDATE_LABEL_VALUE_SERVER_PATH:
      return {
        ...state,
        labelServerPath: action.payload.value + state.labelName
      }
    case UPDATE_LABEL_VALUE_HOME_PATH:
      return {
        ...state,
        labelHomePath: action.payload.value + state.labelName
      }
    case UPDATE_LABEL_VALUE_NAME:
      return {
        ...state,
        labelName: action.payload.value
      }
    case PROCESS_ABORTED:
      return {
        ...state,
        isProcessing: false
      }
    case ADD_ONE_ENVIRONMENT:
      return {
        ...state,
        addOneEnvironment: true,
        isSelected: true
      }
    case ADD_ALL_ENVIRONMENT:
      return {
        ...state,
        addOneEnvironment: false,
        isSelected: true
      }
    case UPDATE_REF_TEXTAREA:
      return {
        ...state,
        textarea: action.payload.node
      }
    case SET_CONFIG_TYPE:
      return {
        ...state,
        configType: action.payload.config
      }
    default:
      return state
  }
}

export default instancesReducer;