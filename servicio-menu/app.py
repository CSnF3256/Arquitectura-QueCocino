import os, json, time, uuid
import requests, pika, redis
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel

app = FastAPI(title="Servicio Menu", version="1.0.0")
Instrumentator().instrument(app).expose(app)

class SolicitudRecomendacion(BaseModel):
    usuario_id: int

def rabbit_channel():
    host=os.getenv("RABBITMQ_HOST", "rabbitmq")
    for _ in range(30):
        try:
            con=pika.BlockingConnection(pika.ConnectionParameters(host=host))
            ch=con.channel()
            ch.queue_declare(queue="recommendation.requested", durable=True)
            ch.queue_declare(queue="recommendation.generated", durable=True)
            return con, ch
        except Exception:
            time.sleep(2)
    raise RuntimeError("RabbitMQ no disponible")

redis_client = redis.Redis(host=os.getenv("REDIS_HOST","redis"), port=6379, decode_responses=True)

@app.get("/health")
def health(): return {"service":"menu", "status":"UP"}

@app.post("/menu/recomendacion")
def solicitar_recomendacion(req: SolicitudRecomendacion):
    usuario = requests.get(f"{os.getenv('USUARIO_URL')}/usuarios/{req.usuario_id}", timeout=5).json()
    despensa = requests.get(f"{os.getenv('USUARIO_URL')}/despensa/usuarios/{req.usuario_id}", timeout=5).json()
    recetas = requests.get(f"{os.getenv('RECETAS_URL')}/recetas", timeout=5).json()
    request_id = str(uuid.uuid4())
    payload = {"request_id": request_id, "usuario": usuario, "despensa": despensa, "recetas": recetas}
    redis_client.setex(f"recommendation:{request_id}", 3600, json.dumps({"estado":"PENDIENTE", **payload}))
    con, ch = rabbit_channel()
    ch.basic_publish(exchange="", routing_key="recommendation.requested", body=json.dumps(payload), properties=pika.BasicProperties(delivery_mode=2))
    con.close()
    return {"request_id": request_id, "estado":"PENDIENTE", "mensaje":"Solicitud publicada en RabbitMQ"}

@app.get("/recomendaciones/{request_id}")
def obtener_recomendacion(request_id: str):
    raw = redis_client.get(f"recommendation:{request_id}")
    if not raw:
        return {"request_id": request_id, "estado":"NO_ENCONTRADO"}
    return json.loads(raw)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
