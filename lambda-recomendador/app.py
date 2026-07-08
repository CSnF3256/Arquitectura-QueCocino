import json
import os
import time

import pika
import requests

LAMBDA_RUNTIME_URL = os.getenv(
    "LAMBDA_RUNTIME_URL",
    "http://lambda-recomendador:8080/2015-03-31/functions/function/invocations",
)


def connect():
    host = os.getenv("RABBITMQ_HOST", "rabbitmq")
    for _ in range(40):
        try:
            con = pika.BlockingConnection(pika.ConnectionParameters(host=host))
            ch = con.channel()
            ch.queue_declare(queue="recommendation.requested", durable=True)
            ch.queue_declare(queue="recommendation.generated", durable=True)
            return con, ch
        except Exception:
            print("Esperando RabbitMQ...")
            time.sleep(2)
    raise RuntimeError("RabbitMQ no disponible")


def invoke_lambda(event):
    for _ in range(30):
        try:
            response = requests.post(LAMBDA_RUNTIME_URL, json=event, timeout=20)
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            print("Esperando Lambda Runtime...", exc)
            time.sleep(2)
    raise RuntimeError("Lambda Runtime no disponible")


con, ch = connect()
print("Event source mapping local listo. RabbitMQ -> Lambda Runtime.")


def callback(channel, method, properties, body):
    event = json.loads(body.decode())
    result = invoke_lambda(event)
    channel.basic_publish(
        exchange="",
        routing_key="recommendation.generated",
        body=json.dumps(result, ensure_ascii=False),
        properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"),
    )
    print("Lambda invocada:", result["receta"]["nombre"], "score", result["score"])
    channel.basic_ack(delivery_tag=method.delivery_tag)


ch.basic_qos(prefetch_count=1)
ch.basic_consume(queue="recommendation.requested", on_message_callback=callback)
ch.start_consuming()
