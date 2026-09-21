import os
import json
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.onnx")
TOKENIZER_DIR = os.path.join(BASE_DIR, "model", "tokenizer")
CATEGORIES_FILE = os.path.join(BASE_DIR, "categories.json")

app = FastAPI(title="Finance Tracker AI Service")

class CategorizeRequest(BaseModel):
    text: str

class CategorizerEngine:
    def __init__(self):
        self.session = None
        self.tokenizer = None
        self.category_embeddings = {}
        self.loaded = False

    def load(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(TOKENIZER_DIR):
            print("Model or Tokenizer directory missing. Please run export_model.py first.")
            return False

        # Load Tokenizer & ONNX Session strictly offline from local path
        self.tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_DIR, local_files_only=True)
        
        opts = ort.SessionOptions()
        self.session = ort.InferenceSession(MODEL_PATH, opts, providers=["CPUExecutionProvider"])
        
        # Precompute category embeddings from categories.json
        if os.path.exists(CATEGORIES_FILE):
            with open(CATEGORIES_FILE, "r", encoding="utf-8") as f:
                categories_data = json.load(f)

            for category, phrases in categories_data.items():
                phrase_embs = [self.get_embedding(p) for p in phrases]
                avg_emb = np.mean(phrase_embs, axis=0)
                norm = np.linalg.norm(avg_emb)
                if norm > 0:
                    avg_emb = avg_emb / norm
                self.category_embeddings[category] = avg_emb

        self.loaded = True
        return True

    def get_embedding(self, text: str) -> np.ndarray:
        inputs = self.tokenizer(text, padding=True, truncation=True, max_length=128, return_tensors="np")
        onnx_inputs = {node.name: inputs[node.name] for node in self.session.get_inputs() if node.name in inputs}
        
        outputs = self.session.run(None, onnx_inputs)
        last_hidden_state = outputs[0]  # shape (1, seq_len, hidden_dim)

        input_mask = inputs["attention_mask"]
        input_mask_expanded = np.expand_dims(input_mask, -1)
        
        sum_embeddings = np.sum(last_hidden_state * input_mask_expanded, axis=1)
        sum_mask = np.clip(input_mask_expanded.sum(axis=1), a_min=1e-9, a_max=None)
        mean_pooled = (sum_embeddings / sum_mask)[0]
        
        norm = np.linalg.norm(mean_pooled)
        if norm > 0:
            mean_pooled = mean_pooled / norm

        return mean_pooled

    def predict(self, text: str, threshold: float = 0.35):
        if not self.loaded:
            self.load()

        if not self.loaded or not self.category_embeddings:
            return {"category": "Other", "confidence": 0.0}

        text_emb = self.get_embedding(text)
        best_category = "Other"
        best_score = -1.0

        for category, cat_emb in self.category_embeddings.items():
            sim = float(np.dot(text_emb, cat_emb))
            if sim > best_score:
                best_score = sim
                best_category = category

        if best_score < threshold:
            return {"category": "Other", "confidence": round(best_score, 4)}

        return {"category": best_category, "confidence": round(best_score, 4)}

engine = CategorizerEngine()

@app.on_event("startup")
def startup_event():
    engine.load()

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "Finance Tracker AI Service",
        "engine_loaded": engine.loaded
    }

@app.post("/categorize")
def categorize_transaction(req: CategorizeRequest):
    return engine.predict(req.text)
