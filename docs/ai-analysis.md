# AI Analysis — Resultados de Performance

---

## PARTE 1 — K6 Load Test

### Contexto
- **Tipo:** Carga (load-test) — 10 → 20 → 0 VUs en 2 minutos
- **Herramienta:** k6 v2.0.0
- **Fecha:** 2026-07-03
- **Comando:**
  ```bash
  k6 run --out json=evidences/resultados.json performance/k6/load-test.js
  ```

### Métricas principales

| Métrica                        | Valor            |
|--------------------------------|------------------|
| `http_req_duration` avg        | 114.58 ms        |
| `http_req_duration` med        | 115.23 ms        |
| `http_req_duration` p(90)      | 122.81 ms        |
| `http_req_duration` p(95)      | 126.97 ms        |
| `http_req_duration` max        | 424.91 ms        |
| Tasa de fallos                 | 0.00%            |
| Total requests                 | 2184             |
| Throughput                     | 18.02 req/s      |
| Iteraciones completadas        | 1092             |
| Checks superados               | 3275 / 3276      |
| Duración total                 | 2 min 1.2 s      |

### Thresholds

| Threshold                  | Obtenido   | Límite   | Estado  |
|----------------------------|------------|----------|---------|
| `http_req_duration` p(95)  | 126.97 ms  | < 500 ms | ✅ PASS |
| `fallos` rate              | 0.00%      | < 5%     | ✅ PASS |

### Conclusión K6: ✅ APROBADO

La API respondió con p(95) en 126.97 ms (25% del límite). Distribución muy estable — diferencia de solo 11 ms entre la media y el p(95). El único check fallido fue una latencia puntual de 424 ms en una iteración aislada (< 0.1% del total).

---

## PARTE 2 — JMeter Performance Test

### Contexto
- **Archivo:** `performance/jmeter/jsonplaceholder-test-plan.jmx`
- **Herramienta:** Apache JMeter 5.6.3
- **Fecha:** 2026-07-03
- **Escenarios:** 2 (consulta de posts + flujo simulado de compra)
- **Comando:**
  ```bash
  jmeter -n \
    -t performance/jmeter/jsonplaceholder-test-plan.jmx \
    -l evidences/jmeter-results.jtl \
    -e -o evidences/jmeter-report
  ```

### Configuración del escenario

| Parámetro                     | Escenario 1 — Consulta | Escenario 2 — Flujo Compra |
|-------------------------------|------------------------|---------------------------|
| Número de usuarios (VUs)      | 10                     | 5                         |
| Ramp-up                       | 10 s                   | 5 s                       |
| Iteraciones por usuario       | 5                      | 3                         |
| Requests por iteración        | 3                      | 4                         |
| Total requests del escenario  | 150                    | 60                        |
| Think time                    | 1000 ms                | 500 ms + 1000 ms          |

**Total combinado:** 210 requests en ~26 segundos.

### Métricas globales

| Métrica              | Valor       |
|----------------------|-------------|
| Total requests       | 210         |
| Errores              | 0 (0.00%)   |
| Avg                  | 116.4 ms    |
| Mediana              | 99.0 ms     |
| Mínimo               | 90 ms       |
| Máximo               | 486 ms      |
| p(90)                | 125 ms      |
| p(95)                | 288 ms      |
| Throughput           | 8.2 req/s   |

### Métricas por endpoint

| Endpoint                           | Muestras | Avg     | Min   | Max    | p(95)  | Errores |
|------------------------------------|----------|---------|-------|--------|--------|---------|
| GET /posts (listar)                | 50       | 146.9ms | 102ms | 486ms  | 293ms  | 0       |
| GET /posts/1 (por ID)              | 50       | 94.9ms  | 90ms  | 118ms  | 100ms  | 0       |
| GET /posts/1/comments              | 50       | 97.9ms  | 91ms  | 176ms  | 106ms  | 0       |
| GET /users (sesión)                | 15       | 162.1ms | 93ms  | 314ms  | 314ms  | 0       |
| GET /posts (catálogo, flujo)       | 15       | 107.7ms | 103ms | 111ms  | 111ms  | 0       |
| POST /posts (crear pedido)         | 15       | 130.9ms | 117ms | 167ms  | 167ms  | 0       |
| GET /comments?postId=1 (reseñas)   | 15       | 95.9ms  | 92ms  | 102ms  | 102ms  | 0       |

### Análisis de resultados JMeter

**Latencia:** El tiempo promedio global de 116 ms es excelente. El endpoint más lento fue `GET /posts` (listar todos los 100 posts) con un avg de 146.9 ms y un máximo de 486 ms — esperable ya que descarga el payload más grande. El resto de endpoints operan consistentemente bajo los 170 ms.

**Errores encontrados:** Ninguno. Los 210 requests completaron con sus códigos esperados (200 para GETs, 201 para el POST). Todas las assertions de JMeter pasaron correctamente.

**Flujo de compra simulado:** El escenario de 4 pasos con 5 usuarios concurrentes funcionó sin degradación observable. El paso más lento fue GET /users (avg 162 ms, max 314 ms), posiblemente por la resolución DNS en la primera conexión del thread.

**Estabilidad:** La mediana (99 ms) está bien por debajo del promedio (116 ms), lo que indica que la mayoría de requests son rápidas y los valores altos son excepciones puntuales, no un problema sistémico.

### Thresholds JMeter

| Criterio                | Obtenido   | Límite    | Estado  |
|-------------------------|------------|-----------|---------|
| Tasa de errores         | 0.00%      | < 5%      | ✅ PASS |
| Tiempo promedio         | 116.4 ms   | < 500 ms  | ✅ PASS |
| Tiempo máximo           | 486 ms     | < 2000 ms | ✅ PASS |

### Conclusión JMeter: ✅ APROBADO

La API de JSONPlaceholder superó satisfactoriamente ambos escenarios JMeter. No se registraron errores en ninguno de los 210 requests. El flujo de compra simulado (sesión → catálogo → pedido → reseñas) respondió correctamente bajo carga concurrente con tiempos dentro de los umbrales definidos.

---

## Comparativa K6 vs JMeter

| Métrica         | K6 (load-test)  | JMeter (2 escenarios) |
|-----------------|-----------------|-----------------------|
| Total requests  | 2184            | 210                   |
| VUs máximos     | 20              | 10 + 5 = 15           |
| Avg latencia    | 114.58 ms       | 116.4 ms              |
| p(95) latencia  | 126.97 ms       | 288 ms                |
| Tasa errores    | 0.00%           | 0.00%                 |
| Throughput      | 18.02 req/s     | 8.2 req/s             |
| Resultado       | ✅ APROBADO     | ✅ APROBADO           |

El p(95) de JMeter (288 ms) es mayor al de k6 (127 ms) porque JMeter incluyó `GET /posts` (listar 100 items) con mayor carga proporcional — ese endpoint eleva la cola de distribución. Ambas herramientas coinciden en la ausencia total de errores y latencias promedio similares (~115 ms).

---

## Recomendaciones generales

1. Ejecutar el **stress-test de k6** (100 VUs) para encontrar el punto de saturación real de la API.
2. Agregar el **soak-test de JMeter** (carga sostenida 30+ min) para detectar degradación por memory leaks.
3. El endpoint `GET /posts` (listar todos) es el más lento — en una API real convendría paginar (`?_limit=10`) para reducir payload y latencia.
4. Incluir extractor de variables en JMeter para encadenar el ID devuelto por `POST /posts` y usarlo en requests posteriores, simulando un flujo más realista.
