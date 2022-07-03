/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Button, IconButton } from '@mui/material';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';

const TransitionUp = (props) => {
  return <Slide {...props} direction="left" />;
};

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CustomSnackbar = (props) => {
  const { snackBar, handleClose } = props;

  const action = (
    <>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  const severity = snackBar.isSuccess ? 'success' : 'error';

  return (
    <Snackbar
      open={snackBar.isOpen}
      onClose={handleClose}
      TransitionComponent={TransitionUp}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={6000}
      action={action}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {snackBar.message}
      </Alert>
    </Snackbar>
  );
};

CustomSnackbar.propTypes = {
  snackBar: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    isSuccess: PropTypes.bool.isRequired,
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CustomSnackbar;
