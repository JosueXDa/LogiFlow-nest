# Auth Service - Better Auth Implementation

Este módulo implementa autenticación y autorización usando Better Auth con PostgreSQL.

## Configuración

### 1. Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Base de Datos

Inicia PostgreSQL usando Docker Compose desde la raíz del proyecto:

```bash
docker-compose up -d
```

### 3. Migraciones de Base de Datos

Better Auth usa Kysely internamente para manejar las migraciones. Para generar las tablas necesarias:

```bash
cd apps/auth-services
npx @better-auth/cli migrate
```

O para generar el schema SQL:

```bash
npx @better-auth/cli generate
```

## Estructura

- `src/entities/` - Entidades TypeORM para User, Session, Account, Verification
- `src/config/` - Configuración de TypeORM
- `src/auth.ts` - Instancia de Better Auth configurada con PostgreSQL

## Endpoints de Autenticación

Los endpoints de Better Auth están disponibles a través del API Gateway en:

- `POST /api/auth/sign-up/email` - Registro con email/password
- `POST /api/auth/sign-in/email` - Login con email/password
- `POST /api/auth/sign-out` - Cerrar sesión
- `GET /api/auth/get-session` - Obtener sesión actual
- Y más endpoints según la documentación de Better Auth

## Microservicio

El servicio también funciona como microservicio TCP en el puerto 4004 para comunicación interna entre servicios.

## Tecnologías

- NestJS
- Better Auth
- TypeORM
- PostgreSQL
- Docker

---

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
