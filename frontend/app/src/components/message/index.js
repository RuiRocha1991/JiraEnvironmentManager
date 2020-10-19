import React from "react";
import {Button, Modal} from "react-bootstrap";
import './message.css'
import {hideDialog, processAborted} from "../../redux-flow/actions";
import {connect} from "react-redux";

const Message = ({message, handleCloseDialog, showDialog, handleCloseDialogAndAbortProcess}) => {
  return (
      <Modal show={showDialog}>
        <Modal.Header
            className={message.isSuccess ? "message-success" : "message-error"}>
          <Modal.Title>{message.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>{message.message}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={message.isCreatingJira
              ? handleCloseDialogAndAbortProcess() : handleCloseDialog()}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>)
}
const mapStateToProps = (state) => ({
  message: state.message,
  showDialog: state.isShowDialog
});

const mapDispatchToProps = (dispatch) => ({
  handleCloseDialog: () => (e) => {
    e.preventDefault();
    dispatch(hideDialog());
  },
  handleCloseDialogAndAbortProcess: () => (e) => {
    e.preventDefault();
    dispatch(hideDialog());
    dispatch(processAborted());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Message)
