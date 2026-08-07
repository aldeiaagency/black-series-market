# Ajuste build - opengraph-image

## Archivo modificado

- `app/opengraph-image.tsx`

## Causa

El build fallaba en `/opengraph-image` por `TypeError: Invalid URL` dentro de `@vercel/og` al resolver recursos internos en runtime Node sobre Windows.

## Solucion

Se fuerza el runtime Edge:

```ts
export const runtime = 'edge'
```

## Verificacion

- `npm run lint`: correcto, con aviso previo no relacionado.
- `npm run build`: correcto.
- `git diff --check`: correcto.
