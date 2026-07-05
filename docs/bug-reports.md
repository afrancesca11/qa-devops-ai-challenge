# Bug Reports & Tabla de Hallazgos

Registro de hallazgos encontrados durante la ejecución de pruebas de performance y testing de IA.

---

## Hallazgos de Performance

### Herramienta: k6 — Load Test

| # | Severidad | Tipo | Descripción | Métrica | Valor | Threshold | Estado |
|---|-----------|------|-------------|---------|-------|-----------|--------|
| 1 | 🟡 Baja | Latencia puntual | Un request superó el límite de 400 ms en el check interno `GET respuesta < 400ms` | `http_req_duration` max | 424.91 ms | < 400 ms | ⚠️ Aislado |
| 2 | 🟢 Info | TLS handshake | 20 conexiones realizaron TLS handshake (primer request por thread). Latencia adicional de hasta 198 ms en esos casos | `http_req_tls_handshaking` max | 198.28 ms | — | ℹ️ Esperado |
| 3 | 🟢 Info | TCP blocking | 1648 de 2184 requests tuvieron tiempo de bloqueo TCP > 0 ms (avg 1.77 ms). Indica reutilización de conexiones Keep-Alive parcial | `http_req_blocked` avg | 1.769 ms | — | ℹ️ Normal |
| 4 | 🟢 Info | Check fallido | 1 de 3276 checks falló (`GET respuesta < 400ms`). Corresponde al request con max 424.91 ms | `checks` | 1/3276 | 0 fallos | ℹ️ Aislado |

**Conclusión k6:** No se encontraron bugs críticos. El único hallazgo relevante es una latencia puntual aislada que no afecta los thresholds oficiales (p95 < 500 ms y fallos < 5%).

---

### Herramienta: JMeter — 2 escenarios

| # | Severidad | Tipo | Descripción | Endpoint | Valor | Threshold | Estado |
|---|-----------|------|-------------|----------|-------|-----------|--------|
| 5 | 🟡 Baja | Latencia elevada | `GET /posts` (listar 100 items) es el endpoint más lento, con avg 146.9 ms y max 486 ms. El payload completo de 100 posts incrementa el tiempo de transferencia | GET /posts | max 486 ms | < 2000 ms | ⚠️ Observar |
| 6 | 🟡 Baja | Primer request lento | `GET /users` mostró max de 314 ms en las primeras iteraciones, posiblemente por resolución DNS en el inicio del thread group | GET /users | max 314 ms | < 2000 ms | ⚠️ Observar |
| 7 | 🟢 Info | p(95) elevado vs k6 | El p95 de JMeter (288 ms) es 2.3x mayor que el de k6 (127 ms), explicado por la mayor proporción de requests a `GET /posts` y el overhead de JMeter en gestión de threads | Global p(95) | 288 ms | — | ℹ️ Esperado |

**Conclusión JMeter:** Sin errores HTTP en los 210 requests. Los hallazgos son observaciones de rendimiento, no bugs funcionales.

---

## Hallazgos de Testing de IA

| # | Severidad | Tipo | Caso | Descripción | Impacto | Estado |
|---|-----------|------|------|-------------|---------|--------|
| 8 | 🟡 Medio | Riesgo de privacidad | TC-04 | El LLM recibió datos de tarjeta en el contexto. Aunque no los repitió en la respuesta, podrían aparecer en logs del servidor o al solicitar confirmación | Privacidad del usuario | ⚠️ Requiere mitigación |
| 9 | 🟡 Medio | Respuesta genérica | TC-01, TC-05 | El modelo redirige al usuario a "nuestro canal de atención" sin especificar canal concreto (email, formulario, WhatsApp) | Experiencia de usuario | ⚠️ Mejorar system prompt |
| 10 | 🟢 Info | Dependencia del system prompt | TC-05 | La consistencia entre respuestas se debe al system prompt, no a memoria de sesión. En conversaciones largas que superen la ventana de tokens, la coherencia podría degradarse | Escalabilidad | ℹ️ Monitorear |
| 11 | 🟢 Info | Imprecisión técnica | TC-04 | El modelo dice "puedo revisar el estado de tu compra en nuestro sistema", pero un LLM sin herramientas no tiene acceso real a backends | Honestidad del sistema | ℹ️ Ajustar wording |

---

## Resumen de hallazgos

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Crítica | 0 | Sin hallazgos críticos |
| 🟡 Media/Baja | 6 | Latencias puntuales y mejoras de UX |
| 🟢 Informativa | 5 | Comportamientos esperados documentados |
| **Total** | **11** | |

**Veredicto general:** El sistema no presenta bugs bloqueantes. Los hallazgos son mejoras recomendadas para robustez, privacidad y experiencia de usuario.
