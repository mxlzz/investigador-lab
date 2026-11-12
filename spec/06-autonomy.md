# E6 — Autonomía, transiciones y recuperación

**Estado:** propuesta técnica, no final.  
**Acordado:** metas frente a temas; oportunidades laterales no reemplazan metas activas; documentación por ciclo y bloqueo de decisiones no autorizadas; frontera de autonomía operativa de DEC-0010.

## 1. Estado operativo de un proyecto (PROPUESTA)

`created` → `brief_review` → `prior_art_review` → `knowledge_mapping` → `hypothesis_generation` → `novelty_review` → `experiment_design` → `experiment_run` → `evaluation` → `decision` → `archival`.

Bucles permitidos:
- `novelty_review → prior_art_review` ante evidencia insuficiente;
- `evaluation → hypothesis_generation` si el resultado abre nuevas preguntas;
- `evaluation → experiment_design` si la ejecución requiere confirmación o controles;
- `archival → prior_art_review` cuando aparece un antecedente nuevo.

Estados transversales: `awaiting_approval`, `blocked_external`, `paused`, `budget_exhausted`, `failed_recoverable`, `closed`.

No permitir `experiment_run` si no existe expediente de novedad y autorización de recursos. No permitir `closed_success` si las pruebas exigidas siguen abiertas.

## 2. Unidad de trabajo

Un ciclo autónomo debe:
1. Recuperar **estado confirmado** del proyecto y última operación pendiente.
2. Determinar acción de mayor valor dentro de los permisos actuales.
3. Comprobar si un expediente o experimento equivalente existe antes de duplicar.
4. Ejecutar trabajo acotado (incluido realizar solo investigación documental).
5. Registrar evidencia y nuevas hipótesis.
6. Evaluar si puede avanzar o necesita aprobación.
7. Confirmar persistencia y guardar la continuación mínima, incluso si hubo un error.

**Propuesta:** separar `intención de acción` de `ejecución` y `resultado confirmado` en un registro append-only para evitar que un reintento repita trabajos con efectos externos.

## 3. Reanudación e idempotencia

Identificador de ciclo y de acción, checkpoint antes de una operación externa, token/clave idempotente cuando la API lo soporte, comprobación del estado real tras reconexión. Ante fallo no asumir automáticamente que la operación no ocurrió; consultar evidencia (archivo, commit, ejecución, hash) antes de reintentar.

Para resultados voluminosos o carreras paralelas, usar publicación atómica de manifiesto o equivalente, no un `completed=true` escrito antes de subir los archivos.

## 4. Presupuestos y uso de la PC

Separar cuotas por proyecto y globales: tokens/API, tiempo total, duración por ejecución, CPU, RAM, GPU, disco/red y costos monetarios.

Propuesto: las tareas pesadas se programan con ventanas de recursos o se trasladan a runners remotos aprobados. El uso de un workspace propio no limita CPU ni impide interferir con otras aplicaciones; requiere límites reales del entorno.

Se deben medir consumos; si se alcanzan límites, suspender de manera segura, persistir el estado y notificar según las reglas de comunicación.

## 5. Concurrencia y dependencia de herramientas

Una sola acción que modifique un mismo recurso a la vez salvo mecanismo de concurrencia explícito. Subagentes pueden investigar en paralelo pero sus informes no se integran como evidencia validada sin revisión de fuentes y deduplicación.

El programador de OpenClaw se ejecuta en su Gateway: con equipo apagado o en suspensión local, los ciclos no pueden ejecutarse allí. Un servidor remoto o GitHub Actions son posibles motores alternativos para tareas definidas, sujetos a límites y permisos.

## 6. Frontera de autonomía operativa (ACORDADA, DEC-0010)

Tras autorizar el despliegue y fijar los límites de cada proyecto, Investigador **puede ejecutar sin autorización por acción** búsquedas e investigación, escritura de archivos de trabajo, desarrollo, experimentos en sandbox y publicación de avances en ramas experimentales autorizadas.

**Requieren autorización específica:** ampliar permisos o ámbito de acceso, superar presupuesto o recursos aprobados, modificar la configuración central de OpenClaw y publicar una versión estable. Los controles operativos se aplicarán fuera del texto del LLM. Sin política aprobada, la acción dependiente queda bloqueada; no se inventan límites por defecto.

Esta autorización conceptual rige el diseño futuro y **no activa** herramientas ahora.

## 7. Otros eventos y detalles sujetos a política (PROPUESTA)

- Gasto por encima de presupuesto aprobado; descarga/pago sujeto a licencia.
- Escribir fuera de workspace o repositorio de proyecto.
- Aumentar permisos, instalar software o ejecutar código externo fuera del entorno aislado.
- Modificar configuraciones globales, tokens, conexiones o ramas estables.
- Publicar contenido externamente o iniciar una nueva investigación lateral independiente.
- Experimentos físicos o regulados; interacciones con personas o sistemas no autorizados.

La matriz exacta de permisos debe fijarse en E8; aquí es diseño, no política aplicada.

## 8. Cierre de ciclo y comunicación

Propuesto: reporte corto basado en cambios verificables (`state_before`, `action`, `evidence`, `state_after`, `next`, `blocked_on`). Cada notificación incluye vínculos/IDs; si no hay nueva evidencia, no declarar progreso.

## 9. Escenarios de aceptación

- A01: se interrumpe tras ejecutar pero antes de registrar → reconciliar, no duplicar.
- A02: supera presupuesto → suspende de forma recuperable.
- A03: encuentra línea lateral → archiva y comunica sin desviar el objetivo.
- A04: falla un subagente → no promociona su resultado sin evidencia.
- A05: falta acceso a GitHub → persiste localmente si es seguro y marca pendiente de publicación.
- A06: corre otra instancia en el mismo proyecto → conflicto detectable, sin sobrescritura silenciosa.

## Pendientes de diseño
- Cadencia de ciclos y ventanas de recursos.
- Límites cuantitativos, concurrencia permitida y prioridades.
- Aprobaciones exactas, canales y reglas de escalamiento.
- Motor de ejecución y nivel de disponibilidad (PC local vs remoto).
- Política de seguimiento y de errores repetidos.