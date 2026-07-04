# qa-devops-ai-challenge

Proyecto educativo de QA, DevOps e IA. Las pruebas de performance se realizan contra [JSONPlaceholder](https://jsonplaceholder.typicode.com).

## API utilizada

**JSONPlaceholder** — `https://jsonplaceholder.typicode.com`  
API REST pública y gratuita para pruebas y prototipado.

## Instalación

### k6
```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows (winget)
winget install k6
```

## Endpoints probados

| Método | Endpoint               | Descripción               |
|--------|------------------------|---------------------------|
| GET    | `/posts`               | Listar todos los posts    |
| GET    | `/posts/{id}`          | Obtener un post por ID    |
| GET    | `/posts/{id}/comments` | Comentarios de un post    |
| POST   | `/posts`               | Crear un post             |
| GET    | `/users`               | Listar usuarios           |
| GET    | `/comments?postId={id}`| Filtrar comentarios       |

## Tipos de prueba disponibles

| Tipo        | Archivo                         | Escenario                           | Duración  |
|-------------|---------------------------------|-------------------------------------|-----------|
| Carga       | `performance/k6/load-test.js`   | 10 → 20 → 0 VUs en rampa            | 2 min     |
| Estrés      | `performance/k6/stress-test.js` | 0 → 50 → 100 → 0 VUs               | 2 min     |
| Pico        | `performance/k6/spike-test.js`  | 0 → 200 → 0 VUs en 50 s            | ~1 min    |
| Resistencia | `performance/k6/soak-test.js`   | 10 VUs sostenidos                   | 8 min     |

## Comandos de ejecución

### Carga (load-test)
```bash
k6 run performance/k6/load-test.js
```

### Estrés (stress-test)
```bash
k6 run performance/k6/stress-test.js
```

### Pico (spike-test)
```bash
k6 run performance/k6/spike-test.js
```

### Resistencia (soak-test)
```bash
k6 run performance/k6/soak-test.js
```

### Exportar resultados a JSON
```bash
k6 run --out json=evidences/resultados.json performance/k6/load-test.js
```

## Thresholds definidos

| Métrica                 | Umbral   |
|-------------------------|----------|
| `http_req_duration p95` | < 500 ms |
| Tasa de fallos          | < 5%     |

## Último resultado — Load Test ✅ APROBADO

| Métrica              | Valor       | Threshold |
|----------------------|-------------|-----------|
| p(95) latencia       | 126.97 ms   | < 500 ms  |
| Tasa de fallos       | 0.00%       | < 5%      |
| Promedio latencia    | 114.58 ms   | —         |
| Total requests       | 2184        | —         |
| Throughput           | 18.02 req/s | —         |

## JMeter

### Escenarios incluidos
El plan `performance/jmeter/jsonplaceholder-test-plan.jmx` contiene dos thread groups:

| Escenario                    | VUs | Ramp-up | Iteraciones | Endpoints                                      |
|------------------------------|-----|---------|-------------|------------------------------------------------|
| Consulta de Posts            | 10  | 10 s    | 5           | GET /posts, GET /posts/1, GET /posts/1/comments |
| Flujo Simulado de Compra     | 5   | 5 s     | 3           | GET /users → GET /posts → POST /posts → GET /comments?postId=1 |

### Comando de ejecución (non-GUI)
```bash
jmeter -n \
  -t performance/jmeter/jsonplaceholder-test-plan.jmx \
  -l evidences/jmeter-results.jtl \
  -e -o evidences/jmeter-report
```

### Resultado — JMeter ✅ APROBADO

| Métrica              | Valor     |
|----------------------|-----------|
| Total requests       | 210       |
| Errores              | 0.00%     |
| Avg latencia         | 116.4 ms  |
| p(95) latencia       | 288 ms    |
| Max latencia         | 486 ms    |
| Throughput           | 8.2 req/s |

## Documentación
- Plan de pruebas: [`docs/test-plan.md`](docs/test-plan.md)
- Reporte de bugs: [`docs/bug-reports.md`](docs/bug-reports.md)
- Análisis con IA: [`docs/ai-analysis.md`](docs/ai-analysis.md)

## Evidencias

| Archivo                          | Descripción                        |
|----------------------------------|------------------------------------|
| `evidences/resultados.json`      | Output crudo de k6 en JSON         |
| `evidences/jmeter-results.jtl`   | Resultados JMeter en formato CSV   |
| `evidences/jmeter-report/`       | Reporte HTML generado por JMeter   |

```bash
# k6
k6 run --out json=evidences/resultados.json performance/k6/load-test.js

# JMeter
jmeter -n -t performance/jmeter/jsonplaceholder-test-plan.jmx \
  -l evidences/jmeter-results.jtl -e -o evidences/jmeter-report
```
