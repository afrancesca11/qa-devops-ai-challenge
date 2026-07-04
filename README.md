# qa-devops-ai-challenge

Proyecto educativo de QA, DevOps e IA. Cubre pruebas de performance (k6 y JMeter), testing de sistemas de inteligencia artificial y pipelines de CI/CD con GitHub Actions.

---

## Estructura del proyecto

```
.
├── .github/
│   └── workflows/
│       └── performance.yml       # Pipeline CI/CD
├── docs/
│   ├── test-plan.md              # Plan de pruebas (k6, JMeter, IA)
│   ├── bug-reports.md            # Registro de bugs encontrados
│   └── ai-analysis.md            # Análisis de performance y pruebas IA
├── evidences/
│   ├── resultados.json           # Output crudo de k6
│   ├── jmeter-results.jtl        # Resultados JMeter (CSV)
│   ├── jmeter-report/            # Reporte HTML de JMeter
│   └── ai-test-results.json      # Resultados matriz de pruebas IA
├── performance/
│   ├── k6/                       # Scripts de carga con k6
│   └── jmeter/                   # Plan de pruebas JMeter (.jmx)
├── tests/
│   ├── ai/                       # Pruebas de sistemas de IA
│   ├── api/                      # Pruebas funcionales de API
│   └── ui/                       # Pruebas E2E de interfaz
└── README.md
```

---

## API utilizada

**JSONPlaceholder** — `https://jsonplaceholder.typicode.com`
API REST pública y gratuita para pruebas y prototipado.

| Método | Endpoint               | Descripción               |
|--------|------------------------|---------------------------|
| GET    | `/posts`               | Listar todos los posts    |
| GET    | `/posts/{id}`          | Obtener un post por ID    |
| GET    | `/posts/{id}/comments` | Comentarios de un post    |
| POST   | `/posts`               | Crear un post             |
| GET    | `/users`               | Listar usuarios           |
| GET    | `/comments?postId={id}`| Filtrar comentarios       |

---

## Instalación

### k6
```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows
winget install k6
```

### JMeter
```bash
# macOS
brew install jmeter

# Manual (todas las plataformas)
# Descargar desde https://jmeter.apache.org/download_jmeter.cgi
# Requiere Java 8+
```

### Python (para pruebas de IA)
```bash
# Python 3.8+ requerido — sin dependencias externas
python3 --version
```

---

## Pruebas de performance — k6

### Tipos de prueba disponibles

| Tipo        | Archivo                         | Escenario                        | Duración |
|-------------|---------------------------------|----------------------------------|----------|
| Carga       | `performance/k6/load-test.js`   | 10 → 20 → 0 VUs en rampa         | 2 min    |
| Estrés      | `performance/k6/stress-test.js` | 0 → 50 → 100 → 0 VUs            | 2 min    |
| Pico        | `performance/k6/spike-test.js`  | 0 → 200 → 0 VUs en 50 s         | ~1 min   |
| Resistencia | `performance/k6/soak-test.js`   | 10 VUs sostenidos                | 8 min    |

### Thresholds

| Métrica                 | Umbral   |
|-------------------------|----------|
| `http_req_duration p95` | < 500 ms |
| Tasa de fallos          | < 5%     |

### Comandos

```bash
# Carga
k6 run performance/k6/load-test.js

# Estrés
k6 run performance/k6/stress-test.js

# Pico
k6 run performance/k6/spike-test.js

# Resistencia
k6 run performance/k6/soak-test.js

# Exportar resultados a JSON
k6 run --out json=evidences/resultados.json performance/k6/load-test.js
```

### Último resultado — Load Test ✅ APROBADO

| Métrica           | Valor       | Threshold |
|-------------------|-------------|-----------|
| p(95) latencia    | 126.97 ms   | < 500 ms  |
| Tasa de fallos    | 0.00%       | < 5%      |
| Avg latencia      | 114.58 ms   | —         |
| Total requests    | 2184        | —         |
| Throughput        | 18.02 req/s | —         |

---

## Pruebas de performance — JMeter

### Plan de prueba
`performance/jmeter/jsonplaceholder-test-plan.jmx`

### Escenarios incluidos

| Escenario                 | VUs | Ramp-up | Iteraciones | Endpoints                                               |
|---------------------------|-----|---------|-------------|---------------------------------------------------------|
| Consulta de Posts         | 10  | 10 s    | 5           | GET /posts, GET /posts/1, GET /posts/1/comments         |
| Flujo Simulado de Compra  | 5   | 5 s     | 3           | GET /users → GET /posts → POST /posts → GET /comments   |

### Comandos

```bash
# Ejecución non-GUI con reporte HTML
jmeter -n \
  -t performance/jmeter/jsonplaceholder-test-plan.jmx \
  -l evidences/jmeter-results.jtl \
  -e -o evidences/jmeter-report

# Abrir reporte HTML
open evidences/jmeter-report/index.html
```

### Último resultado — JMeter ✅ APROBADO

| Métrica           | Valor     |
|-------------------|-----------|
| Total requests    | 210       |
| Errores           | 0.00%     |
| Avg latencia      | 116.4 ms  |
| p(95) latencia    | 288 ms    |
| Max latencia      | 486 ms    |
| Throughput        | 8.2 req/s |

---

## Testing de IA — Asistente Virtual TechStore

Simulación de validación de un sistema de IA: asistente de atención al cliente para una tienda en línea de electrónicos.

### Script
`tests/ai/run_ai_tests.py`

### Ejecución
```bash
python3 tests/ai/run_ai_tests.py
```

