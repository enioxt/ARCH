from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="EGOS Arch - Python Workers API")

class GeometryRequest(BaseModel):
    image_url: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "python-workers"}

@app.post("/api/vision/extract-geometry")
async def extract_geometry(file: UploadFile = File(...)):
    # Aqui vai a lógica de OpenCV para limpar o croqui
    # e extrair as linhas principais.
    return {
        "status": "success",
        "message": "Geometry extracted successfully",
        "data": {
            "lines": [],
            "polygons": []
        }
    }

@app.post("/api/geometry/generate-3d")
async def generate_3d(req: GeometryRequest):
    # Aqui vai a lógica com Trimesh ou Blender API
    # para gerar o arquivo .gltf ou .obj
    return {
        "status": "success",
        "model_url": "https://storage.googleapis.com/egos-arch/mock-model.gltf"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
