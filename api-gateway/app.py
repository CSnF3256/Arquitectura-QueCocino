import os
import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title="QueCocino API Gateway",
    version="1.1.0",
    description="Punto de entrada único REST para Usuario, Despensa, Recetas, Menú, Recomendaciones, Notificaciones e Integración AS2."
)
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "usuarios": os.getenv("USUARIO_URL"),
    "despensa": os.getenv("USUARIO_URL"),
    "recetas": os.getenv("RECETAS_URL"),
    "menu": os.getenv("MENU_URL"),
    "recomendaciones": os.getenv("MENU_URL"),
    "notificaciones": os.getenv("NOTIFICACIONES_URL"),
    "integration": os.getenv("AS2_URL"),
    "as2": os.getenv("AS2_URL"),
    "catalog": os.getenv("AS2_URL"),
}

async def proxy(service_key: str, path: str, request: Request):
    base = SERVICES[service_key]
    url = f"{base}/{path}"
    body = await request.body()
    headers = {k:v for k,v in request.headers.items() if k.lower() in ["content-type", "as2-from", "as2-to", "message-id"]}
    headers.setdefault("content-type", "application/json")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.request(request.method, url, content=body, headers=headers, params=request.query_params)
    try:
        return response.json()
    except Exception:
        return {"status_code": response.status_code, "text": response.text}

@app.get("/health")
async def health():
    result={"gateway":"UP", "services":{}}
    async with httpx.AsyncClient(timeout=5) as client:
        for k, base in SERVICES.items():
            if not base or k in result["services"]: continue
            try:
                r=await client.get(f"{base}/health")
                result["services"][k]=r.json()
            except Exception as e:
                result["services"][k]={"status":"DOWN", "error":str(e)}
    return result

@app.api_route("/usuarios", methods=["GET","POST"])
async def usuarios_root(request: Request): return await proxy("usuarios", "usuarios", request)
@app.api_route("/usuarios/{path:path}", methods=["GET","PUT","DELETE"])
async def usuarios_path(path: str, request: Request): return await proxy("usuarios", f"usuarios/{path}", request)
@app.api_route("/despensa/{path:path}", methods=["GET","POST","PUT","DELETE"])
async def despensa(path: str, request: Request): return await proxy("despensa", f"despensa/{path}", request)
@app.api_route("/recetas", methods=["GET"])
async def recetas(request: Request): return await proxy("recetas", "recetas", request)
@app.api_route("/menu/{path:path}", methods=["GET","POST"])
async def menu(path: str, request: Request): return await proxy("menu", f"menu/{path}", request)
@app.api_route("/recomendaciones/{path:path}", methods=["GET"])
async def recomendaciones(path: str, request: Request): return await proxy("recomendaciones", f"recomendaciones/{path}", request)
@app.api_route("/notificaciones", methods=["GET"])
async def notificaciones_root(request: Request): return await proxy("notificaciones", "notificaciones", request)
@app.api_route("/notificaciones/{path:path}", methods=["GET","POST"])
async def notificaciones(path: str, request: Request): return await proxy("notificaciones", f"notificaciones/{path}", request)

# Integración B2B AS2 simulada
@app.api_route("/as2/{path:path}", methods=["GET","POST"])
async def as2(path: str, request: Request): return await proxy("as2", f"as2/{path}", request)
@app.api_route("/integration/{path:path}", methods=["GET","POST"])
async def integration(path: str, request: Request): return await proxy("integration", path, request)
@app.api_route("/catalog/{path:path}", methods=["GET"])
async def catalog(path: str, request: Request): return await proxy("catalog", f"catalog/{path}", request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
