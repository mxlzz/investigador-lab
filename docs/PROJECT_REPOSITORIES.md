# Un repositorio por investigación

## Comportamiento instalado

El investigador crea automáticamente un repositorio privado por encargo nuevo. El repositorio del agente conserva su código; los repositorios fuente, como un proyecto existente, se consultan sin modificarlos. También se puede elegir un repositorio de resultados existente de la cuenta configurada.

El nombre automático es `investigacion-<project>-<hash>`. Se guarda una intención durable antes de llamar a GitHub. La descripción contiene un identificador de vinculación: si se pierde una respuesta, se recupera el mismo repo; no se adopta un repo ajeno que tenga el mismo nombre. Las operaciones se serializan por proyecto.

Los avances se guardan en una rama `investigador-...`, dentro de `.investigador/projects/<project>/`. Se conservan los archivos y la rama predeterminada existentes. La actualización es fast-forward, sin force push. El agente devuelve el enlace a la rama con los resultados; la portada de la rama principal no se modifica para mostrar esos resultados.

Se exportan el encargo, fases aceptadas, hipótesis, referencias y resultados experimentales ya verificados. Los textos completos de las fuentes permanecen en el expediente local. El destino se vuelve a comprobar antes de cada sync: una investigación privada no se publica en un repo público. Las posibles credenciales bloquean la exportación. No se guardan tokens en GitHub.

## Uso desde OpenClaw

Un pedido natural como «investigá este tema y guardá los avances en GitHub» debe llevar a:

```json
{"operation":"research_start","project":"mi-tema","request":"Pedido literal del usuario"}
```

La visibilidad es privada por defecto y el planificador existente queda activo. El agente puede hacer intake en ese turno y continuar por pasos. La sincronización se realiza al aceptar fases y después de los ciclos programados. Si GitHub falla, el expediente local se conserva y la respuesta muestra el bloqueo; no se simula una sincronización.

Para estudiar un repo existente, separado del destino de resultados:

```json
{"operation":"research_start","project":"estudio-origen","request":"Analizar el proyecto fuente según el encargo del usuario","sources":["mi-cuenta/proyecto-fuente"]}
```

`mi-cuenta/proyecto-fuente` es solo un ejemplo: primero descubrir el nombre real si no se conoce.

```json
{"operation":"github_repositories","query":"proyecto","page":1}
{"operation":"github_read","project":"estudio-origen","repository":"mi-cuenta/proyecto-fuente"}
{"operation":"github_read","project":"estudio-origen","repository":"mi-cuenta/proyecto-fuente","file":"README.md"}
```

La primera lectura lista el árbol; la segunda recupera texto real con commit fijo, lo registra como fuente y devuelve su ID. Un árbol truncado o una lista de archivos no equivale a haber leído el repositorio completo. Se siguen `next_page` de la lista de repositorios y las limitaciones de tamaño de los archivos.

Para un destino creado manualmente, añadir `repository:"mxlzz/mi-destino"` al inicio, o usar `project_repository` sobre un proyecto todavía no vinculado. Un destino existente debe tener una rama inicial (por ejemplo, un README). Un proyecto ya vinculado no se cambia de repositorio silenciosamente.

```json
{"operation":"project_repository","project":"mi-tema","repository":"mxlzz/mi-destino"}
{"operation":"github_sync","project":"mi-tema"}
{"operation":"project_github_status","project":"mi-tema"}
```

`init` permanece disponible para uso local y no crea repos por sí solo. Los proyectos históricos no se publican automáticamente: deben iniciarse/vincularse expresamente. El proyecto técnico de aceptación queda pausado para no consumir ciclos.

## Permisos del token

Se mantiene fine-grained. Para crear y usar repositorios futuros sin intervención por cada investigación:

- Resource owner: la cuenta configurada, actualmente `mxlzz`.
- Repository access: **All repositories**, que incluye los actuales y futuros de esa cuenta.
- Repository permissions: **Repository creation → Read and write** y **Contents → Read and write**. GitHub también admite **Administration → Read and write** como alternativa más amplia al permiso de creación.
- **Actions → Read and write** para el runner experimental central; no es necesario para una revisión documental.

El operador modifica estos permisos en GitHub. No hace falta regenerar el token si solo cambia sus permisos. Si prefiere acceso a repos seleccionados, puede crear cada destino manualmente, añadirlo al token y pasarlo al motor; esa vía también está implementada. El motor limita sus escrituras a la rama y carpeta del proyecto aunque el token cubra más repositorios.

Referencias oficiales: [creación de repositorios](https://docs.github.com/en/rest/repos/repos#create-a-repository-for-the-authenticated-user), [escritura de árboles Git](https://docs.github.com/en/rest/git/trees#create-a-tree), [alcance actual y futuro](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli#authenticating-with-environment-variables).

## Experimentos y límites

Los repositorios privados son destinos documentales, no runners. Los experimentos públicos siguen usando el repositorio configurado en `INVESTIGADOR_GITHUB_REPO`, con sus controles de privacidad, commit, manifiesto y artefacto. Esta implementación no instala workflows ni ejecuta código automáticamente en los repositorios nuevos, y no depende de la shell genérica `gh` del paquete MSIX.

No se habilitan Telegram, auditor independiente, ejecución con PC apagada ni gasto adicional. Las pruebas de integración de repositorios no son evidencia científica.

## Aceptación real en Windows

El agente instalado completó el circuito: expediente técnico privado → creación automática en GitHub → lectura real de una fuente → commit del avance en la rama de proyecto → segunda sincronización `unchanged`. Una comprobación independiente descargó `progress.json` usando el commit registrado y lo comparó exactamente con el snapshot local; también verificó la privacidad y el ref remoto. La fixture quedó pausada. Las 67 pruebas locales y la CI del commit de código e94952b aprobaron. Evidencia sanitizada: `PROJECT_REPOSITORIES_ACCEPTANCE.json`. El 403 inicial se resolvió guardando Contents y Repository creation con lectura/escritura; no fue necesario cambiar el valor del token.
