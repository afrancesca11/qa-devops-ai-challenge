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
