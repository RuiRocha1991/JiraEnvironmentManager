import { Table, TableContainer, TablePagination } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  JiraInstanceListHead,
  JiraInstanceListToolbar,
  JiraInstancesListBody,
} from './components';
import { Layout } from '../../components';
import { loadAllInstances } from '../../redux/slices/jiraInstanceSlice';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'serverSize', label: 'Server Size', alignRight: false },
  { id: 'homeSize', label: 'Home Size', alignRight: false },
  { id: 'quickReload', label: 'Quick Reload', alignRight: false },
  { id: 'pid', label: 'PID', alignRight: false },
  { id: 'lastRunning', label: 'Last Running', alignRight: false },
  { id: '' },
];

const JiraInstancesList = () => {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { jiraInstances } = useSelector((state) => state.jiraInstanceManager);

  const dispatch = useDispatch();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  window.electron.ipcRenderer.once('reloadInstances', () => {
    window.electron.ipcRenderer.sendMessage('loadJiraInstances');
    window.electron.ipcRenderer.once('loadJiraInstances', ({ response }) => {
      const { status, data } = response;
      if (status === 'OK') {
        dispatch({
          type: loadAllInstances.type,
          payload: data,
        });
      } else {
        console.log('error on load jira instances');
      }
    });
  });

  window.electron.ipcRenderer.once('abortInstallation', (args) => {
    window.electron.ipcRenderer.sendMessage('cancelInstallNewInstance', args);
    window.electron.ipcRenderer.once(
      'cancelInstallNewInstance',
      ({ response }) => {
        const { status, data } = response;
        if (status === 'OK') {
          console.log('canceled');
        } else {
          console.log('error on cancel process');
        }
      }
    );
  });

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = jiraInstances.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };
  return (
    <Layout>
      <JiraInstanceListToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={handleFilterByName}
      />

      <TableContainer sx={{ minWidth: 800 }}>
        <Table>
          <JiraInstanceListHead
            order={order}
            orderBy={orderBy}
            headLabel={TABLE_HEAD}
            rowCount={jiraInstances.length}
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
          />
          <JiraInstancesListBody
            filterName={filterName}
            jiraInstances={jiraInstances}
            order={order}
            orderBy={orderBy}
            pagination={{ page, rowsPerPage }}
            selected={selected}
            handleClick={handleClick}
          />
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={jiraInstances.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Layout>
  );
};

export default JiraInstancesList;
