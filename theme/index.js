import { extendTheme } from '@chakra-ui/react';

const styles = {
  global: {
    'html, body': {
      color: 'gray.800',
      lineHeight: 'tall',
      bg: 'gray.50',
    },
    '#__next': {
      position: 'relative',
      isolation: 'isolate',
    },
    '#__next::before': {
      content: '""',
      position: 'absolute', 
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "url('/pattern-world-map-travel.webp')",
      backgroundSize: '1350px',
      backgroundRepeat: 'repeat',
      opacity: 0.1, 
      zIndex: -1,
    },
    a: {
      color: 'brand.600',
      _hover: {
        textDecoration: 'none',
        color: 'brand.700',
      },
    },
    // ИЗМЕНЕНИЕ: Добавлено правило для значка reCAPTCHA
    '.grecaptcha-badge': {
      // Двигаем значок вверх, чтобы он не перекрывал плавающую кнопку.
      // 90px должно быть достаточно. Можешь поменять это значение, если нужно.
      // !important нужен, чтобы переопределить стили Google, которые вставляются напрямую.
      bottom: '90px !important',
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
      item: {
        bg: 'white',
      },
    }
  }
};

const theme = extendTheme({ colors, fonts, styles, components });

export default theme;
