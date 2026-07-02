import os, json, time, threading
import pika
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Servicio Notificaciones", version="1.0.0")
Instrumentator().instrument(app).expose(app)
NOTIFICACIONES=[]

def consumer():
    host=os.getenv("RABBITMQ_HOST", "rabbitmq")
    for _ in range(40):
        try:
            con=pika.BlockingConnection(pika.ConnectionParameters(host=host))
            ch=con.channel()
            ch.queue_declare(queue="recommendation.generated", durable=True)
            break
        except Exception:
            time.sleep(2)
    else:
        print("RabbitMQ no disponible para notificaciones")
        return
    def callback(channel, method, properties, body):
        data=json.loads(body.decode())
        notif={"usuario_id":data["usuario_id"], "tipo":"RECETA_DIARIA", "mensaje":data["explicacion"], "request_id":data["request_id"]}
        NOTIFICACIONES.append(notif)
        print("Notificación registrada:", notif["mensaje"])
        channel.basic_ack(delivery_tag=method.delivery_tag)
    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue="recommendation.generated", on_message_callback=callback)
    ch.start_consuming()

@app.on_event("startup")
def startup():
    threading.Thread(target=consumer, daemon=True).start()

@app.get("/health")
def health(): return {"service":"notificaciones", "status":"UP"}

@app.get("/notificaciones")
def listar(): return NOTIFICACIONES

@app.post("/notificaciones/test")
def test():
    n={"usuario_id":0,"tipo":"TEST","mensaje":"Notificación simulada"}
    NOTIFICACIONES.append(n)
    return n

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
