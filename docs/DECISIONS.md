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


## DEC-0011 — Cuotas gratuitas y presupuesto monetario de servicios pagos
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador puede utilizar autónomamente las **cuotas gratuitas** de modelos, APIs y servicios habilitados, sin solicitar aprobación por cada llamada ni imponer un tope monetario artificial dentro del nivel gratuito.
- Las cuotas gratuitas están sujetas a los límites y condiciones reales de cada proveedor; no se interpretan como uso ilimitado ni autorizan eludir restricciones o cambiar a un plan facturable automáticamente.
- **Presupuesto monetario por defecto de cada proyecto: cero** para servicios pagos. Todo gasto debe contar con un monto y alcance aprobados específicamente para ese proyecto antes de ejecutarse. Agotar una cuota gratuita no autoriza consumo pago ni conversión automática a modalidad facturable.
- Los límites de CPU, RAM, GPU, tiempo y uso de la computadora se definirán por separado, porque una API gratuita puede utilizar recursos locales o afectar otros proyectos.
- Ante agotamiento de cuota, pausar la operación afectada, persistir el estado y, si existe otra ruta gratuita/autorizada equivalente, continuar sin incumplir condiciones; si no, esperar la reposición o solicitar presupuesto al usuario.
- Esta decisión no activa cuentas, modelos, servicios ni tareas; sigue vigente la restricción de implementación de DEC-0005.
- Motivo: aprovechar capacidades gratuitas y eliminar intervenciones innecesarias evitando gastos no autorizados.


## DEC-0012 — Cargas intensivas locales solo con PC libre
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador puede ejecutar trabajos intensivos de CPU/GPU en la computadora del usuario **solo cuando la PC esté libre**. Las tareas ligeras se sujetarán a los límites de recursos de la implementación futura.
- Pendiente: definición verificable de «libre», umbrales de intensidad, comportamiento ante la reanudación del uso, política de horarios y ejecución remota.
- Motivo: aprovechar capacidad local sin interferir con el uso personal.

## DEC-0013 — Varios proyectos concurrentes, prioridades y recursos compartidos
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador puede mantener **varios proyectos activos simultáneamente**, con priorización y administración de recursos compartidos. No hay un límite fijo de proyectos acordado todavía.
- Pendiente: regla de prioridad, concurrencia real permitida, prevención de conflictos de escritura y reparto de cuotas de servicios gratuitos.
- Motivo: permitir continuidad de investigaciones independientes y aprovechar recursos disponibles.

## DEC-0014 — Visibilidad por proyecto, con preferencia por repositorios públicos
- Fecha: 2026-11-12
- Estado: acordada (dirección de diseño)
- Decisión: la visibilidad se **elige al iniciar cada proyecto**. Preferencia operativa expresada posteriormente: favorecer **repositorios públicos** para aprovechar la gratuidad de GitHub Actions en runners estándar; conservar elección de repositorio privado si el proyecto lo requiere.
- Restricción: nunca subir credenciales, información privada, datos protegidos o artefactos que no puedan divulgarse. La visibilidad pública de código no obliga a publicar datos de investigación, logs o resultados restringidos.
- Fundamento externo: GitHub indica uso gratuito e ilimitado **en minutos** para runners estándar alojados por GitHub en repositorios públicos; esto no elimina límites de concurrencia, almacenamiento, duración ni cargos por runners grandes/GPU. Referencias: https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job y https://docs.github.com/en/billing/reference/actions-runner-pricing
- Pendiente: cómo elegir la visibilidad dentro del formulario inicial y reglas de publicación de resultados/artefactos por proyecto.
- Motivo: aprovechar la infraestructura gratuita de Actions sin imponer visibilidad pública a todo contenido.

## DEC-0015 — Informe diario y alertas importantes
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador entrega **un informe de progreso al día** y avisa fuera de ese informe ante eventos importantes. Los informes deben resumir avances verificables, bloqueos y oportunidades laterales que ameriten atención.
- Pendiente: hora, zona horaria, canal de entrega y criterios exactos para clasificar una alerta importante; esto no implica crear automatizaciones durante el diseño.
- Motivo: seguimiento útil sin exigir confirmación o atención continua.


