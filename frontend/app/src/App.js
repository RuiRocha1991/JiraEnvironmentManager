import React, {Component} from "react";
import "./App.css";
import AppContent from "./components/app-content";
import {connect} from "react-redux";
import {fetchInstances} from "./redux-flow/actions";

class App extends Component {

  async componentDidMount() {
    this.props.fetchInstances();
  }

  render() {
    return (
        <AppContent/>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  fetchInstances: () => dispatch(fetchInstances())
});

export default connect(null, mapDispatchToProps)(App);
