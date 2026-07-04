# tests/ui — Pruebas de UI (E2E)

Carpeta destinada a pruebas de interfaz de usuario end-to-end.

## Stack sugerido
- **Playwright** — automatización de navegador (Chromium, Firefox, WebKit)
- **Cypress** — pruebas E2E con dashboard integrado

## Convenciones
- Un archivo por flujo de usuario o feature.
- Nombrar los archivos con sufijo `.spec.js` o `.spec.ts`.
- Screenshots y videos de fallos se guardan en `evidences/`.

## Estructura sugerida
```
tests/ui/
├── home.spec.js        # Página principal
├── checkout.spec.js    # Flujo de compra
└── login.spec.js       # Autenticación
```
