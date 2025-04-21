import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: '#4763E4',
    colorText: '#101828',
    colorTextSecondary: '#475467',
    colorTextPlaceholder: '#667085',
    colorBorder: '#E5E7EB',
    colorBgContainer: '#FFFFFF',
    colorBgTextHover: '#F9FAFB',
    colorTextDisabled: '#98A2B3',
    colorBgContainerDisabled: '#F2F4F7',

    // Typography
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    
    // Borders
    borderRadius: 0,
    borderRadiusLG: 8,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    margin: 16,
    marginLG: 24,
  },
  components: {
    Button: {
      controlHeight: 44,
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 0,
      paddingInline: 16,
      onlyIconSize: 20,
      colorPrimary: '#4763E4',
      colorBgContainerDisabled: '#F2F4F7',
      colorTextDisabled: '#98A2B3',
    },
    Input: {
      controlHeight: 44,
      fontSize: 14,
      paddingInline: 14,
      borderRadius: 0,
      colorBgContainerDisabled: '#F2F4F7',
      colorTextDisabled: '#98A2B3',
    },
    Form: {
      labelFontSize: 14,
      marginLG: 20,
      labelColor: '#101828',
      labelHeight: 24,
    },
    Typography: {
      titleMarginBottom: 8,
      titleFontSize: 24,
    }
  },
}; 