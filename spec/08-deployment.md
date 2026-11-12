# E8 — Arquitectura OpenClaw e instalación portable

**Estado:** borrador; la elección de implementador y las configuraciones concretas quedan abiertas.  
**Restricción vigente:** no instalar, configurar, ejecutar ni codificar nada en esta fase.

## 1. Principio de portabilidad (ACORDADO COMO DIRECCIÓN)

La misma especificación debe servir para una implementación realizada por Codex, otro agente (incluso uno de OpenClaw) o un desarrollador humano, sin redefinir el comportamiento del Investigador.

Separar:
- `spec/`: contrato funcional y prompts **exactos** acordados;
- `implementation/` (futuro): código y adaptadores construidos conforme a esos contratos;
- `installation/` (futuro): pasos manuales GUI-prioritarios, configuración de referencia, preflight, instalación, verificación, actualización y desinstalación;
- `handoff/` (futuro): manifiesto y criterios de aceptación para el implementador.

**Una especificación no es todavía un instalador.** Antes de entregar una guía ejecutable se requiere tener componentes implementados y una versión objetivo de OpenClaw verificada.

## 2. Capa lógica independiente (PROPUESTA)

El protocolo de investigación, decisiones, estado, procedencia, prompts y pruebas se define sin invocar llamadas específicas de OpenClaw. Un adaptador de plataforma:
- lee/escribe registros;
- proporciona navegación, lectura de repositorios, ejecución, agenda y mensajes;
- verifica identidad/permisos;
- presenta errores normalizados;
- carga prompts y contexto mediante mecanismos documentados.

Así la metodología no dependería de una sola versión de OpenClaw ni de Codex.

## 3. Entorno de OpenClaw