## DEC-0016 — Inactividad local de 15 minutos y pausa al regresar
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: en la PC local, Investigador solo inicia cargas intensivas de CPU/GPU luego de **15 minutos sin actividad del usuario**. Si se detecta actividad nuevamente, debe **pausar de manera controlada** las cargas intensivas, conservando progreso y estado para reanudarlas cuando vuelva a cumplirse la condición.
- Alcance: la regla de inactividad no afecta por sí sola tareas de bajo consumo ni procesos remotos; todos siguen sujetos a permisos y presupuestos.
- Pendiente: sensor de actividad compatible con Windows, qué operaciones se pueden suspender de forma segura frente a cuáles deben terminar la unidad atómica vigente, umbrales de intensidad y recuperación tras reinicio.
- Motivo: utilizar recursos locales disponibles sin competir con el uso del equipo.

## DEC-0017 — Prioridades humanas y planificación autónoma entre proyectos
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: el usuario establece las **prioridades iniciales de los proyectos**. Dentro de ellas y de los límites autorizados, Investigador puede **distribuir recursos y reorganizar el orden de tareas** según dependencias, oportunidades, bloqueos y eficiencia operativa.
- Restricción: reorganizar tareas no equivale a cambiar unilateralmente las metas del usuario, autorizar una investigación lateral independiente ni ignorar de forma permanente un proyecto prioritario.
- Pendiente: criterios exactos de planificación, equidad, contención de recursos y procedimiento para modificar prioridades expresas.
- Motivo: equilibrar control del usuario y eficiencia de la ejecución autónoma.

## DEC-0018 — Informe diario en Telegram y registro persistente en OpenClaw
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador envía **un informe diario por Telegram**, manteniendo el mismo progreso **consultable desde OpenClaw**; las alertas importantes conservan canal de notificación independiente según DEC-0015.
- Restricción: el registro de referencia del trabajo sigue siendo persistente y trazable en GitHub/almacenamiento aprobado; el mensaje de Telegram y su vista en OpenClaw no sustituyen los registros verificables. No divulgar material reservado en avisos.
- Pendiente: horario y zona horaria del envío, destino de Telegram y reglas de reintento, formato y definición de alertas; esta decisión no configura Telegram ni crea tareas todavía.
- Motivo: seguimiento diario accesible sin perder historial verificable.

## DEC-0019 — Declaración automática de meta cumplida con publicación estable autorizada
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador puede **declarar una meta cumplida** cuando la evidencia y las pruebas satisfacen los criterios de aceptación establecidos y verificables. Debe registrar la evidencia, estado y limitaciones y comunicar la conclusión al usuario; no necesita una confirmación adicional únicamente para reconocer ese estado.
- Límite: **publicar una versión estable sigue requiriendo autorización humana**, aunque se haya declarado la meta cumplida. La declaración tampoco autoriza merges, tags, releases ni cambios de configuración central.
- Si la evidencia es incompleta, la evaluación queda pendiente o inconclusa; no declarar éxito por el relato de un LLM. No confundir meta cumplida con investigación cerrada o con resultados negativos (DEC-0007).
- Pendiente: nivel de auditoría independiente exigible antes de declarar cumplimiento y protocolos específicos por tipo de meta.
- Motivo: permitir resultados autónomos verificables sin delegar la decisión de publicación estable.


## DEC-0020 — Informe diario consolidado a las 20:00 (Buenos Aires)
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador prepara **un único informe consolidado de todos los proyectos activos cada día a las 20:00**, según la zona `America/Argentina/Buenos_Aires`. Se entrega por Telegram y queda consultable desde OpenClaw (DEC-0018).
- Contenido: distinguir avances realmente verificados, resultados negativos, bloqueos, decisiones pendientes y descubrimientos laterales relevantes, con referencias al expediente persistente. Evitar notificaciones independientes por proyecto como alternativa al informe consolidado.
- Pendiente técnico: tolerancias de entrega, reintentos, recuperación ante caída del gateway o red y generación cuando el ejecutor local no está disponible. El horario es objetivo de entrega, no garantía técnica de puntualidad de servicios externos.
- Motivo: seguimiento diario unificado y comparable entre proyectos.

## DEC-0021 — Alertas inmediatas acotadas a eventos relevantes
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: Investigador envía alertas fuera del informe diario solo por **aprobaciones requeridas**, **fallos graves** y **descubrimientos excepcionalmente relevantes**. Otros avances se agrupan en el informe consolidado.
- Pendiente: criterios operativos verificables de gravedad y relevancia, limitación de alertas repetidas y procedimiento cuando el canal está caído.
- Motivo: reducir ruido sin demorar decisiones o eventos que realmente requieran atención.

