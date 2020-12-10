import React from 'react';
import {Dropdown, SplitButton} from 'react-bootstrap';
import {
  deleteInstance, deleteTmpFilesHome,
  deleteTmpFilesServer, openFolder,
  startStopJira
} from "../../redux-flow/actions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faSpinner,
  faStopCircle
} from "@fortawesome/free-solid-svg-icons";
import 'font-awesome/css/font-awesome.min.css';
import {connect} from "react-redux";

const DropdownAction = ({running, id, isHandleRunningAction, handleClick, handleClickDelete, isDeleting, handleClickDeleteServerTmpFiles, handleClickDeleteHomeTmpFiles, handleClickOpenServer,handleClickOpenHome}) => {
  return (
      <SplitButton
          key={id}
          id={`dropdown-split-variants-${id}`}
          variant={running ? "danger" : "success"}
          title={isHandleRunningAction ? <FontAwesomeIcon icon={faSpinner}
                                                          className="fa-pulse"/>
              : running ? <FontAwesomeIcon icon={faStopCircle}/> :
                  <FontAwesomeIcon icon={faPlayCircle}/>}
          type="button"
          onClick={handleClick(id, !running)}>
        <Dropdown.Item eventKey="1">Edit</Dropdown.Item>
        <Dropdown.Divider/>
        <Dropdown.Item eventKey="2" onClick={handleClickDeleteServerTmpFiles(id)}>Clear Server</Dropdown.Item>
        <Dropdown.Item eventKey="3" onClick={handleClickDeleteHomeTmpFiles(id)}>Clear Home</Dropdown.Item>
        <Dropdown.Divider/>
        <Dropdown.Item eventKey="4" onClick={handleClickOpenServer(id, "server")}>Open Server Folder</Dropdown.Item>
        <Dropdown.Item eventKey="5" onClick={handleClickOpenHome(id, "home")}>Open Home Folder</Dropdown.Item>
        <Dropdown.Divider/>
        <Dropdown.Item eventKey="6"
                       onClick={handleClickDelete(id)}>{isDeleting ?
            <FontAwesomeIcon icon={faSpinner}
                             className="fa-pulse"/> : ""}Delete</Dropdown.Item>
      </SplitButton>
  );
}

const mapDispatchToProps = (dispatch) => ({
  handleClick: (id, running) => (e) => {
    e.preventDefault();
    dispatch(startStopJira(id, running));
  },
  handleClickDelete: (id) => e => {
    e.preventDefault();
    dispatch(deleteInstance(id))
  },
  handleClickDeleteServerTmpFiles: (id) => (e) => {
    e.preventDefault();
    dispatch(deleteTmpFilesServer(id));
  },
  handleClickDeleteHomeTmpFiles: (id) => e => {
    e.preventDefault();
    dispatch(deleteTmpFilesHome(id));
  },
  handleClickOpenServer: (id, folder) => e => {
    e.preventDefault();
    dispatch(openFolder(id, folder))
  },
  handleClickOpenHome: (id, folder) => e => {
    e.preventDefault();
    dispatch(openFolder(id, folder))
  }
})

export default connect(null, mapDispatchToProps)(DropdownAction);