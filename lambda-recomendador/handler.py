def lambda_handler(event, context=None):
    usuario = event["usuario"]
    despensa_payload = event["despensa"]
    despensa = despensa_payload.get("items", despensa_payload) if isinstance(despensa_payload, dict) else despensa_payload
    recetas = event["recetas"]
    disponibles = {i["nombre"].lower() for i in despensa}
    mejor = None
    mejor_score = -1
    faltantes_mejor = []
    for receta in recetas:
        req = [x["ingrediente"].lower() for x in receta["ingredientes"] if x["obligatorio"]]
        encontrados = len([x for x in req if x in disponibles])
        faltantes = [x for x in req if x not in disponibles]
        score = encontrados * 50 - len(faltantes) * 15
        if receta["tiempo"] <= usuario.get("tiempo_disponible", 30):
            score += 10
        if receta["costo_estimado"] <= float(usuario.get("presupuesto", 5)):
            score += 10
        if score > mejor_score:
            mejor_score = score
            mejor = receta
            faltantes_mejor = faltantes
    return {
        "request_id": event["request_id"],
        "usuario_id": usuario["id"],
        "estado": "COMPLETADA",
        "receta": mejor,
        "score": mejor_score,
        "lista_compra": faltantes_mejor,
        "explicacion": f"Se recomienda {mejor['nombre']} porque coincide con tu despensa, tiempo y presupuesto. Ingredientes faltantes: {', '.join(faltantes_mejor) if faltantes_mejor else 'ninguno'}."
    }
