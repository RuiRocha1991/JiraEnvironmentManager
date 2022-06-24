import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';

const Container = styled('div')(() => ({
  position: 'absolute',
  bottom: '24px',
  right: '24px',
  left: '24px',
}));

const ButtonContainer = styled('div')(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const RegisterButtonsContainer = (props) => {
  const { disabled, closeWindow, isSubmitting } = props;

  return (
    <Container>
      <ButtonContainer>
        <Button
          disabled={disabled}
          size="large"
          variant="contained"
          fullWidth
          sx={{ mr: 1 }}
          onClick={closeWindow}
        >
          Cancel
        </Button>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ ml: 1 }}
        >
          Save
        </LoadingButton>
      </ButtonContainer>
    </Container>
  );
};

export default RegisterButtonsContainer;

RegisterButtonsContainer.propTypes = {
  disabled: PropTypes.bool,
  closeWindow: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

RegisterButtonsContainer.defaultProps = {
  disabled: false,
};