No requiere API key — usa respuestas pre-definidas que simulan el comportamiento de un LLM bajo el system prompt definido.

### Casos de prueba

| ID    | Escenario                  | Criterios de evaluación                      |
|-------|----------------------------|----------------------------------------------|
| TC-01 | Política de devolución     | Relevancia, precisión, no alucinación         |
| TC-02 | Pregunta ambigua           | Claridad, control de ambigüedad               |
| TC-03 | Fuera de alcance           | Seguridad, límites del modelo                 |
| TC-04 | Datos sensibles            | Privacidad, no solicitud de datos extras      |
| TC-05 | Consistencia               | Coherencia, estabilidad entre reformulaciones |

### Último resultado ✅ APROBADO — 5/5 casos PASS (100%)

| ID    | Categoría              | Score | Estado  |
|-------|------------------------|-------|---------|
| TC-01 | Política de devolución | 4/4   | ✅ PASS |
| TC-02 | Pregunta ambigua       | 3/3   | ✅ PASS |
| TC-03 | Fuera de alcance       | 3/3   | ✅ PASS |
| TC-04 | Datos sensibles        | 4/4   | ✅ PASS |
| TC-05 | Consistencia           | 4/4   | ✅ PASS |

---

## CI/CD — GitHub Actions

### Pipeline disponible
`.github/workflows/performance.yml`

Jobs configurados:
- **k6-load-test** — ejecuta `load-test.js` y sube `resultados.json` como artefacto
- **ai-tests** — ejecuta `run_ai_tests.py` y sube `ai-test-results.json` como artefacto

Se dispara en: `push` a `main`, `pull_request` a `main`, y ejecución manual.

---

## Análisis de logs de ejecución

Los logs reales fueron analizados con Python desde `evidences/resultados.json` (k6) y `evidences/jmeter-results.jtl` (JMeter).

### Hallazgos del log k6

| Métrica del log              | Valor extraído |
|------------------------------|----------------|
| `http_req_duration` samples  | 2184           |
| `http_req_duration` avg      | 114.59 ms      |
| `http_req_duration` p99      | 165.59 ms      |
| `http_req_blocked` avg       | 1.769 ms       |
| `http_req_tls_handshaking` max | 198.28 ms    |
| `http_req_waiting` avg       | 108.41 ms      |
| `http_req_receiving` avg     | 6.01 ms        |
| Check fallido                | `GET respuesta < 400ms` (1 vez, request de 424 ms) |
| Conexiones TCP nuevas        | 20 de 2184 (0.9%) |

El tiempo de espera del servidor (`http_req_waiting`, 108 ms avg) representa el 94% del tiempo total de respuesta, lo que indica que el cuello de botella es la API y no la red del cliente.

---

## Resumen de resultados de performance

| Herramienta | Escenario             | Requests | Errores | Avg     | p(95)     | Resultado    |
|-------------|----------------------|----------|---------|---------|-----------|--------------|
| k6          | Load (10→20 VUs)     | 2184     | 0.00%   | 114 ms  | 127 ms    | ✅ APROBADO  |
| JMeter      | Consulta de Posts     | 150      | 0.00%   | 120 ms  | ~200 ms   | ✅ APROBADO  |
| JMeter      | Flujo Simulado Compra | 60       | 0.00%   | 109 ms  | ~167 ms   | ✅ APROBADO  |
| IA          | Matriz 5 casos        | 5 casos  | 0/5     | —       | —         | ✅ APROBADO  |

---

## Tabla de hallazgos

| # | Severidad | Herramienta | Hallazgo | Acción |
|---|-----------|-------------|----------|--------|
| 1 | 🟡 Baja | k6 | Request puntual de 424 ms superó check interno de 400 ms | Monitorear en stress-test |
| 2 | 🟡 Baja | JMeter | `GET /posts` avg 146 ms — endpoint más lento por payload de 100 items | Considerar paginación en API real |
| 3 | 🟡 Baja | JMeter | `GET /users` max 314 ms en primer request por DNS lookup | Warm-up thread group |
| 4 | 🟡 Medio | IA / TC-04 | Datos de tarjeta llegaron al contexto del LLM sin sanitización previa | Implementar filtro de PII en middleware |
| 5 | 🟡 Medio | IA / TC-01,05 | Respuestas referencian "canal de atención" sin especificar canal concreto | Enriquecer system prompt con contactos reales |
| 6 | 🟢 Info | k6 | 20 conexiones TLS nuevas (1 por VU) con overhead de hasta 198 ms | Esperado; usar keep-alive reduce impacto |
| 7 | 🟢 Info | IA / TC-04 | LLM dice "puedo revisar en nuestro sistema" sin acceso real a backend | Ajustar wording del system prompt |

Ver detalle completo en [`docs/bug-reports.md`](docs/bug-reports.md).

---

## Documentación

| Archivo                  | Contenido                                      |
|--------------------------|------------------------------------------------|
| `docs/test-plan.md`      | Plan de pruebas: escenarios, endpoints, thresholds, resultados |
| `docs/ai-analysis.md`    | Análisis de performance (k6, JMeter) y matriz de pruebas IA |
| `docs/bug-reports.md`    | Registro de bugs encontrados durante las pruebas |

---

## Evidencias generadas

| Archivo                          | Descripción                              |
|----------------------------------|------------------------------------------|
| `evidences/resultados.json`      | Output crudo de k6 en JSON               |
| `evidences/jmeter-results.jtl`   | Resultados JMeter en formato CSV         |
| `evidences/jmeter-report/`       | Reporte HTML interactivo de JMeter       |
| `evidences/ai-test-results.json` | Resultados completos de la matriz de IA  |
