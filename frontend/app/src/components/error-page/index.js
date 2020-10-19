import React from "react";
import {connect} from "react-redux";

const ErrorPage = ({error}) => {
  return (<p> {error} </p>)
}

const mapStateToProps = (state) => ({
  error: state.error
})

export default connect(mapStateToProps)(ErrorPage);