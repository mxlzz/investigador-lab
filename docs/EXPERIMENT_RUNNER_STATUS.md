# Ejecutor experimental remoto — primera capacidad verificable

**Estado:** experimental. No está integrado todavía al MCP ni al planificador local. No es una entrega científica completa.

- Un runner estándar GitHub Actions ejecuta pruebas en infraestructura efímera con `permissions: contents: read`, sin secretos y sin acceso a la PC.
- Contrato `experiments/<id>/manifest.json`: dos trials `baseline` y `candidate`, scripts públicos bajo `experiments/`, métrica numérica y dirección, timeout acotado.
- Cada trial devuelve JSON con `metrics`; el runner guarda hashes SHA-256 de código y manifiesto, valores, duración, commit y un recibo en `artifacts/`.
- El smoke test `runner-smoke` solamente comprueba el **circuito técnico**, no una contribución científica.
- No ejecutar código experimental con claves de API, token de Telegram, permisos GitHub de escritura, ni en el host Windows.
- Scripts de `experiments/` podrían acceder a Internet en un runner hospedado; por lo tanto, esta primera versión **no demuestra aislamiento de red** ni debe procesar datos privados.
- El recibo no es prueba de que una hipótesis general haya sido confirmada. Falta integrarlo de manera autenticada al expediente del proyecto, ejecutar benchmarks relevantes, medir incertidumbre, auditar el runner y habilitar selección autónoma de experimentos.

Este componente sí permite ejecutar y comparar dos implementaciones **públicas y reproducibles**, con límites, usando una capacidad ya gratuita en el repositorio público. Ejecutar automáticamente experimentos arbitrarios propuestos por LLM sigue prohibido.

## Actualización 0.4.0-dev

Ya existe integración entre expediente/MCP/planificador y la API de GitHub Actions: `experiment_plan` → `experiment_submit` → `experiment_poll` → importación verificable de `experiment_result` → `evaluation` → `next_cycle`. El origen, run y artefacto se validan antes de aceptar las métricas. Los tests de API simulada y el smoke del runner son distintos de una aceptación end-to-end contra el Gateway real.

La capacidad sigue **pendiente de despliegue local y de un workflow_dispatch real**. Las advertencias anteriores sobre ausencia total de integración describen la versión previa a este cambio.


## Evidencia real posterior

La integración remota se validó con un **dispatch real** de GitHub Actions y posterior importación y evaluación exitosa del recibo; detalles, ID de corrida y commit en [EXPERIMENT_LIVE_ACCEPTANCE.md](EXPERIMENT_LIVE_ACCEPTANCE.md). Este resultado **no** cubre el despliegue en Windows.
