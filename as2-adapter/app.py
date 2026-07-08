import os, time, hashlib, json
import psycopg2
import pika
from fastapi import FastAPI, Header, HTTPException, Request
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel, Field

app = FastAPI(
    title="AS2 Adapter QueCocino",
    version="1.0.0",
    description="Adaptador académico que simula recepción AS2: valida proveedor, genera MDN, guarda auditoría y publica eventos en RabbitMQ."
)
Instrumentator().instrument(app).expose(app)

class CatalogItem(BaseModel):
    externalProductCode: str
    canonicalIngredient: str
    category: str = "general"
    unit: str = "unidad"
    price: float = 0
    stock: float = 0
    validFrom: str | None = None
    validTo: str | None = None

class AS2CatalogMessage(BaseModel):
    supplierId: str = Field(default="SUP-001")
    messageType: str = Field(default="CATALOG_UPDATE")
    items: list[CatalogItem]

def conn():
    for _ in range(20):
        try:
            return psycopg2.connect(
                host=os.getenv("DB_HOST"), dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"))
        except Exception:
            time.sleep(2)
    raise RuntimeError("No se pudo conectar a PostgreSQL integración")

def publish(event_type: str, payload: dict):
    host=os.getenv("RABBITMQ_HOST", "rabbitmq")
    for _ in range(20):
        try:
            connection=pika.BlockingConnection(pika.ConnectionParameters(host=host))
            channel=connection.channel()
            channel.queue_declare(queue="catalog.updated", durable=True)
            channel.queue_declare(queue="catalog.failed", durable=True)
            channel.basic_publish(
                exchange="",
                routing_key="catalog.updated" if event_type == "catalog.updated" else "catalog.failed",
                body=json.dumps(payload, ensure_ascii=False),
                properties=pika.BasicProperties(delivery_mode=2, content_type="application/json")
            )
            connection.close()
            return True
        except Exception:
            time.sleep(2)
    return False

@app.get("/health")
def health():
    return {"service":"as2-adapter", "status":"UP", "mode":"AS2 simulado académico"}

@app.post("/as2/inbound", status_code=202)
async def receive_as2(
    msg: AS2CatalogMessage,
    request: Request,
    as2_from: str = Header(default="SUP-001", alias="AS2-From"),
    as2_to: str = Header(default="QUECOCINO", alias="AS2-To"),
    message_id: str | None = Header(default=None, alias="Message-ID"),
):
    message_id = message_id or f"{as2_from}-{int(time.time())}"
    payload = msg.model_dump()
    checksum = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    with conn() as c, c.cursor() as cur:
        cur.execute("SELECT id FROM proveedor WHERE as2_id=%s AND activo=true", (as2_from,))
        provider = cur.fetchone()
        if not provider:
            raise HTTPException(401, "Proveedor AS2 no autorizado")
        proveedor_id = provider[0]
        cur.execute("""INSERT INTO mensaje_as2(proveedor_id,message_id,checksum,estado,mdn_status)
                       VALUES (%s,%s,%s,%s,%s)
                       ON CONFLICT(message_id) DO UPDATE SET estado='DUPLICADO', mdn_status='DUPLICATE'
                       RETURNING id""", (proveedor_id,message_id,checksum,"RECIBIDO","ACCEPTED"))
        db_message_id = cur.fetchone()[0]
        for item in msg.items:
            cur.execute("""INSERT INTO catalogo_vigente(supplier_id,external_product_code,canonical_ingredient,category,unit,price,stock,valid_from,valid_to)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                           ON CONFLICT(supplier_id, external_product_code)
                           DO UPDATE SET canonical_ingredient=EXCLUDED.canonical_ingredient,
                                         category=EXCLUDED.category,
                                         unit=EXCLUDED.unit,
                                         price=EXCLUDED.price,
                                         stock=EXCLUDED.stock,
                                         valid_from=EXCLUDED.valid_from,
                                         valid_to=EXCLUDED.valid_to""",
                        (msg.supplierId,item.externalProductCode,item.canonicalIngredient.lower(),item.category,item.unit,item.price,item.stock,item.validFrom,item.validTo))
        cur.execute("UPDATE mensaje_as2 SET estado='PROCESADO', mdn_status='PROCESSED' WHERE id=%s", (db_message_id,))
    publish("catalog.updated", {"event":"CatalogoProveedorActualizado", "supplierId":msg.supplierId, "messageId":message_id, "items":len(msg.items)})
    return {"mdn":"PROCESSED", "as2From":as2_from, "as2To":as2_to, "messageId":message_id, "checksum":checksum, "items":len(msg.items)}

@app.get("/as2/messages/{message_id}")
def message_status(message_id: str):
    with conn() as c, c.cursor() as cur:
        cur.execute("""SELECT m.message_id,p.as2_id,m.checksum,m.estado,m.fecha_recepcion,m.mdn_status
                       FROM mensaje_as2 m JOIN proveedor p ON p.id=m.proveedor_id
                       WHERE m.message_id=%s""", (message_id,))
        row=cur.fetchone()
        if not row:
            raise HTTPException(404, "Mensaje no encontrado")
        return {"message_id":row[0],"supplier":row[1],"checksum":row[2],"estado":row[3],"fecha_recepcion":str(row[4]),"mdn_status":row[5]}

@app.get("/catalog/canonical")
def catalog():
    with conn() as c, c.cursor() as cur:
        cur.execute("""SELECT supplier_id,external_product_code,canonical_ingredient,category,unit,price,stock,valid_from,valid_to
                       FROM catalogo_vigente ORDER BY id DESC LIMIT 100""")
        return [{"supplierId":r[0],"externalProductCode":r[1],"canonicalIngredient":r[2],"category":r[3],"unit":r[4],"price":float(r[5]),"stock":float(r[6]),"validFrom":str(r[7]) if r[7] else None,"validTo":str(r[8]) if r[8] else None} for r in cur.fetchall()]

@app.post("/suppliers")
def create_supplier(nombre: str, as2_id: str):
    with conn() as c, c.cursor() as cur:
        cur.execute("INSERT INTO proveedor(nombre,as2_id,activo) VALUES(%s,%s,true) ON CONFLICT(as2_id) DO UPDATE SET nombre=EXCLUDED.nombre, activo=true RETURNING id", (nombre, as2_id))
        return {"id":cur.fetchone()[0], "nombre":nombre, "as2_id":as2_id, "activo":True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)
