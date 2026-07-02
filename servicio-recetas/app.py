import os, time
import psycopg2
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Servicio Recetas", version="1.0.0")
Instrumentator().instrument(app).expose(app)

def conn():
    for _ in range(20):
        try:
            return psycopg2.connect(host=os.getenv("DB_HOST"), dbname=os.getenv("DB_NAME"), user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"))
        except Exception:
            time.sleep(2)
    raise RuntimeError("No se pudo conectar a PostgreSQL recetas")

@app.get("/health")
def health(): return {"service":"recetas", "status":"UP"}

@app.get("/recetas")
def listar_recetas(ingrediente: str | None = None):
    with conn() as c, c.cursor() as cur:
        if ingrediente:
            cur.execute("""SELECT DISTINCT r.id,r.nombre,r.descripcion,r.tiempo,r.dificultad,r.costo_estimado
                           FROM recetas r JOIN receta_ingredientes i ON r.id=i.receta_id
                           WHERE lower(i.ingrediente)=lower(%s) ORDER BY r.id""", (ingrediente,))
        else:
            cur.execute("SELECT id,nombre,descripcion,tiempo,dificultad,costo_estimado FROM recetas ORDER BY id")
        recetas=[]
        for r in cur.fetchall():
            cur.execute("SELECT ingrediente,cantidad,unidad,obligatorio FROM receta_ingredientes WHERE receta_id=%s", (r[0],))
            ingredientes=[{"ingrediente":x[0],"cantidad":float(x[1]),"unidad":x[2],"obligatorio":x[3]} for x in cur.fetchall()]
            recetas.append({"id":r[0],"nombre":r[1],"descripcion":r[2],"tiempo":r[3],"dificultad":r[4],"costo_estimado":float(r[5]),"ingredientes":ingredientes})
        return recetas

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