Información de referencia (verificar en la versión instalada antes de congelar):
- Workspace: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md` y otros archivos opcionales; el contexto inyectado puede truncarse si es grande.
- El workspace es directorio de trabajo, **no** aislamiento del host.
- Sandboxing de herramientas puede configurarse por agente, pero está desactivado por defecto y no es perfecto.
- La programación reside en Gateway; no se ejecuta en la PC local si Gateway está detenido/suspendido.
- Existen subagentes y tareas aisladas, con consumo independiente.

Referencias:  
https://docs.openclaw.ai/concepts/agent-workspace  
https://docs.openclaw.ai/concepts/agent  
https://docs.openclaw.ai/gateway/sandboxing  
https://docs.openclaw.ai/gateway/security/tool-permissions  
https://docs.openclaw.ai/automation/cron-jobs/how-it-works  
https://docs.openclaw.ai/tools/subagents

## 4. Paquete de configuración a definir por nosotros (PROPUESTA)

- Contenido literal de cada archivo del workspace OpenClaw.
- Contratos para skills/herramientas con esquema de entrada/salida y permisos.
- Prompt de sistema y prompts de etapa con versiones exactas.
- Política de modelos (primario/alternativa), límites y fallback.
- Perfil de sandbox por agente, filesystem roots y acceso permitido a Internet/GitHub.
- Agenda, uso de recursos y notificaciones.
- Reglas de archivo local, repositorio remoto y sincronicidad.
- Plantillas de proyecto, repositorio, Obsidian y manifiestos de evidencia.

## 5. Permisos operativos y gastos aprobados conceptualmente (DEC-0010, DEC-0011)

La futura configuración de herramientas y repositorios **debe permitir** investigación, edición de archivos de proyecto, desarrollo, pruebas aisladas y escritura en ramas experimentales dentro de límites autorizados; **debe exigir aprobación** para elevar permisos, exceder presupuestos, cambiar configuración central de OpenClaw o publicar versiones estables.

**Cuotas y gastos (acordado, DEC-0011):** uso autónomo de niveles gratuitos autorizados dentro de sus condiciones; todo servicio facturable tiene presupuesto monetario predeterminado cero para cada proyecto y requiere un importe explícitamente aprobado. Agotamiento gratuito no permite cobro ni upgrade automático. Los límites de recursos de la PC se definirán independientemente.

Estas restricciones deberán probarse en la capa de ejecución/autorización, no depender solamente de instrucciones de lenguaje natural. Todavía falta elegir valores concretos de recursos y verificar cómo imponerlos en la versión de OpenClaw elegida.

**Acordado (DEC-0014):** cada proyecto define visibilidad al iniciarse, con preferencia por repositorio público para usar runners estándar gratuitos; datos y materiales no publicables se mantienen fuera del repositorio público. Los runners grandes/GPU siguen sujetos a presupuesto autorizado.

**Acordado (DEC-0016):** cargas intensivas de CPU/GPU tras 15 minutos de inactividad de usuario y pausa controlada al detectar su regreso. La implementación deberá probar suspensión y reanudación sin capturar teclas o contenidos del usuario; queda abierta la definición técnica exacta.

## 6. Aislamiento propuesto

- Agente `investigador` separado del agente personal principal.
- Ejecución de código externo en entorno con permisos limitados por defecto.
- Restricción explícita de acceso a documentos personales, sesiones, credenciales y configuración global.
- Secretos fuera del repo y fuera de prompts; token de mínimo privilegio por repositorio.
- PRs y ramas de trabajo antes de la publicación estable.
- No permitir auto-modificación irreversible del agente coordinador sin checkpoint y mecanismo de reversión.

**Nota importante:** el aislamiento de herramientas no protege automáticamente todos los canales de comunicación entre agentes; revisar permisos de sesiones/agente-a-agente.

## 7. Instalación manual, asistida y automática (PROPUESTA)

El paquete futuro deberá proporcionar **equivalencia funcional**:
1. **Manual:** instrucciones con pasos verificables, priorizando UI de la app de escritorio cuando exista; terminal solo para operaciones técnicamente necesarias, con alternativa documentada.
2. **Agente instalador:** Codex, OpenClaw u otro sistema sigue el manifiesto y reporta exactamente qué modificó, sin inventar reglas.
3. **Automatizada:** instalador idempotente, reversible cuando sea posible, sin datos sensibles incorporados y con preflight y rollback.

Cada modo termina con la **misma** batería de tests y un reporte de conformidad. Si una funcionalidad no puede instalarse desde UI, la guía debe decirlo en vez de fingirlo.

## 8. Contrato preliminar de verificación de instalación

- Versión exacta OpenClaw y compatibilidad.
- Identidad/modelo/Workspace correspondiente al agente investigador.
- Permisos probados positivamente y **denegaciones** verificadas, no solo declaradas.
- Lectura y escritura de archivos controlados sin acceso al resto del host.
- Conectividad a fuentes y GitHub con credenciales protegidas.
- Prueba de retomada tras cierre de sesión/reinicio.
- Confirmación de que el asistente principal no fue alterado.
- Consumo de recursos dentro del presupuesto.

## 9. Cuestiones ABIERTAS

- Versión concreta de OpenClaw, sistema de instalación, forma de ejecutar en Windows, y eventual recurso remoto.
- Modelo(s) y ruta de fallback; disponibilidad y cuotas gratuitas reales, con garantía de no incurrir en gastos sin presupuesto aprobado (DEC-0011).
- Dónde persistir la base de datos estructurada y artefactos pesados.
- Qué herramientas/skills deben existir obligatoriamente frente a opcionales.
- Implementar elección de visibilidad por proyecto con preferencia por público (DEC-0014); definir separación de datos públicos/privados y permisos de Actions.
- Licencias de referencias reutilizadas; límites de CPU/RAM/GPU, detector de inactividad de 15 minutos y suspensión segura (DEC-0016).
- Responsable del paso final de instalación y permisos. La publicación estable exige aprobación del usuario aun si el agente declara la meta cumplida (DEC-0019).