import os, json, time
import pika
from handler import lambda_handler

def connect():
    host=os.getenv("RABBITMQ_HOST", "rabbitmq")
    for _ in range(40):
        try:
            con=pika.BlockingConnection(pika.ConnectionParameters(host=host))
            ch=con.channel()
            ch.queue_declare(queue="recommendation.requested", durable=True)
            ch.queue_declare(queue="recommendation.generated", durable=True)
            return con, ch
        except Exception:
            print("Esperando RabbitMQ...")
            time.sleep(2)
    raise RuntimeError("RabbitMQ no disponible")

con, ch = connect()
print("Lambda recomendador simulada lista. Esperando eventos...")

def callback(channel, method, properties, body):
    event=json.loads(body.decode())
    result=lambda_handler(event, None)
    channel.basic_publish(exchange="", routing_key="recommendation.generated", body=json.dumps(result), properties=pika.BasicProperties(delivery_mode=2))
    print("Recomendación generada:", result["receta"]["nombre"], "score", result["score"])
    channel.basic_ack(delivery_tag=method.delivery_tag)

ch.basic_qos(prefetch_count=1)
ch.basic_consume(queue="recommendation.requested", on_message_callback=callback)
ch.start_consuming()
