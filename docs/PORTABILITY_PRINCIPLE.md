# Portabilidad de la especificación

**Estado:** principio acordado; mecanismos de instalación son propuestas hasta la etapa de implementación.  
**Referencias:** DEC-0005, DEC-0008, DEC-0009.

## Qué debe entregar este proyecto

El repositorio no es un conjunto de ideas para que Codex termine de diseñar. Es el contrato que construiremos **antes** de pedir implementación: requisitos, prompts literales, estados, herramientas, permisos, esquemas, pruebas y tratamiento de fallos.

Una vez aprobado, puede ser entregado a:
- Codex para programar e integrar OpenClaw;
- un agente de OpenClaw con permisos de desarrollo limitados;
- un desarrollador humano;
- el propio usuario mediante guía de instalación.

La elección del implementador no cambia las reglas del Investigador.

## Tres productos diferentes

1. **Diseño cerrado:** lo que estamos preparando ahora. No instala nada.
2. **Implementación verificable:** software/configuración desarrollado por cualquier implementador y comprobado contra el diseño.
3. **Distribución e instalación:** guía paso a paso, instalador, upgrade, rollback, diagnósticos y soporte para varios métodos de despliegue.

No afirmar que el usuario ya puede instalar un sistema funcional mientras solo exista documentación.

## Responsabilidades

Diseñadores: definen íntegramente prompts y conducta; resuelven inconsistencias.  
Implementador: implementa lo especificado, elige detalles de ingeniería compatibles y reporta vacíos.  
Operador/usuario: autoriza accesos, costos y publicación.  
Validador: comprueba criterios independientes de la implementación.

## Pruebas de equivalencia

Cada método de instalación debe producir un sistema con la misma matriz de comportamiento: mismo contrato de entrada/salida, mismas reglas de autorización, misma estructura de procedencia, mismos resultados en casos de aceptación controlados (salvo variación modelística prevista y documentada).

## GUI vs consola

La guía priorizará la aplicación de escritorio porque es la interfaz que utiliza el usuario. No prometer exclusivamente acciones gráficas que la versión real no soporte: cada operación deberá tener una alternativa validada y marcada.

## Revisión de versiones

Un cambio de versión de OpenClaw o de proveedor de modelos puede modificar APIs, formatos o capacidades; la instalación debe fallar de forma informativa cuando se desconozca compatibilidad en vez de aplicar pasos obsoletos.