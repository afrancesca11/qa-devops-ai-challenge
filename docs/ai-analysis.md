# AI Analysis — Resultados K6

## Contexto de la ejecución

- **Tipo de prueba:** Carga (load-test)
- **Script:** `performance/k6/load-test.js`
- **API:** https://jsonplaceholder.typicode.com
- **Fecha:** 2026-07-03
- **Herramienta:** k6 v2.0.0 / darwin arm64
- **Comando:**
  ```bash
  k6 run --out json=evidences/resultados.json performance/k6/load-test.js
  ```

---

## Métricas principales

| Métrica                        | Valor         |
|--------------------------------|---------------|
| `http_req_duration` avg        | 114.58 ms     |
| `http_req_duration` med        | 115.23 ms     |
| `http_req_duration` p(90)      | 122.81 ms     |
| `http_req_duration` p(95)      | 126.97 ms     |
| `http_req_duration` max        | 424.91 ms     |
| `http_req_duration` min        | 100.09 ms     |
| Tasa de fallos (`fallos` rate) | 0.00%         |
| `http_req_failed`              | 0.00%         |
| Total de requests              | 2184          |
| Throughput                     | 18.02 req/s   |
| Iteraciones completadas        | 1092          |
| Checks superados               | 3275 / 3276   |
| Duración total de ejecución    | 2 min 1.2 s   |
| VUs máximos                    | 20            |
| Datos recibidos                | 31 MB (258 kB/s) |
| Datos enviados                 | 308 kB (2.5 kB/s) |

---

## Análisis de métricas

### Latencia
La API respondió con una latencia promedio de **114.58 ms** y un percentil 95 de **126.97 ms**, muy por debajo del threshold definido de 500 ms. La diferencia pequeña entre la media (115.23 ms) y el p(95) (126.97 ms) indica una distribución de tiempos muy estable, sin colas largas.

El valor máximo de **424.91 ms** fue un evento aislado (un único check falló en "GET respuesta < 400ms" sobre 1092 iteraciones), lo que representa < 0.1% de las solicitudes.

### Fiabilidad
La tasa de fallos fue **0.00%** en las 2184 solicitudes HTTP ejecutadas. Todos los endpoints devolvieron los códigos esperados:
- `GET /posts` → 200 OK: ✅ 100%
- `POST /posts` → 201 Created: ✅ 100%

### Estabilidad bajo carga
Con una rampa de 10 → 20 VUs concurrentes, el comportamiento fue completamente estable. El throughput de **18 req/s** con 20 VUs activos es coherente con el `sleep(1)` configurado entre iteraciones, sin degradación observable.

### Checks
De 3276 checks ejecutados, solo 1 falló (la validación de "respuesta < 400ms" en la solicitud pico de 424 ms). El porcentaje de éxito fue del **99.96%**.

---

## Thresholds — Evaluación

| Threshold                      | Valor obtenido | Límite   | Resultado |
|--------------------------------|----------------|----------|-----------|
| `http_req_duration` p(95)      | 126.97 ms      | < 500 ms | ✅ PASS    |
| `fallos` rate                  | 0.00%          | < 5%     | ✅ PASS    |

---

## Conclusión

### ✅ APROBADO

La API de JSONPlaceholder superó satisfactoriamente la prueba de carga bajo el escenario definido (10 → 20 VUs en 2 minutos). Todos los thresholds fueron cumplidos con amplio margen:

- La latencia p(95) de **126.97 ms** representa solo el **25.4% del límite** de 500 ms.
- La tasa de fallos fue **0%**, muy por debajo del 5% permitido.
- El sistema mantuvo rendimiento estable sin degradación bajo la carga aplicada.

### Recomendaciones
- Ejecutar el **stress-test** (100 VUs) para identificar el punto de saturación real de la API.
- Ejecutar el **soak-test** (10 VUs × 8 min) para verificar ausencia de memory leaks o degradación temporal.
- Agregar validaciones de tiempo en los endpoints de consulta lenta (`GET /posts/1/comments`) para obtener datos más precisos por endpoint.
