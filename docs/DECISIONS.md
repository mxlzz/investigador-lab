# Registro inicial de decisiones

## DEC-0001 — Agente universal y proyectos separados
- Fecha: 2026-11-12
- Estado: propuesta de diseño
- Motivo: investigar distintos temas y metas sin cambiar la identidad central.
- Implicación: metodología común, registros y repositorios por proyecto.

## DEC-0002 — Antecedentes antes de ideación y experimentos
- Fecha: 2026-11-12
- Estado: requisito de diseño
- Motivo: reducir repeticiones innecesarias y afirmaciones injustificadas de novedad.
- Evidencia: los autores de AI Scientist v3 identifican limitaciones de revisión bibliográfica durante la ideación; ver SRC-0001.

## DEC-0003 — Conocimiento consultable con Obsidian
- Fecha: 2026-11-12
- Estado: propuesta de diseño
- Motivo: consulta humana, portabilidad Markdown y enlaces entre registros.
- Límite: Graph View visualiza vínculos; no verifica relaciones científicas.

## DEC-0004 — Evaluar reutilización de AI Scientist v3
- Fecha: 2026-11-12
- Estado: pendiente de auditoría técnica
- Motivo: aprovechar orquestación, evaluación, ablaciones y evidencias donde resulte apropiado.
- Pendiente: examinar código, licencia, dependencias, seguridad y costos antes de integrar.

## DEC-0005 — Gobernanza de la etapa de diseño
- Fecha: 2026-11-12
- Estado: acordada
- Decisión: el proyecto permanece en fase de discusión y diseño hasta que el usuario autorice explícitamente comenzar su implementación.
- Alcance: se pueden contrastar alternativas, investigar referencias y registrar en GitHub las decisiones efectivamente acordadas. Las ideas pendientes se identifican como propuestas y no se presentan como aprobadas.
- Restricciones: no implementar código, configurar OpenClaw, activar automatizaciones, iniciar experimentos ni crear tareas de ejecución por iniciativa propia. El registro de diseño no implica autorización para ejecutar la hoja de ruta.
- Motivo: separar la definición del sistema de su construcción y evitar compromisos prematuros.


## DEC-0006 — Doble autonomía y conservación de descubrimientos laterales
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador admite encargos orientados a una **meta concreta** y encargos de **exploración abierta de un tema**.
- Con meta concreta: el objetivo encomendado conserva prioridad. El agente puede detectar hipótesis, aplicaciones y líneas de investigación no previstas; las documenta con antecedentes, justificación, vínculo con el trabajo original, incertidumbres y posibles próximos pasos, y se las comunica al usuario sin abandonar ni redefinir unilateralmente la meta.
- Las oportunidades laterales se incorporan a una cartera de **investigaciones futuras**, separada de los compromisos activos. El agente no inicia automáticamente una línea independiente que se aparte de la meta: el usuario puede autorizarla posteriormente, por ejemplo después de completar la meta inicial.
- Con tema abierto: el agente puede definir y explorar sus propias preguntas, priorizándolas y documentando por qué las considera relevantes, dentro del alcance y límites acordados.
- Una oportunidad sugerida no se presenta como innovación comprobada: antes de tratarla como novedosa, debe pasar por contraste de antecedentes y conservar el grado de incertidumbre.
- Motivo: permitir descubrimientos inesperados sin perder el foco de los encargos concretos, y conservarlos para futuras decisiones del usuario.


## DEC-0007 — Criterios de cumplimiento y cierre de una meta
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: distinguir **versión funcional**, **mejora demostrada** e **innovación razonablemente agotada**. Son grados diferentes de avance y no deben equipararse.
- **Meta cumplida:** la herramienta satisface los objetivos y criterios de aceptación definidos para el encargo, existe una versión estable y documentada, y las mejoras que formen parte de la meta están respaldadas por pruebas reproducibles y comparaciones pertinentes. Para encargos de exploración sin objetivo de mejora, se establecen criterios específicos de entrega.
- **Investigación cerrada:** además de completar o concluir la investigación, se documentan las principales líneas pendientes y la justificación para no seguir invirtiendo recursos por el momento. No significa que no pueda haber futuras innovaciones.
- **Investigación concluida sin meta cumplida:** es un desenlace válido si no se logra el resultado buscado y se conservan evidencias, resultados negativos, limitaciones y explicación de por qué se detuvo. No presentar este estado como éxito técnico.
- **Oportunidades futuras:** no impiden reconocer una meta cumplida; se registran para posible autorización posterior (ver DEC-0006).
- Motivo: evitar investigaciones indefinidas o declaraciones de éxito sin respaldo y distinguir entrega, validación y cierre exploratorio.


