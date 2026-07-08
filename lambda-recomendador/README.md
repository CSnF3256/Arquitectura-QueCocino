# Lambda recomendador QueCocino

Este modulo ejecuta la recomendacion como una funcion serverless local usando la imagen oficial de AWS Lambda para Python:

```text
public.ecr.aws/lambda/python:3.12
```

La funcion real esta en `handler.py` y se expone con el runtime Lambda en:

```text
POST /2015-03-31/functions/function/invocations
```

En Docker Compose, `lambda-recomendador` representa la funcion Lambda. El contenedor `lambda-event-source` actua como event source mapping local: consume mensajes desde RabbitMQ (`recommendation.requested`), invoca la Lambda por el endpoint del runtime y publica el resultado en `recommendation.generated`.

Esto conserva el flujo local del ecosistema sin usar AWS real, pero evita ejecutar el `lambda_handler` como un microservicio permanente importado directamente.
