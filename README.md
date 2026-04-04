# Sodimusic Frontend

Frontend oficial de Sodimusic Company con Next.js 14 (App Router), TypeScript estricto y Tailwind.

## Requisitos

- Node.js 20+
- npm 10+
- Backend corriendo (por defecto en `http://localhost:4000`)

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

Frontend disponible en `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
npm run start
```

## Notas de separación de repos

Este frontend es autocontenido y puede vivir en su propio repositorio sin depender del `package.json` de la raíz.
