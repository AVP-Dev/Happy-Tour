// lib/prisma.js
// Этот файл инициализирует PrismaClient для использования во всем приложении.
// Это гарантирует, что у нас есть один экземпляр PrismaClient,
// который может быть переиспользован, что предотвращает утечки соединений в разработке
// и обеспечивает эффективное использование ресурсов в production.

import { PrismaClient } from '@prisma/client';

let prisma;

// В production-среде создаем новый экземпляр PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // В non-production средах (development, test) используем глобальный объект
  // для предотвращения создания множества экземпляров PrismaClient
  // при горячей перезагрузке (hot-reloading), что может привести к проблемам с соединениями.
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Экспортируем экземпляр PrismaClient для использования в других частях приложения
export default prisma;
