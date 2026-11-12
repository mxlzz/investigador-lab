# E1 — Contrato funcional y experiencia de uso

**Estado:** borrador de especificación, NO aprobado en conjunto.  
**Decisiones existentes:** DEC-0002, DEC-0005, DEC-0006, DEC-0007, DEC-0008, DEC-0010, DEC-0012, DEC-0013, DEC-0014, DEC-0015, DEC-0016, DEC-0017, DEC-0018, DEC-0019.  
**Objetivo:** definir lo que debe suceder desde un encargo hasta su entrega, independientemente de la plataforma que lo ejecute.

## 1. Dos formas de encargo (ACORDADO)

**Meta:** pedido con un resultado deseado (p. ej., desarrollar una herramienta). Se protege la finalidad acordada mientras se investigan métodos y hallazgos.  
**Tema:** campo abierto para mapear conocimiento, identificar preguntas y construir una agenda propia de investigación.

En ambos casos, la primera etapa efectiva consiste en investigar antecedentes y registrar cobertura/limitaciones. No empezar creando código o proponiendo experimentos sin situar el problema.

## 2. Interpretación inicial (PROPUESTA)

Al recibir el encargo, crear un expediente de proyecto con:
- texto original del pedido y fecha;
- modalidad propuesta (meta/tema), ámbito disciplinar y límites explícitos;
- producto esperado, si lo hubiera, y recursos disponibles;
- condiciones de éxito expresadas por el usuario y aspectos por definir;
- dependencias, riesgos, permisos y restricciones;
- plan de exploración inicial, revisable, con estado `proposed`/ `approved`.

**Regla propuesta:** si faltan datos no esenciales, elaborar supuestos etiquetados y avanzar solo en acciones reversibles/lectura; si falta un criterio decisivo (p. ej., presupuesto autorizable o acceso físico), solicitarlo sin inventarlo.

## 3. Autonomía de investigación (ACORDADO)

**Meta activa:** puede elegir métodos y formular hipótesis dentro del alcance, documentando decisiones. Si detecta oportunidades laterales:
1. Conserva una ficha independiente con el contexto de descubrimiento y los antecedentes disponibles.
2. La clasifica como posibilidad, hipótesis o propuesta respaldada, sin declararla novedosa automáticamente.
3. La comunica al usuario sin desplazar la meta.
4. No comienza una línea lateral independiente sin autorización del usuario (DEC-0006).

**Tema abierto:** puede seleccionar preguntas y explorar líneas propias justificando sus prioridades y conclusiones.

## 4. Estados de entrega (ACORDADO)

- `funcional`: existe una herramienta que ejecuta su cometido declarado, todavía sin prueba suficiente de superioridad.
- `meta_cumplida`: se satisfacen objetivos y pruebas de aceptación acordados; se dispone de una versión estable y documentada; si la meta supone mejoras, existen comparaciones reproducibles que las respaldan.
- `investigacion_cerrada`: se documentó la evaluación de oportunidades restantes y el motivo de no continuar por ahora.
- `concluida_sin_meta`: investigación cerrada legítimamente con resultados negativos o límites documentados, **sin** presentarla como éxito funcional.

Las metas abiertas de conocimiento necesitan condiciones de entrega específicas; no forzar el estado `meta_cumplida` de una herramienta cuando no hay herramienta.

## 5. Frontera operativa (ACORDADA, DEC-0010)

El agente podrá investigar, escribir, desarrollar, experimentar de modo aislado y publicar ramas experimentales sin solicitudes repetidas **dentro de límites aprobados**. Necesita autorización para ampliar permisos, superar presupuesto, modificar configuración central de OpenClaw y publicar versiones estables. Valores exactos y permisos por herramienta siguen abiertos.

## 6. Comunicación con el usuario (PROPUESTA)

- Resumen al iniciar proyecto: interpretación, límites y próximos pasos de investigación.
- Informes periódicos con avances **verificables** (fuente, expediente, experimento, commit), obstáculos y cambios de hipótesis.
- Avisos puntuales solo cuando exista decisión humana pendiente, problema importante o hallazgo lateral suficientemente sustentado.
- Separar lo **observado**, lo **inferido**, lo **propuesto** y lo **aprobado**.
- Notificar que una meta fue cumplida o que una investigación se cerró, junto a resultados y pendientes.

**Acordado (DEC-0015, DEC-0018):** un informe diario por Telegram, con registro consultable en OpenClaw, y alertas importantes. **Pendientes:** horario, zona horaria y criterio de alerta.

## 7. Gestión de prioridades (ACORDADO EN PRINCIPIO, DEC-0017)

El usuario define prioridades iniciales entre proyectos; el agente puede distribuir recursos y reorganizar tareas dentro de esas prioridades sin sustituir objetivos explícitos. Límites exactos y procedimiento de cambio de prioridad quedan abiertos.

**Cambios de encargo (PROPUESTA):**

Nuevo encargo del usuario → conservar expediente de lo que estaba ejecutándose, evaluar conflictos de tiempo y permisos, solicitar prioridad solo si dos objetivos aprobados compiten por el mismo recurso. No cancelar silenciosamente un proyecto.

Cambios en una meta → versionar el encargo y revisar criterios de éxito, antecedentes y experimentos afectados; no reinterpretar retroactivamente resultados de un criterio antiguo.

## 8. Declaración de cumplimiento (ACORDADO, DEC-0019)

El agente declara `meta_cumplida` con evidencia y criterios de aceptación verificablemente superados, informa y registra el dictamen. El usuario debe autorizar **por separado** cualquier publicación estable, merge o release. Faltan detalles sobre auditoría previa obligatoria.

## 9. Casos para la batería de aceptación (BORRADOR)

- F01: meta clara, investigación previa, eventual versión y comparación.
- F02: tema abierto, mapa y agenda sin fabricar una promesa de software.
- F03: descubre una aplicación lateral; registra y avisa, continúa meta original.
- F04: no logra demostrar mejora; resultado negativo trazable, sin falso éxito.
- F05: usuario modifica el objetivo; versión del encargo y expediente de impacto.
- F06: dos proyectos compiten por recursos; no ejecuta ambos simultáneamente sin política.

## Pendientes para cerrar E1
1. Varios proyectos activos y prioridades iniciales humanas acordados (DEC-0013, DEC-0017); falta política de reparto y concurrencia.
2. Frontera principal de aprobaciones acordada (DEC-0010); faltan detalles de herramientas.
3. Telegram + registro OpenClaw diarios (DEC-0018); faltan horario y criterios de alertas.
4. Declaración automática con criterios superados (DEC-0019); falta definir auditoría previa por criticidad.
5. ¿Qué entregables mínimos se esperan en una exploración abierta?