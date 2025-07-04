// theme/index.js
import { extendTheme } from '@chakra-ui/react';

const styles = {
  global: {
    'html, body': {
      color: 'gray.800',
      lineHeight: 'tall',
      // ИЗМЕНЕНО: Задаем приятный, ненавязчивый фон для всего сайта
      bg: 'gray.50', 
    },
    a: {
      color: 'brand.600',
      _hover: {
        textDecoration: 'none',
        color: 'brand.700',
      },
    },
  },
};

const colors = {
  brand: {
    50: '#F0FFF4', 100: '#C6F6D5', 200: '#9AE6B4', 300: '#68D391',
    400: '#48BB78', 500: '#38A169', 600: '#2F855A', 700: '#276749',
    800: '#22543D', 900: '#1C4532',
  },
};

const fonts = {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: 'Georgia, serif',
}

const components = {
  Button: {
    baseStyle: { fontWeight: 'semibold', borderRadius: 'lg' },
    variants: {
      solid: (props) => ({
        ...(props.colorScheme === 'brand' && {
          bg: 'brand.500', color: 'white',
          _hover: { bg: 'brand.600', _disabled: { bg: 'brand.500' } },
          _active: { bg: 'brand.700' }
        }),
      }),
    },
    defaultProps: { colorScheme: 'brand' },
  },
  Modal: {
    baseStyle: {
      dialog: { borderRadius: 'xl' },
      header: { fontWeight: 'bold', fontSize: 'xl' },
    },
  },
  Accordion: {
    baseStyle: {
      container: { border: 'none' },
      item: {
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: 'lg',
        mb: 3,
        transition: 'border-color 0.2s ease-in-out',
        _last: { mb: 0 },
        _expanded: { borderColor: 'brand.500' },
      },
      button: {
        p: 4,
        fontWeight: 'semibold',
        _hover: { bg: 'white' },
      },
      panel: { pt: 2, pb: 5, px: 4, lineHeight: '1.7' },
      icon: { fontSize: '1.2em' },
    },
  },
};

const theme = extendTheme({ colors, fonts, styles, components });

export default theme;
