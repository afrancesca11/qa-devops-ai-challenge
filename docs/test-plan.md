# Test Plan — K6 + JMeter + JSONPlaceholder

## Objetivo
Validar que la API de JSONPlaceholder responde correctamente bajo carga concurrente, dentro de los umbrales de latencia y fiabilidad establecidos.

## API bajo prueba
**Base URL:** `https://jsonplaceholder.typicode.com`

## Escenarios de prueba

| Tipo        | Archivo                         | VUs                              | Duración     |
|-------------|---------------------------------|----------------------------------|--------------|
| Carga       | `performance/k6/load-test.js`   | 10 → 20 → 0 (rampa)             | 2 min        |
| Estrés      | `performance/k6/stress-test.js` | 0 → 50 → 100 → 0                | 2 min        |
| Pico        | `performance/k6/spike-test.js`  | 0 → 200 → 0                     | 50 s         |
| Resistencia | `performance/k6/soak-test.js`   | 10 VUs sostenidos                | 8 min        |

## Endpoints probados

| Método | Endpoint               | Descripción               |
|--------|------------------------|---------------------------|
| GET    | `/posts`               | Listar todos los posts    |
| GET    | `/posts/1`             | Obtener un post por ID    |
| GET    | `/posts/1/comments`    | Comentarios de un post    |
| POST   | `/posts`               | Crear un post             |
| GET    | `/users`               | Listar usuarios           |
| GET    | `/comments?postId=1`   | Filtrar comentarios       |

## Thresholds definidos

| Métrica                 | Umbral         | Descripción                        |
|-------------------------|----------------|------------------------------------|
| `http_req_duration p95` | < 500 ms       | Percentil 95 de latencia HTTP      |
| `fallos` (rate)         | < 5%           | Tasa de respuestas no exitosas     |

## Datos del entorno
- **Herramienta:** k6 v2.0.0
- **SO:** macOS (darwin/arm64)
- **Fecha de ejecución:** 2026-07-03
- **Prueba ejecutada:** load-test (escenario de carga)

## Resultado — Load Test ✅ APROBADO

| Métrica                     | Valor         | Threshold | Estado |
|-----------------------------|---------------|-----------|--------|
| `http_req_duration p(95)`   | 126.97 ms     | < 500 ms  | ✅     |
| `fallos` rate               | 0.00%         | < 5%      | ✅     |
| `http_req_duration` avg     | 114.58 ms     | —         | ✅     |
| `http_req_duration` max     | 424.91 ms     | —         | ✅     |
| Total requests              | 2184          | —         | —      |
| Throughput                  | 18.02 req/s   | —         | —      |
| Checks superados            | 99.96%        | —         | ✅     |

## Comando de ejecución
```bash
k6 run --out json=evidences/resultados.json performance/k6/load-test.js
```

---

## JMeter — Plan de Pruebas

### Archivo
`performance/jmeter/jsonplaceholder-test-plan.jmx`

### Objetivo
Validar la API de JSONPlaceholder bajo dos escenarios paralelos: consulta de recursos (GET) y un flujo simulado de compra (sesión → catálogo → pedido → reseñas).

### Escenarios

#### Escenario 1 — Consulta de Posts
| Parámetro          | Valor                                 |
|--------------------|---------------------------------------|
| Usuarios (VUs)     | 10                                    |
| Ramp-up            | 10 segundos                           |
| Iteraciones        | 5 por usuario                         |
| Total requests     | 150 (10 users × 5 iter × 3 endpoints)|
| Endpoints          | GET /posts, GET /posts/1, GET /posts/1/comments |

#### Escenario 2 — Flujo Simulado de Compra
| Parámetro          | Valor                                              |
|--------------------|----------------------------------------------------|
| Usuarios (VUs)     | 5                                                  |
| Ramp-up            | 5 segundos                                         |
| Iteraciones        | 3 por usuario                                      |
| Total requests     | 60 (5 users × 3 iter × 4 pasos)                   |
| Pasos del flujo    | GET /users → GET /posts → POST /posts → GET /comments?postId=1 |
| Think time         | 500 ms entre pasos, 1 s al final del flujo         |

### Endpoints probados

| Método | Endpoint               | Escenario          | Código esperado |
|--------|------------------------|--------------------|-----------------|
| GET    | `/posts`               | 1 y 2 (paso 2)     | 200             |
| GET    | `/posts/1`             | 1                  | 200             |
| GET    | `/posts/1/comments`    | 1                  | 200             |
| GET    | `/users`               | 2 (paso 1)         | 200             |
| POST   | `/posts`               | 2 (paso 3)         | 201             |
| GET    | `/comments?postId=1`   | 2 (paso 4)         | 200             |

### Thresholds / Criterios de aceptación

| Métrica                 | Umbral     |
|-------------------------|------------|
| Tasa de errores         | < 5%       |
| Tiempo de respuesta avg | < 500 ms   |
| Tiempo de respuesta max | < 2000 ms  |

### Resultado — JMeter ✅ APROBADO

