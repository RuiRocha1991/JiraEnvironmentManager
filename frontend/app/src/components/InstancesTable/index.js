import React from "react";

import TableInstancesRow from "./row";
import './table.css'
import {connect} from "react-redux";

import TableHead from "@material-ui/core/TableHead";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import LinearProgress from "@material-ui/core/LinearProgress";
import ErrorPage from "../error-page";

const InstancesTable = ({instances, isFetching, showError}) => {
  return (
        <TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead className="table-head">
              <TableRow>
                <TableCell className="column-name">Name</TableCell>
                <TableCell align="left"
                           className="column-description">Description</TableCell>
                <TableCell align="right" className="column-size">Server
                  Size</TableCell>
                <TableCell align="right" className="column-size">Home
                  Size</TableCell>
                <TableCell align="center" className="column-hasQuickReload">Quick
                  Reload</TableCell>
                <TableCell align="right"
                           className="column-PID">PID
                </TableCell><TableCell align="right"
                           className="column-lastRunning">Last Running</TableCell>
                <TableCell align="center"
                           className="column-actions">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching &&
              <TableRow >
                <TableCell colSpan={8}>
                  <LinearProgress />
                </TableCell>
              </TableRow>}
              {showError &&
              <TableRow >
                <TableCell colSpan={8}>
                  <ErrorPage/>
                </TableCell>
              </TableRow>}
              {instances.map((instance) =>
                  (<TableInstancesRow key={instance.id} {...instance}/>)
                )
              }
            </TableBody>
          </Table>
        </TableContainer>
        )
}

const mapStateToProps = (state) => ({
  instances: state.instances,
  isFetching: state.isFetching,
  showError: state.showError
})

export default connect(mapStateToProps)(InstancesTable)