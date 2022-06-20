import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment,
  Button,
} from '@mui/material';
// component
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { Iconify } from '../../../../components';
import { addInstance } from '../../../../redux/slices/jiraInstanceSlice';

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

export default function JiraInstanceListToolbar({
  numSelected,
  filterName,
  onFilterName,
}) {
  const handleOpenAddInstance = () => {
    /* ipcRenderer.send('addInstance', {});
    ipcRenderer.once('addInstance', (_event, response) => {
      const { status, data } = response;
      if (status === 'OK') {
        dispatch({
          type: addInstance.type,
          payload: { ...response, message: `Instance ${data.name} is added` },
        });
      }
    }); */
  };

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <SearchStyle
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Jira Instance..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )}

      <div>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton onClick={() => console.log('clicked')}>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        )}
        <Button
          variant="outlined"
          sx={{ ml: 3 }}
          startIcon={<AddIcon />}
          onClick={handleOpenAddInstance}
        >
          New Environment
        </Button>
      </div>
    </RootStyle>
  );
}

JiraInstanceListToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  filterName: PropTypes.string.isRequired,
  onFilterName: PropTypes.func.isRequired,
};