## DEC-0022 — Auditoría breve diaria y profunda en hitos importantes
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: el proceso de **auditoría independiente de ChatGPT**, distinto del informe de Investigador, incluye una **revisión breve diaria** y una **revisión profunda ante hitos importantes** de investigación o desarrollo.
- Alcance: las revisiones contrastan el trabajo registrado con evidencia accesible e informan límites de verificación; no reescriben prompts, objetivos ni autorizaciones.
- Pendiente: hora y mecanismo concreto de disparo, definición verificable de hito, alcance de la auditoría profunda, formato de observaciones, autoridad ante hallazgos críticos y viabilidad de la conexión/orquestación con ChatGPT.
- Motivo: supervisión continua de bajo costo y revisión rigurosa en puntos de decisión.

## DEC-0023 — Continuidad de tareas compatibles en ejecución remota gratuita
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: con la PC local **apagada o no disponible**, Investigador debe poder **continuar las tareas compatibles** utilizando GitHub Actions u otro entorno remoto gratuito previamente autorizado, sin exceder permisos, políticas de cuotas ni presupuestos (DEC-0010, DEC-0011).
- Condiciones: ejecutar únicamente tareas y datos aptos para dicho entorno; los procesos dependientes de recursos o archivos locales quedan suspendidos hasta disponer del entorno. Persistir checkpoints y evidencia fuera del almacenamiento efímero de los runners y reconciliar resultados para evitar duplicados.
- Restricción: la elección de un runner gratuito no autoriza uso de runners grandes/GPU pagos, acceso a secretos locales, publicación estable ni ejecución remota de toda la instalación de OpenClaw. No se presume que GitHub Actions sea un proceso persistente o un scheduler infalible.
- Pendiente: origen fiable de disparos, continuidad del coordinador, datos accesibles, credenciales, recuperación, límites de concurrencia y qué categorías de trabajo se delegan a remoto.
- Motivo: mantener progreso útil fuera del horario de encendido de la PC, aprovechando infraestructura gratuita autorizada.


## DEC-0024 — Auditor bloquea publicaciones estables ante errores críticos
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: un hallazgo **crítico fundamentado** de la auditoría independiente de ChatGPT puede **bloquear la publicación de versiones estables**, aun cuando el agente declare una meta cumplida o se solicite un release. El bloqueo afecta a la **promoción estable**, no necesariamente a la investigación ni a las ramas experimentales dentro de su autorización.
- Debe existir una restricción verificable en la capa de publicación, independiente del texto generado por el LLM: no basta una recomendación del auditor. Se conserva la aprobación humana de publicación exigida por DEC-0019, que por sí sola no borra un bloqueo crítico.
- Pendiente: definir condiciones verificables de «crítico», procedimiento de subsanación, quién puede levantar o disputar un bloqueo, qué ocurre si el auditor está indisponible y cómo integrar de forma fiable su resultado al control de publicación.
- Motivo: impedir publicar como estable un resultado con deficiencias de evidencia o seguridad graves.

## DEC-0025 — Auditoría profunda ante mejoras importantes, cierre y publicación
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: ejecutar **auditoría profunda** ante (a) **mejoras importantes** reportadas con evidencia; (b) **cierres de metas** o investigaciones; y (c) **candidatos a publicación estable**. Se mantiene además la auditoría breve diaria (DEC-0022).
- No se equiparan experimentos aislados ni cambios menores a hitos obligatorios. La definición operacional de «mejora importante» y el momento preciso de cada disparador quedan pendientes.
- Motivo: concentrar revisión rigurosa en resultados con consecuencias técnicas o de cierre.

## DEC-0026 — Datos públicos o expresamente autorizados para ejecutores remotos
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: los ejecutores remotos gratuitos únicamente pueden **recibir o procesar datos públicos, o datos cuya transferencia y procesamiento remotos hayan sido autorizados expresamente** para el proyecto y alcance correspondiente.
- La autorización de ejecutar un proyecto remoto no equivale a autorización global para transferir archivos privados, credenciales, material de terceros restringido o datos personales. La elegibilidad del dato y la habilitación del ejecutor se verifican antes del envío; los datos no elegibles permanecen locales o el trabajo se bloquea.
- Pendiente: etiquetado, política de clasificación de artefactos derivados, forma de registrar consentimiento/alcance, borrado/retención en runners y control de accesos por proyecto.
- Motivo: permitir continuidad gratuita sin divulgar inadvertidamente datos privados.