| Métrica                     | Valor       | Threshold  | Estado |
|-----------------------------|-------------|------------|--------|
| Total requests              | 210         | —          | —      |
| Tasa de errores             | 0.00%       | < 5%       | ✅     |
| Tiempo promedio (avg)       | 116.4 ms    | < 500 ms   | ✅     |
| Tiempo mínimo               | 90 ms       | —          | ✅     |
| Tiempo máximo               | 486 ms      | < 2000 ms  | ✅     |
| Mediana                     | 99.0 ms     | —          | ✅     |
| p(90)                       | 125 ms      | —          | ✅     |
| p(95)                       | 288 ms      | —          | ✅     |
| Throughput                  | 8.2 req/s   | —          | —      |

### Métricas por endpoint

| Endpoint                           | Muestras | Avg     | Min   | Max    | p(95)  | Errores |
|------------------------------------|----------|---------|-------|--------|--------|---------|
| GET /posts (listar)                | 50       | 146.9ms | 102ms | 486ms  | 293ms  | 0       |
| GET /posts/1 (por ID)              | 50       | 94.9ms  | 90ms  | 118ms  | 100ms  | 0       |
| GET /posts/1/comments              | 50       | 97.9ms  | 91ms  | 176ms  | 106ms  | 0       |
| GET /users (sesión)                | 15       | 162.1ms | 93ms  | 314ms  | 314ms  | 0       |
| GET /posts (catálogo)              | 15       | 107.7ms | 103ms | 111ms  | 111ms  | 0       |
| POST /posts (pedido)               | 15       | 130.9ms | 117ms | 167ms  | 167ms  | 0       |
| GET /comments?postId=1 (reseñas)   | 15       | 95.9ms  | 92ms  | 102ms  | 102ms  | 0       |

### Comando de ejecución
```bash
jmeter -n \
  -t performance/jmeter/jsonplaceholder-test-plan.jmx \
  -l evidences/jmeter-results.jtl \
  -e -o evidences/jmeter-report
```

---

## Quality Gates definidos

Esta sección documenta los criterios mínimos que debe cumplir un Pull Request para ser mergeado a `main`. Los gates se verifican automáticamente mediante los workflows `.github/workflows/ci.yml` y `.github/workflows/performance.yml`.

### Gate 1 — Todas las pruebas automatizadas deben pasar

**Job:** `k6-load-test` y `ai-tests` en `ci.yml`

El CI ejecuta dos suites de pruebas en cada PR. Ambos jobs deben completar sin error para que el PR sea aprobable:

- El job `k6-load-test` corre `performance/k6/load-test.js` y falla si k6 detecta que algún threshold fue superado (p95 > 500 ms o tasa de fallos > 5%).
- El job `ai-tests` corre `tests/ai/run_ai_tests.py` y falla si algún caso de la matriz retorna `FAIL`.

### Gate 2 — Tasa de errores HTTP menor al 1%

**Job:** `k6-load-test` — métrica `http_req_failed`

El threshold definido en `load-test.js` es `fallos: rate < 0.05` (5%). Para efectos del quality gate se eleva el criterio de revisión manual a **< 1%**, visible en la tabla del Step Summary del PR bajo la columna "Tasa de errores". Un PR con error rate ≥ 1% debe ser bloqueado aunque k6 no falle técnicamente.

### Gate 3 — Tiempo de respuesta dentro del umbral definido

**Job:** `k6-load-test` — métrica `http_req_duration`

El threshold de k6 es `p(95) < 500 ms`. El Step Summary del PR publica el valor real de p(95), avg y max. Criterios:

| Métrica | Umbral obligatorio | Umbral ideal |
|---------|-------------------|--------------|
| p(95) latencia | < 500 ms | < 200 ms |
| Avg latencia | < 300 ms | < 150 ms |
| Tasa de errores | < 5% (k6) / < 1% (revisión) | 0% |

### Gate 4 — No deben existir secretos expuestos

**Job:** `validate-structure` en `ci.yml`

El job verifica la presencia de archivos clave del repositorio. Como parte del proceso DevSecOps, el PR no debe incluir archivos con credenciales, tokens ni claves privadas. El `.gitignore` ya excluye `.env`, `*.log` y `__pycache__`. Adicionalmente, el revisor debe confirmar manualmente que no se exponen secretos antes de aprobar.

> En una implementación avanzada este gate se automatizaría con `trufflesecurity/trufflehog-actions-scan` o `gitleaks/gitleaks-action`.

### Gate 5 — El PR debe tener artefactos generados

**Jobs:** `k6-load-test` (paso 5) y `ai-tests` (paso 5) en `ci.yml`

Ambos jobs suben artefactos con `actions/upload-artifact@v4`. Un PR sin artefactos indica que las pruebas no se ejecutaron. Los artefactos requeridos son:

| Artefacto | Job origen | Contenido |
|-----------|-----------|-----------|
| `k6-results` | `k6-load-test` | `resultados.json`, `k6-summary.json` |
| `ai-test-results` | `ai-tests` | `ai-test-results.json` |

### Gate 6 — Estructura mínima del repositorio presente

**Job:** `validate-structure` en `ci.yml`

El job siempre corre y publica en el Step Summary el estado de los archivos obligatorios. Un PR que marque como ausente alguno de estos archivos no debe mergearse:

- `docs/test-plan.md`
- `docs/ai-analysis.md`
- `docs/bug-reports.md`
- `performance/k6/load-test.js`
- `tests/ai/run_ai_tests.py`
