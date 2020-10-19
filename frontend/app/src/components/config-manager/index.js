import React from 'react';
import {connect} from "react-redux";
import FormInputText from "../form-input";
import {Button, Form} from "react-bootstrap";
import {addBaseConfig, fetchConfigType} from "../../redux-flow/actions";

let fetch = false;

const ConfigManager = ({onSubmit, fetchConfig, configTypeList}) => {
  if (!fetch) {
    fetchConfig();
    fetch = true;
  }
  return (
      <Form className="jira-form"
            onSubmit={onSubmit}>
        <Form.Group controlId="selectConfigType">
          <Form.Label>Config Type</Form.Label>
          <Form.Control as="select" name="selectConfig">
            {configTypeList.map(configType => <option key={configType}
                                                      value={configType}>{configType}</option>)}

          </Form.Control>
        </Form.Group>
        <FormInputText controlId="configName"
                       label="Name"
                       name="name"
                       placeHolder="Enter Name"
        />

        <FormInputText controlId="config"
                       label="Config"
                       name="config"
                       placeHolder="Enter Config"
        />

        <Button variant="primary" type="submit">
          Submit
        </Button>

      </Form>
  )
}

const mapStateToProps = (state) => ({
  configTypeList: state.configType
});

const mapDispatchToProps = (dispatch) => ({
  fetchConfig: () => dispatch(fetchConfigType()),
  onSubmit: async (e) => {
    e.preventDefault();
    e.persist();
    const value = {
      configType: e.target.elements.selectConfig.value,
      name: e.target.elements.name.value,
      config: e.target.elements.config.value
    }
    dispatch(addBaseConfig(value))
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ConfigManager)