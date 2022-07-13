import {
  Button,
  ButtonGroup,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { ArrowDropDown, PlayArrow, Stop, Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../../../../../components/Iconify';

const SplitButton = (props) => {
  const { isRunning, instanceId, instanceUi } = props;

  const { handleStartingOrStoppingInstance, handleEditInstance } = props;

  const [isOpen, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <>
      <ButtonGroup
        variant="outlined"
        aria-label="outlined button group"
        ref={anchorRef}
      >
        <LoadingButton
          variant="contained"
          loading={instanceUi.isStartingOrStopping}
          color={isRunning ? 'error' : 'success'}
          onClick={() => handleStartingOrStoppingInstance(instanceId)}
        >
          {isRunning ? <Stop /> : <PlayArrow />}
        </LoadingButton>
        <Button
          size="small"
          aria-controls={isOpen ? 'split-button-menu' : undefined}
          aria-expanded={isOpen ? 'true' : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Menu
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 150, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ color: 'text.secondary' }}>
          <ListItemIcon>
            {instanceUi.isDeleting ? (
              <CircularProgress size={20} />
            ) : (
              <Delete width={24} height={24} />
            )}
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>

        <MenuItem
          sx={{ color: 'text.secondary' }}
          onClick={() => handleEditInstance(instanceId)}
        >
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary="Edit"
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default SplitButton;

SplitButton.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  instanceId: PropTypes.string.isRequired,
  instanceUi: PropTypes.shape({
    isStartingOrStopping: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
  }).isRequired,
  handleStartingOrStoppingInstance: PropTypes.func.isRequired,
  handleEditInstance: PropTypes.func.isRequired,
};
