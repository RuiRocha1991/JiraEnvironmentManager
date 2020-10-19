import React from 'react';
import {Container, Row} from 'react-bootstrap';
import NavigationBar from "../NavigationBar";
import InstancesTable from "../InstancesTable";
import Message from "../message";
import CreateEditJira from "../create-edit-jira";
import {BrowserRouter, Route} from "react-router-dom";
import AddExisting from "../add-existing";
import ConfigManager from "../config-manager";

const AppContent = () => {
  return (
      <BrowserRouter>
        <div>
          <NavigationBar/>
          <Message/>
          <Container className="themed-container" fluid={true}>
            <Row className="m-4">
              <Route path='/' exact
                     render={() => <InstancesTable/>}
              />
              <Route path='/new'
                     render={() => <CreateEditJira/> }
              />
              <Route path='/addExisting'
                     render={() => <AddExisting /> }
              />
              <Route path='/configManager'
                     render={() => <ConfigManager /> }
              />
              <Route path='/h2-console' component={() => {
                window.location.href = 'http://localhost:8081/h2-console';
              }}/>
            </Row>
          </Container>
        </div>
      </BrowserRouter>
  );
}



export default AppContent;