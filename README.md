# LogiFlow - Microservices (NestJS + Turborepo)

Repositorio monorepo con servicios NestJS orquestados con Turborepo.

## Requisitos

- Node.js >= 18
- pnpm 9
- Docker + Docker Compose

## Levantar el proyecto

1) Instalar dependencias:

```sh
pnpm install
```

2) Levantar infraestructura local (PostgreSQL + RabbitMQ):

```sh
docker compose up -d
```

3) Iniciar todos los servicios en modo desarrollo:

```sh
pnpm dev
```

### Iniciar un servicio específico

```sh
pnpm dev -- --filter=api-gateway
pnpm dev -- --filter=auth-services
pnpm dev -- --filter=fleet-service
pnpm dev -- --filter=inventory-service
pnpm dev -- --filter=pedidos-service
```

### Otros comandos útiles

```sh
pnpm build
pnpm lint
pnpm check-types
```

> Si algún servicio requiere variables de entorno, crea su archivo `.env` en la carpeta del servicio correspondiente.

## Reglas básicas al trabajar con Turborepo

1) Ejecuta comandos desde la raíz del monorepo.
2) Usa **pnpm** siempre (no mezclar npm/yarn).
3) Para correr un solo servicio, usa `--filter`.
4) Si agregas un nuevo paquete/app, decláralo en `pnpm-workspace.yaml`.
5) Mantén los nombres de tareas alineados con `turbo.json` (por ejemplo: `dev`, `build`, `lint`, `check-types`).
6) Evita instalar dependencias dentro de apps; instálalas desde la raíz.
7) Si cambias variables de entorno, recuerda que los `.env*` ya están en los inputs de cache.

## Arquitectura

- API Gateway: `apps/api-gateway`
- Auth Service: `apps/auth-services`
- Fleet Service: `apps/fleet-service`
- Inventory Service: `apps/inventory-service`
- Pedidos Service: `apps/pedidos-service`
