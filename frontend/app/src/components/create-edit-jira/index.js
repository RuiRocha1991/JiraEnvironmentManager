import React, {Component} from "react";
import {Button, Col, Form} from "react-bootstrap"
import {connect} from "react-redux";
import {
  createJiraInstanceSubmit,
  fetchJiraVersions,
  updateLabelValueHomePath,
  updateLabelValueName,
  updateLabelValueServerPath
} from "../../redux-flow/actions";
import "./create-edit-jira.css"
import ConfigJiraOnCreate from "./config-jira";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import FormInputText from "../form-input";

function LinearProgressWithLabel(props) {
  return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
              props.value,
          )}%`}</Typography>
        </Box>
      </Box>
  );
}

class CreateEditJira extends Component {

  async componentWillMount() {
    if (this.props.isCreateNewInstance && this.props.jiraVersions.length
        === 0) {
      await this.props.fetchJiraVersions();
    }
  }

  render() {
    const {jiraVersions, isCreateNewInstance, onSubmit, isFetching, isProcessing, processCreate, isConfig, handleChangeServerInput, labelServerPath, handleChangeCatchName, labelHomePath, handleChangeHomeInput} = this.props;
    if (isFetching) {
      return <div style={{height: "10px", width: "100%"}}><LinearProgress/>
      </div>;
    }

    if (isProcessing) {
      return (
          <div style={{height: "10px", width: "100%"}}>
            <LinearProgressWithLabel value={processCreate.progress}/>
          </div>)
    }

    return (
        <>
          {!isProcessing && !isConfig && <Col>
            <Form className="jira-form"
                  onSubmit={onSubmit}
                  aria-disabled={!isProcessing}>
              {isCreateNewInstance &&
              <Form.Group controlId="exampleForm.ControlSelect1">
                <Form.Label>Jira Version</Form.Label>
                <Form.Control as="select" name="selectJira">
                  {Object.keys(jiraVersions).map(major => <optgroup key={major}>
                    <option key={major} disabled={true}>{major.replaceAll("'",
                        "")}</option>
                    {Object.keys(jiraVersions[major]).map(minor => <>
                      <option key={minor} style={{paddingLeft: "16px"}}
                              disabled={true}> {minor.replaceAll("'",
                          "")}</option>
                      {jiraVersions[major][minor].map(
                          jira => <option style={{paddingLeft: "24px"}}
                                          key={jira.version}>{jira.version}</option>)}
                    </>)}
                  </optgroup>)}
                </Form.Control>
              </Form.Group>}

              <FormInputText controlId="jiraName"
                             handleChange={handleChangeCatchName}
                             hasHandleChange={true} label="Name" name="name"
                             placeHolder="Enter Name"
              />

              <FormInputText controlId="jiraDescription"
                             hasHandleChange={false} label="Description"
                             name="description"
                             placeHolder="Enter description"
              />

              <FormInputText controlId="serverPath"
                             handleChange={handleChangeServerInput}
                             hasHandleChange={true}
                             label="Jira Server Path (Full Path)"
                             name="serverPath"
                             placeHolder="Enter Jira Server Path"
                             text={labelServerPath}
                             hasText={true}
              />

              <FormInputText controlId="homePath"
                             handleChange={handleChangeHomeInput}
                             hasHandleChange={true}
                             label="Jira Home Path (Full Path)" name="homePath"
                             placeHolder="Enter Jira Home Path"
                             text={labelHomePath}
                             hasText={true}
              />


              <Form.Group id="formHasQuickReload">
                <Form.Check name="hasQuickReload"
                            type="switch"
                            id="hasQuickReload"
                            label="Has quick Reload"
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Submit
              </Button>

            </Form>
          </Col>}
          {isConfig && !isProcessing && <ConfigJiraOnCreate/>}
        </>
    );
  }
}

const mapStateToProps = (state) => ({
  jiraVersions: state.jiraVersions,
  isCreateNewInstance: state.isCreateNewInstance,
  instance: state.instance,
  isFetching: state.isFetching,
  isProcessing: state.isProcessing,
  processCreate: state.processCreate,
  isConfig: state.isConfig,
  jiraInstance: state.jiraInstance,
  labelServerPath: state.labelServerPath,
  labelHomePath: state.labelHomePath
});

const mapDispatchToProps = (dispatch) => ({
  fetchJiraVersions: () => dispatch(fetchJiraVersions()),
  onSubmit: async (e) => {
    e.preventDefault();
    e.persist();
    const state = await getState(dispatch);
    const major = "'" + e.target.elements.selectJira.value.split('.')[0] + "'";
    const minor = "'" + e.target.elements.selectJira.value.split('.')[0] + '.'
        + e.target.elements.selectJira.value.split('.')[1] + "'";
    const jira = state.jiraVersions[major][minor].filter(
        jiraVersion => jiraVersion.version
            === e.target.elements.selectJira.value)[0];

    if (!fieldIsEmpty(e)){
      let jiraInstance = {
        name: e.target.elements.name.value,
        hasQuickReload: e.target.elements.hasQuickReload.checked,
        serverPath: e.target.elements.serverPath.value,
        homePath: e.target.elements.homePath.value,
        description: e.target.elements.description.value,
        url: jira.zipURL,
        size: jira.size,
        processId: ""
      }
      dispatch(createJiraInstanceSubmit(jiraInstance));
    }
  },
  handleChangeServerInput: (e) => {
    e.preventDefault();
    e.persist();
    dispatch(updateLabelValueServerPath(e.target.value))
  },

  handleChangeHomeInput: (e) => {
    e.preventDefault();
    e.persist();
    dispatch(updateLabelValueHomePath(e.target.value))
  },
  handleChangeCatchName: (e) => {
    e.preventDefault();
    e.persist();
    dispatch(updateLabelValueName(e.target.value))
  },

});

const fieldIsEmpty = (e) => {
  return e.target.elements.name.value === ''
      || e.target.elements.serverPath.value === ''
      || e.target.elements.homePath.value === '';
}

const getState = (dispatch) => new Promise((resolve) => {
  dispatch((dispatch, getState) => {
    resolve(getState())
  })
})

export default connect(mapStateToProps, mapDispatchToProps)(
    CreateEditJira)