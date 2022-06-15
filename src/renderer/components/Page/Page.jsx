import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { forwardRef } from 'react';
import { Box } from '@mui/material';

const Page = forwardRef(({ children, title = '', meta, ...other }, ref) => (
  <>
    <Helmet>
      <title>{title}</title>
      {meta}
    </Helmet>

    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Box ref={ref} {...other}>
      {children}
    </Box>
  </>
));

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  meta: PropTypes.node,
};

Page.defaultProps = {
  title: 'Jira Environment Manager',
  meta: null,
};

export default Page;
