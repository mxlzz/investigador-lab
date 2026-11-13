# Encargo a Codex — instalar y comprobar Investigador 0.4.0-dev en Windows

**Única tarea:** completar el punto 2 (despliegue local del punto 1 ya probado) sin alterar otros agentes ni reinstalar OpenClaw.

1. Leer íntegramente `docs/WINDOWS_DEPLOYMENT_RUNBOOK.md` y `docs/EXPERIMENT_LIVE_ACCEPTANCE.md`.
2. Recuperar el estado real de OpenClaw MSIX/Gateway, `investigador`, MCP, scheduler y `research-state` antes de modificar rutas o configuración. Hacer backup recuperable.
3. Sincronizar la rama `implementacion/investigador-local` en un commit fijo y actualizar código, esquema, prompts y AGENTS.md correspondiente **sin sobrescribir expedientes privados**. No fusionar el PR ni hacer release para desplegar localmente.
4. Verificar Node 24, `health.version=0.4.0-dev`, herramientas MCP, tests y ausencia de automatizaciones duplicadas.
5. Conectar credencial de GitHub Actions de permisos mínimos por una vía segura y local. Nunca registrar tokens en GitHub, archivos de agente, chat o logs. Si falta autorización, detener **solo esta dependencia**, sin borrar ni modificar el funcionamiento documental existente.
6. Ejecutar desde el Gateway real la aceptación completa: plan público → dispatch → corrida en GitHub → descarga/importación verificada → evaluation → next_cycle. Documentar IDs y evidencia sanitizada.
7. Verificar que la PC no ejecutó scripts experimentales, que se preservó el historial y que otros agentes siguen funcionando.
8. Actualizar en GitHub un registro de aceptación local con pruebas, versión, ruta lógica del MCP (sin rutas privadas innecesarias), SHA desplegado, resultados y bloqueos restantes. No afirmar entrega completa sin superar estos criterios.

**Referencia ya superada:** GitHub Actions real `43350881884` controlador, `43350903439` experimento, `43350881800` pruebas automatizadas verdes. No repetir esos pasos como sustituto de la prueba sobre Windows.

**No dedicar tiempo a Telegram, notificaciones ni rediseños de interfaz.**
