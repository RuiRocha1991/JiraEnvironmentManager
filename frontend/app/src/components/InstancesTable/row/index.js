import React from 'react';
import './row.css'
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import {makeStyles} from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import {deleteInstance, startStopJira} from "../../../redux-flow/actions";
import {connect} from "react-redux";
import red from "@material-ui/core/colors/red";
import DropdownAction from "../../dropdown-action";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
    display: "inline-block"
  },
  buttonStopped: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },

  buttonRunning: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  buttonDelete: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  size: {
    width: "20px !important",
    height: "20px !important"
  },

  fabProgress: {
    position: 'absolute',
    top: -4,
    left: -4,
    zIndex: 1,
  },
}));

const TableInstancesRow = ({
  name,
  hasQuickReload,
  serverSize,
  homeSize,
  description,
  id,
  running, isHandleRunningAction, pid, lastRunning, isDeleting
}) => {

  return (
      <TableRow key={id} hover={true}>
        <TableCell align="left">
          {name}
        </TableCell>
        <TableCell align="left">{description}</TableCell>
        <TableCell align="right">{serverSize}</TableCell>
        <TableCell align="right">{homeSize}</TableCell>
        <TableCell align="center">
          <Checkbox
              disabled
              checked={hasQuickReload}
              inputProps={{'aria-label': 'primary disabled checkbox'}}
          />
        </TableCell>
        <TableCell align="right">{pid}</TableCell>
        <TableCell align="right">{lastRunning.replace('T', ' ').split(
            '.')[0]}</TableCell>
        <TableCell align="center">

          <DropdownAction running={running} id={id}
                          isHandleRunningAction={isHandleRunningAction}
                          isDeleting={isDeleting}/>
        </TableCell>
      </TableRow>
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
  }
})

export default connect(null, mapDispatchToProps)(TableInstancesRow);