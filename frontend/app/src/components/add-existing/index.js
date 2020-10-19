import React from 'react';
import {connect} from "react-redux";
import {Button, Col, Form} from "react-bootstrap";
import FormInputText from "../form-input";
import {
  addAllEnvironment,
  addOneEnvironment,
  submitAddAllEnvironments,
  submitAddOneEnvironment,
  updateLabelValueHomePath,
  updateLabelValueName,
  updateLabelValueServerPath
} from "../../redux-flow/actions";
import LinearProgress from "@material-ui/core/LinearProgress";

const AddExisting = ({onSubmit, isProcessing, handleChangeServerInput, labelServerPath, handleChangeHomeInput, labelHomePath, handleChangeCatchName, handleChangeAddOneEnvironment, handleChangeAddAllEnvironment, addOneEnvironment, isSelected}) => {
  return (
      <>
        {isProcessing ? <div style={{height: "10px", width: "100%"}}>
              <LinearProgress/></div> :
            <Col>
              <fieldset>
                <Form.Group>
                  <Col sm={10}>
                    <Form.Check
                        type="radio"
                        label="Add one environment"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios1"
                        onChange={handleChangeAddOneEnvironment}
                    />
                    <Form.Check
                        type="radio"
                        label="Add all environments"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios2"
                        onChange={handleChangeAddAllEnvironment}
                    />
                  </Col>
                </Form.Group>
              </fieldset>

              {isSelected &&
              <Form className="jira-form"
                    onSubmit={onSubmit}>
                {addOneEnvironment && <FormInputText controlId="jiraName"
                                                     label="Name"
                                                     name="name"
                                                     placeHolder="Enter Name"
                />}

                {addOneEnvironment && <FormInputText controlId="jiraDescription"
                                                     label="Description"
                                                     name="description"
                                                     placeHolder="Enter description"
                />}

                <FormInputText controlId="serverPath"
                               label="Jira Server Path (Full Path)"
                               name="serverPath"
                               placeHolder="Enter Jira Server Path"
                />

                <FormInputText controlId="homePath"
                               label="Jira Home Path (Full Path)"
                               name="homePath"
                               placeHolder="Enter Jira Home Path"
                />


                {addOneEnvironment && <Form.Group id="formHasQuickReload">
                  <Form.Check name="hasQuickReload"
                              type="switch"
                              id="hasQuickReload"
                              label="Has quick Reload"

                  />
                </Form.Group>}

                <Button variant="primary" type="submit">
                  Submit
                </Button>

              </Form>}
            </Col>}
      </>

  )
}

const mapStateToProps = (state) => ({
  isProcessing: state.isProcessing,
  labelServerPath: state.labelServerPath,
  labelHomePath: state.labelHomePath,
  addOneEnvironment: state.addOneEnvironment,
  isSelected: state.isSelected,
});

const mapDispatchToProps = (dispatch) => ({
  handleChangeAddAllEnvironment: (e) => {
    dispatch(addAllEnvironment())
  },
  handleChangeAddOneEnvironment: (e) => {
    dispatch(addOneEnvironment())
  },
  onSubmit: async (e) => {
    e.preventDefault();
    e.persist();
    const state = await getState(dispatch);
    if (state.addOneEnvironment) {
      let jira = {
        name: e.target.elements.name.value,
        hasQuickReload: e.target.elements.hasQuickReload.checked,
        serverPath: e.target.elements.serverPath.value,
        homePath: e.target.elements.homePath.value,
        description: e.target.elements.description.value
      }
      dispatch(submitAddOneEnvironment(jira))
    } else {
      let paths = {
        serverPath: e.target.elements.serverPath.value,
        homePath: e.target.elements.homePath.value,
      }
      dispatch(submitAddAllEnvironments(paths));
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

const getState = (dispatch) => new Promise((resolve) => {
  dispatch((dispatch, getState) => {
    resolve(getState())
  })
})

export default connect(mapStateToProps, mapDispatchToProps)(AddExisting);