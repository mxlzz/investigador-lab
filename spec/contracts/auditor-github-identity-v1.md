# Identidad GitHub del Auditor, Investigador y usuario — propuesta v0.1

**Estado:** diseño; no crear cuentas, instalar aplicaciones ni emitir credenciales sin autorización.

## 1. Problema real

GitHub atribuye un comentario al **principal autenticado**: un usuario o una instalación de GitHub App. El texto, `@mención`, firma en prosa o etiqueta `actor:"auditor"` es información aportada por quien escribe y no autentica su origen.

Hoy OpenClaw accede a GitHub mediante una credencial administrada asociada a `mxlzz`. Si ChatGPT usa la misma cuenta, ambos comentarios aparecerían bajo la identidad `mxlzz`. Tampoco puede diferenciarse una **aprobación humana** de una acción automática de Investigador si ambas comparten el mismo principal. Es un problema especial para autorizaciones de release; un comentario «apruebo» de `mxlzz` no demuestra por sí solo intervención humana.

## 2. Alternativas y evaluación

| Opción | Cómo aparece en GitHub | Pros | Contras |
| --- | --- | --- | --- |
| Misma cuenta `mxlzz` para ambos | `mxlzz` | Cero conexiones nuevas | No acredita autoría independiente ni aprobación humana |
| Una **machine user** técnica para Auditor | nombre separado elegido | Suele ajustarse a conexión OAuth de GitHub como cuenta; interfaz clara | Hay que crearla manualmente, otorgarle acceso a cada repo privado, comprobar que ChatGPT puede seleccionar esa cuenta y sus permisos; otra credencial que mantener |
| GitHub App `Investigador Auditor` | `... [bot]` como instalación | Identidad de máquina, permisos acotados por repositorio e instalación, tokens de duración limitada | ChatGPT GitHub conectado **no necesariamente** puede actuar como esa App; puede requerir un puente autorizado separado con prueba de origen |
| Dos GitHub Apps (una por agente) y cuenta humana `mxlzz` | tres actores distinguibles | Modelo de seguridad más limpio si también hay releases | Más infraestructura y todavía hay que verificar vía de publicación desde ChatGPT |

**Recomendación para E0:** intentar primero si una cuenta de máquina del Auditor, creada manualmente, puede conectarse a ChatGPT y comentar **desde una tarea programada real**. Para implementación estable de largo plazo, preferir identidades de GitHub Apps separadas si el conector o un puente autorizado y verificable lo permiten. No prometer acceso al conector con cualquier App.

**Límite de GitHub:** la documentación admite una cuenta de máquina adicional con una cuenta personal gratuita y prohibe crear cuentas por métodos automatizados. No abrir una cuenta por proyecto ni una cuenta de máquina gratuita para cada investigación.

## 3. Tabla mínima de autoridad

| Actor | Lectura necesaria | Escritura permitida | Prohibido |
| --- | --- | --- | --- |
| Investigador (OpenClaw) | fuente de proyecto y comentarios de Issue | journal/snapshot del proyecto, comentario de respuesta | adjudicar hallazgos del Auditor, autenticarse como humano, aprobar release |
| Auditor (ChatGPT) | snapshots/evidencias autorizadas del proyecto | comentarios de auditoría y hallazgos propios | modificar código del Investigador, editar expediente canónico, publicarse una release |
| Usuario humano | revisar todos los registros autorizados | aprobación expresa e identificada de release/cambios de autoridad | ser suplantado por un bot con su token |

El problema de permisos es distinto del de identidad: **dos credenciales o tokens del mismo usuario no son dos actores GitHub separados**. Dos perfiles de autorización con el mismo `user.login` no resuelven la atribución.

## 4. Test de aceptación que debe realizar el implementador

A. Determinar qué cuentas puede elegir el conector GitHub conectado a ChatGPT y si la tarea programada permite escribir comentarios de Issue.  
B. Verificar comentario creado bajo `user.id` distinto del actor Investigador; registrar `comment_id`, `created_at` y `repo_id`.  
C. Comprobar permisos mínimos `Issues: Read and write` de cada repo privado autorizado. El permiso `Contents` previo no garantiza `Issues`.  
D. Probar que un comentario de cuenta ajena que copia el mismo JSON/markup no obtiene autoridad de Auditor.  
E. Ante ausencia de actor distinto, clasificar como `external_suggestion_unverified_actor`; no habilitar bloqueos críticos, cierres o levantamientos automáticos por atribución supuesta.  
F. En los controles futuros de publicación estable, exigir autorización humana por un canal y prueba de origen que el Investigador no pueda emitir usando su identidad GitHub actual.

## 5. Fuentes

- https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/about-authentication-with-a-github-app
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
- https://docs.github.com/en/site-policy/github-terms/github-terms-of-service

**Estrategia de contingencia:** mientras no haya identidad separada, ChatGPT puede hacer **auditoría documental** sobre GitHub y publicar propuestas manuales con su cuenta, pero el motor no debe tomar esas propuestas como una señal independiente con autoridad de cerrar/publicar/bloquear. Toda decisión final debe depender de evidencia propia o aprobación externa comprobable.
