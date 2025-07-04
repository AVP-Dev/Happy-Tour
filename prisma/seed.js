// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Запуск скрипта для посева базы данных...');

  // Проверяем, есть ли уже администраторы в базе
  const adminCount = await prisma.adminUser.count();
  if (adminCount > 0) {
    console.log('Администраторы уже существуют. Посев не требуется.');
    return;
  }

  console.log('Администраторы не найдены. Создание нового super_admin...');

  // Данные для первого администратора
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123'; // Убедись, что сменишь этот пароль после первого входа
  const saltRounds = 10;

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  // Создаем пользователя
  const adminUser = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'super_admin', // Устанавливаем роль super_admin
    },
  });

  console.log('Успешно создан новый super_admin:');
  console.log(`  Email: ${adminUser.email}`);
  console.log(`  Роль: ${adminUser.role}`);
  console.log('Пожалуйста, используйте эти данные для входа и не забудьте сменить пароль.');
}

main()
  .catch((e) => {
    console.error('Ошибка во время выполнения скрипта посева:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Скрипт посева завершил работу.');
  });