## DEC-0027 — Reintento y entrega tardía sin duplicados del informe diario
- Fecha: 2026-11-12
- Estado: acordada (diseño)
- Decisión: si falla el envío del informe consolidado previsto para las **20:00 America/Argentina/Buenos_Aires**, el sistema debe **reintentar y entregar en cuanto sea posible**, evitando duplicaciones. No descartar automáticamente el informe ni esperar obligatoriamente a que vuelva el OpenClaw local.
- El informe representa un **día de reporte identificable** y debe conservar estado de envío para evitar duplicación por reintentos o ejecución concurrente. Toda confirmación de entrega se basa en evidencia del servicio, no en la intención de enviar.
- Pendiente: política de reintentos/intervalos, reconciliación si Telegram aceptó el mensaje pero se perdió el acuse, tratamiento de informes atrasados cuando ya corresponde el siguiente y tiempo máximo de conservación.
- Motivo: preservar continuidad informativa pese a interrupciones temporales de red, scheduler o ejecutores.


## DEC-0028 — Dos verificaciones breves diarias del Auditor ChatGPT
- Fecha: 2026-11-13
- Estado: acordada como **requisito de diseño** por pedido explícito del usuario; realización técnica pendiente.
- Decisión: ChatGPT, como auditor externo al agente Investigador, debe realizar **dos verificaciones breves del avance por día**, independientes del informe diario de Investigador de las 20:00. La revisión profunda por hitos DEC-0025 se conserva.
- Reemplaza en DEC-0022 **solo la frecuencia** de «una breve diaria». No implica tener ya una automatización conectada o habilitada.
- Propuesta no aprobada: 09:00 y 19:00, hora `America/Argentina/Buenos_Aires`; falta acordar los horarios, la cobertura de fines de semana y verificar acceso a los repos privados desde una ejecución programada.
- Fundamento: detectar errores y desvíos antes de que se acumulen ciclos, sin confundir revisión independiente con el propio reporte del Investigador.

## DEC-0029 — Separar diseño de implementación para el canal Auditor–Investigador y Obsidian
- Fecha: 2026-11-13
- Estado: acordada como **regla de trabajo de esta conversación**.
- Decisión: en este chat se define, debate y versiona el comportamiento en GitHub. La implementación, instalación, configuración de tareas y aceptación operativa se realizan en otro chat tras la decisión pertinente.
- Alcance de esta entrega: `spec/10-auditor-chatgpt.md`, `spec/contracts/audit-dialogue-v1.md`, `spec/11-obsidian-projection.md` y `handoff/AUDITOR_OBSIDIAN_DESIGN_BACKLOG.md`. Son propuestas de diseño donde no hay una decisión explícita; no confundirlas con funcionalidades instaladas.


## DEC-0030 — Resolver desacuerdos entre Investigador y Auditor antes de escalar
- Fecha: 2026-11-13
- Estado: **acordada (diseño)** a partir de instrucción explícita del usuario.
- Decisión: ante discrepancias entre Investigador y Auditor, ambos intentarán resolverlas autónomamente mediante comprobaciones y evidencia adicional, en lugar de pedir una decisión humana inmediata. Solo las discrepancias no resueltas o las que requieran una decisión o permiso que ninguno tiene se elevan al usuario, con ambos argumentos y evidencia trazable.
- La propuesta de **máximo dos rondas sustantivas** sin nueva evidencia es un parámetro inicial por confirmar, no una decisión previamente tomada por el usuario.
- La resolución autónoma no autoriza alterar metas o publicar versiones estables.

## DEC-0031 — GitHub Issues como bandeja de auditoría y comentarios de cierre
- Fecha: 2026-11-13
- Estado: **propuesta de arquitectura para discusión**, no implementada.
- Dirección: un Issue de control por proyecto como canal del Auditor, con comentarios estructurados, polling por el planificador local aproximadamente cada 15 minutos, journal y cursores; no depender de @menciones ni de GitHub Notifications. El comentario puede proponer `closure_proposed`; nunca cierra por sí mismo la investigación. Detalles en `spec/contracts/github-audit-inbox-v1.md` y `spec/contracts/research-closure-v1.md`.
- Para `goal_met` o `research_concluded`, Investigador debe corroborar evidencias y realizar cierre auditable, preservando historial y deteniendo solo ese proyecto. Una pausa por falta de progreso no se confunde con meta cumplida ni cierre definitivo.
- Riesgo pendiente: ChatGPT y OpenClaw pueden publicar bajo la misma identidad GitHub; se requiere separar y verificar la autoría para atribuir autoridad de auditoría. Sin eso, los comentarios se tratan como sugerencias no autenticadas.
- Pendientes: capacidad real de comentarios desde tareas ChatGPT, identidad/credenciales, formato final, límites y reanudación, cierre de investigaciones exploratorias abiertas.
