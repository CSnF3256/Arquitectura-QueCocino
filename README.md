# QueCocino - Ecosistema de cocina inteligente

QueCocino es una aplicacion academica de arquitectura de software basada en microservicios. Permite crear usuarios, registrar ingredientes en una despensa/refri digital, consultar recetas, pedir una recomendacion inteligente, recibir notificaciones y simular integracion B2B con proveedores mediante AS2.

El proyecto incluye frontend web, API Gateway, servicios de dominio, bases PostgreSQL, Redis, RabbitMQ, Prometheus y una funcion recomendadora ejecutada con runtime local de AWS Lambda.

## Requisitos

- Docker Desktop instalado y abierto.
- Docker Compose v2.
- Puertos disponibles: `3000`, `8000`, `8001`, `8002`, `8003`, `8004`, `8090`, `9090`, `15672`, `5433`, `5434`, `5435`, `6379`, `5672`.

## Levantar el proyecto

Desde la raiz del repositorio:

```powershell
docker compose -f infra\docker-compose.yml up -d --build
```

En Linux/macOS:

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

La primera vez puede tardar porque descarga imagenes de Docker, incluyendo la imagen oficial del runtime Lambda:

```text
public.ecr.aws/lambda/python:3.12
```

Verifica que los contenedores esten arriba:

```powershell
docker compose -f infra\docker-compose.yml ps
```

## Abrir la aplicacion

- Frontend: http://localhost:3000
- API Gateway health: http://localhost:8000/health
- Swagger local: http://localhost:8000/docs
- RabbitMQ Management: http://localhost:15672
  - usuario: `guest`
  - clave: `guest`
- Prometheus: http://localhost:9090

## Arquitectura implementada

- `frontend`: interfaz web de QueCocino.
- `api-gateway`: entrada REST centralizada en `http://localhost:8000`.
- `servicio-usuario`: usuarios, preferencias y despensa.
- `servicio-recetas`: catalogo de recetas.
- `servicio-menu`: solicitud de recomendacion y publicacion de eventos.
- `lambda-recomendador`: funcion serverless local con runtime AWS Lambda.
- `lambda-event-source`: mapeo local de eventos RabbitMQ -> Lambda Runtime.
- `servicio-notificaciones`: consume recomendaciones generadas.
- `as2-adapter`: integracion B2B AS2 academica.
- `postgres-usuarios`, `postgres-recetas`, `postgres-integracion`: capas de datos en Docker.
- `redis`: cache.
- `rabbitmq`: mensajeria.
- `prometheus`: monitoreo.

## Flujo recomendado de demo

1. Abre `http://localhost:3000`.
2. Entra a **Usuarios** y crea o selecciona un usuario.
3. Entra a **Mi Refri** y agrega ingredientes.
4. Revisa **Recetario**.
5. Entra a **Mi Chef** y ajusta preferencias.
6. Entra a **Recomendacion** y pide una receta.
7. Revisa **Notificaciones**.
8. Entra a **Proveedores AS2** y prueba:
   - `Enviar catalogo demo AS2`
   - `Ver catalogo canonico`
9. Entra a **Sistema** para mostrar el estado del ecosistema.

## Lambda serverless local

El recomendador esta implementado como funcion en:

```text
lambda-recomendador/handler.py
```

Docker ejecuta esa funcion con la imagen oficial de AWS Lambda:

```text
public.ecr.aws/lambda/python:3.12
```

El contenedor `lambda-recomendador` expone el runtime Lambda local en:

```text
/2015-03-31/functions/function/invocations
```

El contenedor `lambda-event-source` consume eventos de RabbitMQ desde:

```text
recommendation.requested
```

Luego invoca la Lambda por HTTP y publica el resultado en:

```text
recommendation.generated
```

Para ver los logs del runtime Lambda:

```powershell
docker compose -f infra\docker-compose.yml logs -f lambda-recomendador lambda-event-source
```

En una invocacion correcta veras lineas similares a:

```text
INIT START
INVOKE START
END
REPORT
```

El archivo `lambda-recomendador/serverless.yml` queda como referencia para un despliegue objetivo en AWS con SQS.

## Pruebas rapidas por API

### Health general

```powershell
curl http://localhost:8000/health
```

### Crear usuario

```powershell
curl -X POST http://localhost:8000/usuarios `
  -H "Content-Type: application/json" `
  -d "{\"nombre\":\"Sebastian\",\"email\":\"sebastian@demo.com\",\"tipo_dieta\":\"normal\",\"alergias\":\"\",\"tiempo_disponible\":30,\"presupuesto\":5}"
```

### Agregar ingrediente

```powershell
curl -X POST http://localhost:8000/despensa/items `
  -H "Content-Type: application/json" `
  -d "{\"usuario_id\":1,\"nombre\":\"arroz\",\"cantidad\":1,\"unidad\":\"kg\",\"fecha_vencimiento\":null}"
```

### Quitar ingrediente

```powershell
curl -X DELETE http://localhost:8000/despensa/items/1
```

### Consultar recetas

```powershell
curl http://localhost:8000/recetas
```

### Solicitar recomendacion

```powershell
curl -X POST http://localhost:8000/menu/recomendacion `
  -H "Content-Type: application/json" `
  -d "{\"usuario_id\":1}"
```

### Ver notificaciones

```powershell
curl http://localhost:8000/notificaciones
```

## Prueba AS2

Enviar catalogo demo de proveedor:

```powershell
curl -X POST http://localhost:8000/as2/inbound `
  -H "Content-Type: application/json" `
  -H "AS2-From: SUP-001" `
  -H "AS2-To: QUECOCINO" `
  -H "Message-ID: SUP-001-DEMO-001" `
  -d "{\"supplierId\":\"SUP-001\",\"messageType\":\"CATALOG_UPDATE\",\"items\":[{\"externalProductCode\":\"ARZ-LG-001\",\"canonicalIngredient\":\"arroz\",\"category\":\"cereal\",\"unit\":\"kg\",\"price\":1.25,\"stock\":500}]}"
```

Consultar catalogo canonico:

```powershell
curl http://localhost:8000/catalog/canonical
```

## Documentacion OpenAPI

Contrato local:

```text
docs/openapi.yaml
```

Swagger local:

```text
http://localhost:8000/docs
```

SwaggerHub publicado:

```text
https://app.swaggerhub.com/apis/personal-09e/quecocino-api/1.0.0
```

## Apagar el proyecto

```powershell
docker compose -f infra\docker-compose.yml down
```

Para borrar tambien los volumenes de base de datos:

```powershell
docker compose -f infra\docker-compose.yml down -v
```

Usa `down -v` solo si quieres reiniciar datos desde cero.

## Notas de datos demo

El seed de usuarios crea perfiles demo reales en PostgreSQL:

- Ana Torres
- Luis Mendez
- Camila Ruiz

Esto evita que el frontend use perfiles visuales sin respaldo en la base de datos.
