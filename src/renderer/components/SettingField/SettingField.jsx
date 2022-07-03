import PropTypes from 'prop-types';
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { ContentCopyRounded } from '@mui/icons-material';

const handleCopy = (value) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(value);
};

const SettingField = (props) => {
  const { value, title, id } = props;
  return (
    <FormControl fullWidth variant="outlined" {...props}>
      <InputLabel htmlFor={`outlined-adornment-${id}`}>{title}</InputLabel>
      <OutlinedInput
        id={`outlined-adornment-${id}`}
        type="text"
        value={value}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="copy value"
              edge="end"
              onClick={() => handleCopy(value)}
            >
              <ContentCopyRounded />
            </IconButton>
          </InputAdornment>
        }
        label={title}
      />
    </FormControl>
  );
};

export default SettingField;

SettingField.propTypes = {
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
