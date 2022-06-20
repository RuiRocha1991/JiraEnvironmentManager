import {
  Checkbox,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { filter } from 'lodash';
import { JiraInstanceMoreMenu } from '../index';
import { SearchNotFound } from '../../../../components';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_instance) =>
        _instance.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

const JiraInstancesListBody = (props) => {
  const {
    filterName,
    jiraInstances,
    order,
    orderBy,
    pagination,
    selected,
    handleClick,
  } = props;

  const { page, rowsPerPage } = pagination;
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jiraInstances.length) : 0;
  const filteredInstances = applySortFilter(
    jiraInstances,
    getComparator(order, orderBy),
    filterName
  );
  const isInstanceNotFound = filteredInstances.length === 0;
  return (
    <>
      <TableBody>
        {filteredInstances
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
            const {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              _id,
              name,
              description,
              serverSize,
              homeSize,
              quickReload,
              pid,
              lastRunning,
              isRunning,
            } = row;
            const isItemSelected = selected.indexOf(name) !== -1;

            return (
              <TableRow
                hover
                key={_id}
                tabIndex={-1}
                role="checkbox"
                selected={isItemSelected}
                aria-checked={isItemSelected}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isItemSelected}
                    onChange={(event) => handleClick(event, name)}
                  />
                </TableCell>
                <TableCell component="th" scope="row" padding="none">
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle2" noWrap>
                      {name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="left">{description}</TableCell>
                <TableCell align="left">{serverSize}</TableCell>
                <TableCell align="left">{homeSize}</TableCell>
                <TableCell align="left">{quickReload ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">{pid}</TableCell>
                <TableCell align="left">{lastRunning}</TableCell>
                <TableCell align="right">
                  <JiraInstanceMoreMenu />
                </TableCell>
              </TableRow>
            );
          })}
        {emptyRows > 0 && (
          <TableRow style={{ height: 69 * emptyRows }}>
            <TableCell colSpan={9} />
          </TableRow>
        )}
      </TableBody>

      {isInstanceNotFound && (
        <TableBody>
          <TableRow>
            <TableCell
              align="center"
              colSpan={9}
              sx={{ py: 3 }}
              style={{ height: 69 * rowsPerPage }}
            >
              <SearchNotFound searchQuery={filterName} />
            </TableCell>
          </TableRow>
        </TableBody>
      )}
    </>
  );
};

export default JiraInstancesListBody;

JiraInstancesListBody.propTypes = {
  filterName: PropTypes.string.isRequired,
  jiraInstances: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  }).isRequired,
  selected: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  handleClick: PropTypes.func.isRequired,
};
