# AGENTS.md — qa-devops-ai-challenge

## Descripción del proyecto
Proyecto educativo para practicar QA, DevOps e integración de IA en el flujo de pruebas de software.

## Stack tecnológico
- **Lenguaje:** JavaScript / Node.js
- **Pruebas de API:** (Por definir — sugerencia: Supertest, Playwright, Postman/Newman)
- **Pruebas de UI:** (Por definir — sugerencia: Playwright, Cypress)
- **Pruebas de rendimiento:** k6, JMeter
- **CI/CD:** GitHub Actions
- **Análisis con IA:** (Por definir — sugerencia: OpenAI API, análisis de logs)

## Estructura del proyecto
```
.
├── .github/            # Workflows de GitHub Actions
├── docs/
│   ├── test-plan.md    # Plan de pruebas
│   ├── bug-reports.md  # Reportes de bugs
│   └── ai-analysis.md  # Análisis generado por IA
├── evidences/          # Evidencias (reportes, screenshots, CSVs)
├── performance/
│   ├── k6/             # Scripts de k6 (load-test.js, stress-test.js)
│   └── jmeter/         # Planes de JMeter (.jmx)
├── tests/
│   ├── api/            # Pruebas de API
│   └── ui/             # Pruebas de UI
├── AGENTS.md
├── README.md
└── .gitignore
```

## Propósito de cada carpeta
- **tests/api/** — Pruebas funcionales de endpoints REST/GraphQL.
- **tests/ui/** — Pruebas de interfaz de usuario (E2E).
- **performance/k6/** — Scripts de carga y estrés con k6.
- **performance/jmeter/** — Planes de prueba de rendimiento con JMeter.
- **docs/** — Documentación del proyecto, reportes y análisis.
- **evidences/** — Outputs de ejecuciones (JSON, HTML, screenshots).
- **.github/** — Pipelines de CI/CD.

## Convenciones
- Los scripts de k6 deben usar extensión `.js`.
- Los planes de JMeter deben usar extensión `.jmx`.
- Las evidencias se almacenan en `evidences/` con nombre descriptivo.
