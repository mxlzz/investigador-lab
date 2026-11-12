# Informes de progreso por Telegram — requisitos de diseño

**Estado:** requisito funcional acordado (DEC-0018, DEC-0020, DEC-0027); mecanismo de implementación pendiente. No se configura Telegram ahora.

- **Un informe consolidado diario** a las 20:00, hora de Buenos Aires, con resumen verificable de todos los proyectos.
- **Consulta histórica** del mismo informe desde OpenClaw.
- **Si falla el envío por un problema de conectividad**, conservar el informe y **entregarlo al restablecerse el servicio**; automatizar los reintentos y evitar mensajes repetidos en circunstancias normales.
- **Alertas extraordinarias**, aparte del informe, solo por autorizaciones, fallos graves o descubrimientos excepcionalmente relevantes (DEC-0021).

## Responsabilidad técnica del implementador

Preparar una cola persistente y un identificador por informe/fecha, reintentar cuando haya disponibilidad y conservar la confirmación de envío cuando exista. Si el destinatario está desconectado **después de que Telegram haya aceptado el mensaje**, su entrega posterior la gestiona Telegram. Si el bot no llegó a enviarlo, debe reintentar su sistema.

Un envío en tránsito puede tener resultado incierto ante ciertas interrupciones; **no se transforma esa contingencia marginal en una pregunta funcional para el usuario**. Se trata como detalle técnico, se documenta y se prueban las recuperaciones usuales.

## Aceptación

- El informe queda persistido aunque la conexión falle.
- Se envía tras restablecerse la conexión sin intervención del usuario.
- Un trabajo reiniciado no crea por rutina dos informes del mismo día.
- Telegram y la vista de OpenClaw muestran el mismo informe.
- No se exponen secretos ni información de proyectos no habilitada para ese canal.

**Prioridad:** el funcionamiento correcto del ciclo de investigación es principal. El envío de reportes es una integración complementaria, no una línea independiente de investigación.
