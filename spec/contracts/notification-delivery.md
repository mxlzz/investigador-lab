# Contrato preliminar — Informes diarios y entrega a Telegram

**Estado:** diseño propuesto. Acordado: informe consolidado 20:00 Argentina (DEC-0020), Telegram + vista OpenClaw (DEC-0018), reintentar tan pronto como sea posible evitando duplicados (DEC-0027). No implementado.

## Identidad del informe (PROPUESTA)

Un informe consolidado se identifica por `report_key = (recipient_scope, local_report_date, report_kind)`, con `local_report_date` calculada en `America/Argentina/Buenos_Aires`. Mantener un `report_revision` inmutable, digest del contenido y `source_snapshot_id`, para que dos ejecutores no redacten informes distintos del mismo intervalo sin coordinación.

**Invariante propuesto:** el informe consultable en OpenClaw y el enviado por Telegram referencian el mismo `report_id` y snapshot, aunque puedan tener distinta representación visual.

## Buzón de salida persistente (PROPUESTA)

- `prepared`: contenido, fecha y snapshot durables.
- `pending`: reservado para envío, sin confirmación de entrega.
- `sending`: intento registrado antes de llamar a Telegram, con lease para impedir que dos trabajadores envíen simultáneamente.
- `delivered`: respuesta exitosa y `message_id` de Telegram registrados.
- `retryable_error`: rechazo claramente recuperable; respetar `retry_after` si existe.
- `unknown_delivery`: timeout o caída **después de emitir solicitud pero antes de saber si Telegram la aceptó**.
- `blocked`: falta credencial, permiso o configuración del destino; requiere intervención.
- `superseded`: un informe corregido, con relación explícita al anterior.

La clave del día evita la **duplicación interna de trabajos**, pero no soluciona por sí sola el caso `unknown_delivery`.

## Límite técnico real

La documentación de Telegram Bot API para `sendMessage` devuelve un objeto `Message` al éxito, pero **no documenta un parámetro de idempotencia de envío**. https://core.telegram.org/bots/api#sendmessage

Por tanto, si Telegram recibió un mensaje y la red se interrumpe antes de que nuestro sistema reciba el acuse, un reintento de `sendMessage` podría producir **un segundo mensaje**. El diseño puede prevenir duplicaciones de jobs y reintentos conocidos, pero **no puede garantizar matemáticamente entrega exactamente una vez** sin una vía fiable de reconciliación.

Esto constituye una **decisión pendiente explícita**, no algo que Codex pueda «resolver» inventando un token en la API.

## Estrategias a comparar (PROPUESTAS, NO APROBADAS)

**A — Priorizar entrega:** ante estado `unknown_delivery`, reintentar tras intervalo, con encabezado/ID de informe visible para reconocer posibles duplicados. Puede duplicar mensajes en la contingencia descrita, pero es consistente con «entregar cuanto antes».

**B — Priorizar cero duplicados:** ante estado `unknown_delivery`, no reintentar automáticamente hasta reconciliar externamente o recibir intervención; puede retrasar o impedir la entrega.

**C — Mensaje persistente por día con edición:** crear o conservar el identificador de un mensaje y utilizar `editMessageText` para actualizaciones. Mitiga algunos duplicados si el `message_id` está confirmado, pero **no** elimina la primera ambigüedad si se perdió el acuse de creación y no se dispone de lectura verificable del historial.

## Reportes retrasados

Si el informe del día D no fue entregado y ya se produjo el informe del día D+1, la política de inclusión de D en D+1 **no fue acordada**. Propuestas: enviar ambos con fecha explícita; o entregar uno acumulado preservando ambos expedientes en OpenClaw. No suprimir silenciosamente un día.

La hora objetivo de las 20:00 no garantiza disparo puntual si depende de GitHub Actions `schedule`, cuyos jobs programados pueden retrasarse u omitirse: https://docs.github.com/en/actions/how-tos/troubleshoot-workflows

## Pruebas de aceptación por desarrollar

- N01: dos workers compiten por el mismo reporte: solo uno obtiene lease de envío.
- N02: fallo HTTP 429 con `retry_after`: aplica espera y preserva estado.
- N03: acuse exitoso: se guarda `message_id`, no se reenvía.
- N04: caída entre envío y recepción de acuse: clasifica `unknown_delivery`, aplica la política aprobada.
- N05: no hay actividad en el día: se envía informe veraz con progreso cero o se documenta motivo de no envío según política futura.
- N06: PC apagada al programar informe: el disparador remoto apto procesa el snapshot de acceso permitido.
- N07: informe anterior pendiente y día nuevo: orden de entrega sin pérdida de información.
- N08: falta permiso para enviar: no filtra el contenido a otro destino.

## Pendientes que requieren decisión

- Estrategia de entrega cuando no puede conocerse si el envío anterior llegó.
- Intervalos, máximo de intentos y vencimiento; comportamiento ante fallo prolongado.
- Informes consecutivos atrasados; qué conservar como historial.
- Alcance del destino Telegram y reglas de redacción de información no pública.