## DEC-0008 — Especificación completa de prompts y comportamiento antes de Codex
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: el usuario y ChatGPT definen y revisan **todo el comportamiento de Investigador antes de autorizar la implementación**. Esto incluye prompts e instrucciones permanentes, prompts de cada rol/fase, plantillas de mensajes, contratos de entrada y salida, reglas de decisión, estado/memoria, herramientas, límites, criterios de validación, casos de error y pruebas de aceptación. Nada de ese diseño se delega inicialmente a Codex.
- Rol de Codex: **implementador** de una especificación cerrada. Puede tomar decisiones de ingeniería que no alteren el comportamiento diseñado (estructura del código, integración, implementación técnica, corrección de bugs) y debe señalar vacíos, contradicciones o imposibilidades; no inventar prompts ni establecer por cuenta propia reglas funcionales para completar la especificación.
- Cuando una definición requerida falte o sea ambigua, Codex debe reportar el bloqueo para que se resuelva en la etapa de diseño, en vez de suplirlo unilateralmente.
- Entregables de diseño para el traspaso: especificación funcional, prompts versionados exactos, flujos y estados, contratos/esquemas, matriz de permisos y herramientas, trazabilidad/almacenamiento, comportamiento ante errores, pruebas y criterios de aceptación, todos coherentes entre sí.
- Gobernanza: mientras se diseña, documentar acuerdos en GitHub con estado explícito; no ejecutar implementación, instalar herramientas ni configurar OpenClaw por iniciativa propia. El traspaso a Codex requerirá aprobación expresa del usuario (DEC-0005).
- Motivo: asegurar que Codex implemente la visión discutida sin redefinirla ni decidir cómo debe razonar Investigador.


## DEC-0009 — Especificación portable e implementación independiente
- Fecha: 2026-11-12
- Estado: acordada (dirección de diseño)
- Decisión: el repositorio debe permitir que un implementador humano, Codex u otro agente, incluido un agente instalador de OpenClaw, materialice **el mismo sistema especificado**, sin definir por su cuenta el comportamiento ni los prompts. Debe existir una guía de instalación manual verificable una vez desarrollado el software.
- Distinción: diseño, implementación funcional e instalación/distribución son productos distintos; no confundir instrucciones completas de diseño con un instalador ya operativo.
- Criterio de portabilidad: el contrato funcional y las pruebas de aceptación no dependerán del implementador. Los detalles de plataforma quedan en adaptadores/configuración separados.
- Restricción: seguimos en fase de diseño (DEC-0005). No se autorizan scripts ejecutables ni modificaciones de OpenClaw en esta fase.
- Motivo: evitar dependencia de Codex, permitir configuración propia y simplificar reinstalación, migración y auditoría.


## DEC-0010 — Autonomía operativa dentro de límites aprobados
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: una vez autorizado el funcionamiento del sistema y definidos sus límites cuantitativos, Investigador puede **sin autorización por cada operación** investigar, consultar fuentes, escribir archivos de trabajo, desarrollar código, ejecutar experimentos en un entorno aislado y publicar resultados y avances en ramas experimentales de sus repositorios autorizados.
- Condición: estas acciones deben mantenerse dentro del **alcance, permisos, recursos y presupuesto previamente aprobados**, con registro verificable de acciones y resultados; esta decisión no establece todavía importes ni límites concretos.
- Requieren autorización humana específica: ampliar permisos o ámbitos de acceso, superar presupuestos o límites aprobados, modificar la configuración central de OpenClaw y publicar versiones estables. No convertir una rama experimental en estable mediante merge, tag/release u otra vía indirecta.
- Los controles deben aplicarse por un ejecutor/verificador independiente de la respuesta del modelo, no depender solo del contenido de los prompts. Sin permiso verificable o sin límite aprobado, la operación afectada queda bloqueada o se solicita autorización; no se presume consentimiento.
- Esta decisión define el **comportamiento futuro** de Investigador, no autoriza implementarlo ni activar ninguna operación ahora (DEC-0005).
- Motivo: permitir investigación y desarrollo autónomos sin otorgar control irrestricto del equipo ni de las versiones publicadas.
