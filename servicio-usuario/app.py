import os, time, json
import psycopg2
import redis
from fastapi import FastAPI, HTTPException
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel

app = FastAPI(title="Servicio Usuario y Despensa", version="1.1.0")
Instrumentator().instrument(app).expose(app)

class Usuario(BaseModel):
    nombre: str
    email: str
    tipo_dieta: str = "normal"
    alergias: str = ""
    tiempo_disponible: int = 30
    presupuesto: float = 5.0

class ItemDespensa(BaseModel):
    usuario_id: int
    nombre: str
    cantidad: float = 1
    unidad: str = "unidad"
    fecha_vencimiento: str | None = None

def conn():
    for _ in range(20):
        try:
            return psycopg2.connect(
                host=os.getenv("DB_HOST"), dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"))
        except Exception:
            time.sleep(2)
    raise RuntimeError("No se pudo conectar a PostgreSQL usuarios")

def redis_conn():
    try:
        r = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, decode_responses=True)
        r.ping()
        return r
    except Exception:
        return None

def cache_get(key: str):
    r = redis_conn()
    if not r:
        return None
    raw = r.get(key)
    return json.loads(raw) if raw else None

def cache_set(key: str, value, ttl: int):
    r = redis_conn()
    if r:
        r.setex(key, ttl, json.dumps(value, default=str))

def cache_delete(*keys: str):
    r = redis_conn()
    if r and keys:
        r.delete(*keys)

@app.get("/health")
def health():
    return {"service":"usuario", "status":"UP", "cache":"redis cache-aside habilitado"}


@app.get("/usuarios")
def listar_usuarios():
    with conn() as c, c.cursor() as cur:
        cur.execute("""SELECT id,nombre,email,tipo_dieta,alergias,tiempo_disponible,presupuesto
                       FROM usuarios ORDER BY id""")
        keys=["id","nombre","email","tipo_dieta","alergias","tiempo_disponible","presupuesto"]
        return [dict(zip(keys,row)) for row in cur.fetchall()]

@app.post("/usuarios")
def crear_usuario(u: Usuario):
    with conn() as c, c.cursor() as cur:
        cur.execute("""INSERT INTO usuarios(nombre,email,tipo_dieta,alergias,tiempo_disponible,presupuesto)
            VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""", (u.nombre,u.email,u.tipo_dieta,u.alergias,u.tiempo_disponible,u.presupuesto))
        new_id = cur.fetchone()[0]
        result = {"id": new_id, **u.model_dump()}
        cache_set(f"user:{new_id}:profile", result, 1800)
        return result

@app.get("/usuarios/{usuario_id}")
def obtener_usuario(usuario_id:int):
    key=f"user:{usuario_id}:profile"
    cached = cache_get(key)
    if cached:
        cached["cache"] = "HIT"
        return cached
    with conn() as c, c.cursor() as cur:
        cur.execute("SELECT id,nombre,email,tipo_dieta,alergias,tiempo_disponible,presupuesto FROM usuarios WHERE id=%s", (usuario_id,))
        row = cur.fetchone()
        if not row: raise HTTPException(404, "Usuario no existe")
        keys=["id","nombre","email","tipo_dieta","alergias","tiempo_disponible","presupuesto"]
        result = dict(zip(keys,row))
        cache_set(key, result, 1800)
        result["cache"] = "MISS"
        return result

@app.put("/usuarios/{usuario_id}/preferencias")
def actualizar_preferencias(usuario_id:int, u: Usuario):
    with conn() as c, c.cursor() as cur:
        cur.execute("""UPDATE usuarios SET nombre=%s,email=%s,tipo_dieta=%s,alergias=%s,tiempo_disponible=%s,presupuesto=%s
            WHERE id=%s""", (u.nombre,u.email,u.tipo_dieta,u.alergias,u.tiempo_disponible,u.presupuesto,usuario_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "Usuario no existe")
    cache_delete(f"user:{usuario_id}:profile", f"user:{usuario_id}:pantry")
    return {"estado":"preferencias actualizadas", "usuario_id": usuario_id, "cache":"INVALIDATED"}

@app.post("/despensa/items")
def agregar_item(item: ItemDespensa):
    fecha_vencimiento = item.fecha_vencimiento or None
    with conn() as c, c.cursor() as cur:
        cur.execute("""INSERT INTO despensa(usuario_id,nombre,cantidad,unidad,fecha_vencimiento)
            VALUES (%s,%s,%s,%s,%s) RETURNING id""", (item.usuario_id,item.nombre.lower(),item.cantidad,item.unidad,fecha_vencimiento))
        item_id = cur.fetchone()[0]
    cache_delete(f"user:{item.usuario_id}:pantry")
    return {"id": item_id, **item.model_dump(), "fecha_vencimiento": fecha_vencimiento, "cache":"PANTRY_INVALIDATED"}

@app.get("/despensa/usuarios/{usuario_id}")
def listar_despensa(usuario_id:int):
    key=f"user:{usuario_id}:pantry"
    cached = cache_get(key)
    if cached is not None:
        return {"cache":"HIT", "items":cached}
    with conn() as c, c.cursor() as cur:
        cur.execute("SELECT id,nombre,cantidad,unidad,fecha_vencimiento FROM despensa WHERE usuario_id=%s ORDER BY id", (usuario_id,))
        items = [{"id":r[0],"nombre":r[1],"cantidad":float(r[2]),"unidad":r[3],"fecha_vencimiento":str(r[4]) if r[4] else None} for r in cur.fetchall()]
        cache_set(key, items, 600)
        return {"cache":"MISS", "items":items}

@app.delete("/despensa/items/{item_id}")
def eliminar_item(item_id:int):
    with conn() as c, c.cursor() as cur:
        cur.execute("DELETE FROM despensa WHERE id=%s RETURNING usuario_id,nombre", (item_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Ingrediente no existe")
    cache_delete(f"user:{row[0]}:pantry")
    return {"estado":"ingrediente eliminado", "id": item_id, "usuario_id": row[0], "nombre": row[1], "cache":"PANTRY_INVALIDATED"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
