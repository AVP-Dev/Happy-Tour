<p align="center">
  <img src="/public/img/logo.png" alt="Happy Tour Logo" width="200"/>
</p>

<h1 align="center">🌴 Happy Tour 🌴</h1>

<p align="center">
  <strong>Мир ярче с нами!</strong>
  <br />
  Полнофункциональное веб-приложение для туристического агентства, созданное с использованием современных технологий.
</p>

<p align="center">
  <a href="https://happytour.by/"><strong>Посмотреть Live Demo »</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Chakra%20UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" alt="Chakra UI">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/NextAuth.js-000?style=for-the-badge&logo=nextauth.js&logoColor=white" alt="NextAuth.js">
  <img src="https://img.shields.io/github/license/AVP-Dev/Happy-Tour?style=for-the-badge" alt="License">
</p>

## 📜 О проекте

**Happy Tour** — это демонстрация возможностей современного веб-стека на примере реального бизнес-кейса — сайта туристического агентства. Приложение спроектировано с акцентом на производительность, масштабируемость и удобство поддержки, предоставляя интуитивно понятный интерфейс для клиентов и мощную админ-панель для управления контентом.

### ✨ Ключевые возможности

**Клиентская часть:**
*   **Каталог туров:** Просмотр предложений с удобной фильтрацией и поиском.
*   **Детальная информация:** Полное описание каждого тура с яркой фотогалереей.
*   **Отзывы и рейтинг:** Система обратной связи от клиентов.
*   **Форма обратной связи:** Простой способ связаться с агентством.
*   **Адаптивный дизайн:** Идеальное отображение на всех устройствах (Mobile-First).

**Административная панель:**
*   **Безопасный вход:** Аутентификация для администраторов с разделением ролей.
*   **CRUD-операции:** Полное управление турами, пользователями и отзывами.
*   **Статистика:** Дашборд с ключевыми метриками сайта.
*   **Медиафайлы:** Интерфейс для загрузки и управления изображениями.

## 🛠️ Стек технологий

Проект построен на надежных и масштабируемых технологиях:

*   **[Next.js](https://nextjs.org/):** Фреймворк для React с SSR и SSG.
*   **[React](https://reactjs.org/):** Библиотека для создания UI.
*   **[Chakra UI](https://chakra-ui.com/):** Библиотека UI-компонентов.
*   **[Prisma](https://www.prisma.io/):** Современный ORM для работы с базой данных.
*   **[NextAuth.js](https://next-auth.js.org/):** Решение для аутентификации.
*   **[SWR](https://swr.vercel.app/):** React-хуки для получения и кэширования данных.
*   **[React Hook Form](https://react-hook-form.com/):** Библиотека для управления формами.

## 🚀 Как начать работу

Чтобы запустить проект локально, следуйте этим шагам:

1.  **Клонируйте репозиторий**
    ```sh
    git clone https://github.com/AVP-Dev/Happy-Tour.git
    cd Happy-Tour
    ```

2.  **Установите зависимости**
    ```sh
    npm install
    # или
    yarn install
    ```

3.  **Настройте переменные окружения**
    *   Создайте файл `.env` в корне проекта.
    *   Скопируйте в него содержимое из `.env.example` и заполните своими данными (ключи для базы данных, NextAuth и т.д.).

4.  **Примените миграции Prisma**
    ```sh
    npx prisma migrate dev
    ```

5.  **Запустите сервер для разработки**
    ```sh
    npm run dev
    # или
    yarn dev
    ```

6.  Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности смотрите в файле `LICENSE`.