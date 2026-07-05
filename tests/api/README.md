# tests/api — Pruebas de API

Carpeta destinada a pruebas funcionales de endpoints REST.

## Stack sugerido
- **Supertest** (Node.js) — pruebas de integración HTTP
- **Newman** — ejecución de colecciones Postman desde CLI
- **Playwright** (modo API) — pruebas E2E con contexto de red

## API bajo prueba
`https://jsonplaceholder.typicode.com`

## Estructura sugerida
```
tests/api/
├── posts.test.js       # Pruebas de /posts
├── users.test.js       # Pruebas de /users
└── comments.test.js    # Pruebas de /comments
```

## Convenciones
- Un archivo por recurso/entidad.
- Nombrar los archivos con sufijo `.test.js`.
- Verificar status code, estructura del body y tiempo de respuesta.
