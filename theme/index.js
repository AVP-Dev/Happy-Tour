// theme/index.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // ИЗМЕНЕНИЕ: Шрифты теперь ссылаются на CSS-переменные, определенные в _app.js
  fonts: {
    heading: 'var(--font-montserrat), sans-serif',
    body: 'var(--font-roboto), sans-serif',
  },
  colors: {
    brand: {
      50: '#E6FFFA',
      100: '#B2F5EA',
      200: '#81E6D9',
      300: '#4FD1C5',
      400: '#38B2AC',
      500: '#319795',
      600: '#2C7A7B',
      700: '#285E61',
      800: '#234E52',
      900: '#1D4044',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: props.colorScheme === 'brand' ? 'white' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          },
        }),
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
      },
    },
  },
});

export default theme;
