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

## Documentación
- Plan de pruebas: [`docs/test-plan.md`](docs/test-plan.md)
- Reporte de bugs: [`docs/bug-reports.md`](docs/bug-reports.md)
- Análisis con IA: [`docs/ai-analysis.md`](docs/ai-analysis.md)

## Evidencias
Los resultados se exportan a `evidences/` en formato JSON.

```bash
k6 run --out json=evidences/resultados.json performance/k6/load-test.js
```
