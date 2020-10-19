import React, {useState} from 'react';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';
import {Link} from "react-router-dom";

const NavigationBar = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand><Link to='/'>Jira Instance Manager</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link><Link to='/'>Home</Link></Nav.Link>
            <NavDropdown title="Add Environment" id="basic-nav-dropdown">
              <NavDropdown.Item><Link to='/new'>New Environment</Link></NavDropdown.Item>
              <NavDropdown.Item><Link to='/addExisting'>Add existing environment</Link></NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Options" id="nav-dropdown-options">
              <NavDropdown.Item><Link to='/configManager'>Config Manager</Link></NavDropdown.Item>
            </NavDropdown>
            <Nav.Link><Link to="/h2-console" target="_blank">H2-Console</Link></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
  );
}

export default NavigationBar;