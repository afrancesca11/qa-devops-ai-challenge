# Test Plan — K6 + JSONPlaceholder

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
