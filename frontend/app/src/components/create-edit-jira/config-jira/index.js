import React from "react";
import {connect} from "react-redux";
import {Accordion, Button, Card, Col, Form} from "react-bootstrap";
import './config-jira.css';
import {fetchUpdateSetEnv} from "../../../redux-flow/actions";

const ConfigJiraOnCreate = ({jiraBaseConfig, jiraInstance, setenv, handleSubmit, handleTextareaRef, handleChangeTextarea}) => {
  return (
      <>
        <Col sm={3}>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                  Jira Home
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>{jiraInstance.homePath}</Card.Body>
              </Accordion.Collapse>
            </Card>
            {jiraBaseConfig.map((value, index) => (
                <Card>
                  <Card.Header>
                    <Accordion.Toggle as={Button} variant="link"
                                      eventKey={index + 1}>
                      {value.name}
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey={index + 1}>
                    <Card.Body>{value.config}</Card.Body>
                  </Accordion.Collapse>
                </Card>
            ))}
          </Accordion>

        </Col>
        <Col sm={9}>
          <Form onSubmit={handleSubmit} className="config-form">
             <Button variant="primary" type="submit" className="bt-save">
               Save
             </Button>
            <Form.Group controlId="textarea-setenv">
              <Form.Label>Set Env</Form.Label>
              <Form.Control as="textarea" rows={25} children={setenv}
                            name="textareaSetenv"/>
            </Form.Group>
          </Form>
        </Col>
      </>
  )

}

const mapStateToProps = (state) => ({
  jiraBaseConfig: state.jiraBaseConfig,
  jiraInstance: state.instance,
  setenv: state.setenv,
  textareaRef: state.textareaRef
});

const mapDispatchToProps = (dispatch) => ({
  handleSubmit: async (e) => {
    e.preventDefault();
    const text = e.target.elements.textareaSetenv.value;
    const state = await getState(dispatch);
    dispatch(fetchUpdateSetEnv(state.instance.id, text));
  }
});

const getState = (dispatch) => new Promise((resolve) => {
  dispatch((dispatch, getState) => {
    resolve(getState())
  })
})

export default connect(mapStateToProps, mapDispatchToProps)(ConfigJiraOnCreate)