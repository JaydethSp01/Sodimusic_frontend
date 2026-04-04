# Sodimusic_frontend

Frontend oficial de Sodimusic Company con Next.js 14 (App Router), TypeScript estricto y Tailwind.

Repositorio: [github.com/JaydethSp01/Sodimusic_frontend](https://github.com/JaydethSp01/Sodimusic_frontend)

## Requisitos

- Node.js 20+
- npm 10+
- API en [Sodimusic_backend](https://github.com/JaydethSp01/Sodimusic_backend) (por defecto `http://localhost:4000`)

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Variables clave:

- `BACKEND_URL`: URL interna para server actions del frontend.
- `NEXT_PUBLIC_API_URL`: URL pública consumida por componentes cliente.
- `NEXTAUTH_SECRET`: secreto de sesión de NextAuth.
- `NEXTAUTH_URL`: URL pública del frontend.

## Ejecutar local

```bash
npm install
npm run dev
```

Frontend en `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
npm run start
```

## Tests E2E (Playwright)

Con el backend ya en marcha:

```bash
npm run test:e2e
```

Para levantar solo Next en dev y ejecutar humo UI (el API debe estar en `:4000`):

```bash
PLAYWRIGHT_START_SERVERS=1 npm run test:e2e
```
