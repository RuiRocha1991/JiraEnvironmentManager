import { Card, Container } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Page } from '../index';

const CustomPage = styled(Page)(() => ({
  height: '100%',
  'background-color': '#0093E9',
  'background-image': 'linear-gradient(225deg, #0093E9 0%, #80D0C7 100%)',
}));

const CustomContainer = styled(Container)(() => ({
  height: '100%',
  'padding-top': '24px',
  'padding-bottom': '24px',
}));

const CustomCard = styled(Card)(() => ({
  height: '100%',
  padding: '24px',
}));

const Layout = ({ children }) => {
  return (
    <CustomPage>
      <CustomContainer>
        <CustomCard variant="outlined">{children}</CustomCard>
      </CustomContainer>
    </CustomPage>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
