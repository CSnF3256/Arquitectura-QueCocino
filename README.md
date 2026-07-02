# QueCocino - Implementación académica

Ecosistema mínimo funcional para cumplir arquitectura con microservicios, bases de datos Docker, RabbitMQ, Redis, API Gateway REST + Swagger y Lambda/server function simulada.

## Arquitectura implementada

- `api-gateway`: entrada única REST y documentación Swagger en `http://localhost:8000/docs`.
- `servicio-usuario`: perfil, preferencias y despensa. Usa `postgres-usuarios`.
- `servicio-recetas`: catálogo de recetas semilla. Usa `postgres-recetas`.
- `servicio-menu`: solicita recomendación diaria, usa Redis y publica evento en RabbitMQ.
- `lambda-recomendador`: función serverless simulada. Consume evento RabbitMQ y ejecuta `lambda_handler`.
- `servicio-notificaciones`: consume recomendación generada y registra notificación en consola/memoria.
- `as2-adapter`: integración B2B académica. Recibe `POST /as2/inbound`, genera MDN simulado, guarda auditoría en `postgres-integracion` y publica `catalog.updated` en RabbitMQ.
- Datos: PostgreSQL usuarios, PostgreSQL recetas, PostgreSQL integración simulada, Redis y RabbitMQ, todos en Docker.

## Requisitos

- Docker Desktop abierto.
- Docker Compose v2.

## Ejecutar

```bash
cd quecocino-ecosistema
cd infra
docker compose up --build
```

Espera 30 a 60 segundos hasta que todos los servicios arranquen.

## URLs importantes

- API Gateway + Swagger: http://localhost:8000/docs
- Health general: http://localhost:8000/health
- RabbitMQ Management: http://localhost:15672  usuario: `guest`, clave: `guest`
- Prometheus: http://localhost:9090
- Frontend gourmet responsive: http://localhost:3000
- SwaggerHub publicado: https://app.swaggerhub.com/apis/personal-09e/quecocino-api/1.0.0

## Prueba funcional rápida

1. Crear usuario:

```bash
curl -X POST http://localhost:8000/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@demo.com","tipo_dieta":"normal","alergias":"","tiempo_disponible":30,"presupuesto":5}'
```

2. Agregar ingredientes:

```bash
curl -X POST http://localhost:8000/despensa/items \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":1,"nombre":"arroz","cantidad":1,"unidad":"kg","fecha_vencimiento":"2026-07-01"}'

curl -X POST http://localhost:8000/despensa/items \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":1,"nombre":"pollo","cantidad":1,"unidad":"kg","fecha_vencimiento":"2026-07-01"}'
```

3. Consultar recetas:

```bash
curl http://localhost:8000/recetas
```

4. Solicitar recomendación:

```bash
curl -X POST http://localhost:8000/menu/recomendacion \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":1}'
```

5. Consultar notificaciones generadas:

```bash
curl http://localhost:8000/notificaciones
```



## Interfaz web responsive

La solución incluye una interfaz web/mobile-first en el contenedor `frontend`. Después de levantar Docker Compose, abre:

- Frontend: http://localhost:3000
- API Gateway / Swagger: http://localhost:8000/docs
- RabbitMQ Management: http://localhost:15672 con usuario `guest` y clave `guest`

Flujo recomendado para la captura:
1. Abrir `http://localhost:3000`.
2. Presionar **Crear demo rápido**.
3. Verificar que se crea usuario, despensa, recomendación y notificación.
4. Tomar captura de la app responsive y de RabbitMQ con las colas.

## Documentación OpenAPI para SwaggerHub

El contrato oficial para publicación en SwaggerHub está en:

```text
docs/openapi.yaml
```

Pasos para publicarlo:

1. Entrar a `https://app.swaggerhub.com`.
2. Crear una API nueva con la opción **Import and Document API**.
3. Subir el archivo `docs/openapi.yaml`.
4. Usar nombre `quecocino-api` y versión `1.0.0`.
5. Copiar la URL pública de SwaggerHub y reemplazar este marcador:

```text
URL SwaggerHub: https://app.swaggerhub.com/apis/personal-09e/quecocino-api/1.0.0
```

También se mantiene Swagger local generado por el API Gateway en:

```text
http://localhost:8000/docs
```

## Nota sobre Lambda simulada vs despliegue real

En el entorno local académico, la función `lambda-recomendador` se ejecuta como contenedor Docker y consume eventos desde RabbitMQ. Esto permite demostrar el patrón serverless sin usar servicios pagos. La función real está separada en `lambda-recomendador/handler.py` mediante `lambda_handler(event, context)`, por lo que puede migrarse a AWS Lambda.

Para un despliegue AWS objetivo, RabbitMQ se reemplazaría por SQS y la función se activaría por eventos de cola. El archivo `lambda-recomendador/serverless.yml` sirve como base para ese despliegue.


## Prueba del AS2 Adapter

```bash
curl -X POST http://localhost:8000/as2/inbound   -H "Content-Type: application/json"   -H "AS2-From: SUP-001"   -H "AS2-To: QUECOCINO"   -H "Message-ID: SUP-001-DEMO-001"   -d '{"supplierId":"SUP-001","messageType":"CATALOG_UPDATE","items":[{"externalProductCode":"ARZ-LG-001","canonicalIngredient":"arroz","category":"cereal","unit":"kg","price":1.25,"stock":500,"validFrom":"2026-06-24","validTo":"2026-07-30"}]}'
```

Consultar catálogo canónico:

```bash
curl http://localhost:8000/catalog/canonical
```


URL de monitoreo local:

```text
http://localhost:9090
```

