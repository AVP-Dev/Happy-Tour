import { extendTheme } from '@chakra-ui/react';

const styles = {
  global: {
    // Сохраняем оригинальные базовые стили.
    'html, body': {
      color: 'gray.800',
      lineHeight: 'tall',
      bg: 'gray.50', // Этот фон будет виден под полупрозрачным паттерном.
    },
    // Стилизуем корневой элемент Next.js приложения.
    '#__next': {
      position: 'relative', // Необходимо для позиционирования псевдо-элемента.
      isolation: 'isolate', // Гарантирует, что z-index будет работать предсказуемо.
    },
    // Применяем фон как псевдо-элемент к корневому div'у приложения.
    '#__next::before': {
      content: '""',
      // 'absolute' заставляет фон прокручиваться вместе со страницей.
      position: 'absolute', 
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "url('/pattern-world-map-travel.webp')",
      // ИЗМЕНЕНИЕ: Увеличил размер паттерна, чтобы движение стало заметным.
      // Теперь при скролле будут видны разные части карты.
      backgroundSize: '1350px',
      backgroundRepeat: 'repeat',
      // ИЗМЕНЕНИЕ: Сделал фон еще немного заметнее.
      opacity: 0.1, 
      // Помещаем псевдо-элемент за всем контентом.
      zIndex: -1,
    },
    // Сохраняем твои оригинальные стили для ссылок.
    a: {
      color: 'brand.600',
      _hover: {
        textDecoration: 'none',
        color: 'brand.700',
      },
    },
  },
};

// --- Ниже все твои оригинальные настройки темы ---
// --- Я их не менял, только обновил глобальные стили выше ---

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
