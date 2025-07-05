// theme/index.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  // Оптимизация шрифтов остается, она работает корректно
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
    // ОТКАТ ИЗМЕНЕНИЙ: Убираем кастомные стили для кнопок.
    // Это вернет цвета кнопок к стандартным значениям Chakra UI.
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
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
