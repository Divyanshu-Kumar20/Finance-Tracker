import os
import torch
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "model")
TOKENIZER_DIR = os.path.join(OUTPUT_DIR, "tokenizer")
ONNX_PATH = os.path.join(OUTPUT_DIR, "model.onnx")

def export():
    os.makedirs(TOKENIZER_DIR, exist_ok=True)
    print(f"Loading {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME)
    model.eval()

    print(f"Saving tokenizer to {TOKENIZER_DIR}...")
    tokenizer.save_pretrained(TOKENIZER_DIR)

    dummy_text = "zomato dinner 500"
    inputs = tokenizer(dummy_text, return_tensors="pt")
    
    input_names = ["input_ids", "attention_mask"]
    dynamic_axes = {
        "input_ids": {0: "batch_size", 1: "sequence_length"},
        "attention_mask": {0: "batch_size", 1: "sequence_length"},
        "last_hidden_state": {0: "batch_size", 1: "sequence_length"}
    }
    
    if "token_type_ids" in inputs:
        input_names.append("token_type_ids")
        dynamic_axes["token_type_ids"] = {0: "batch_size", 1: "sequence_length"}
        dummy_args = (inputs["input_ids"], inputs["attention_mask"], inputs["token_type_ids"])
    else:
        dummy_args = (inputs["input_ids"], inputs["attention_mask"])

    print(f"Exporting ONNX model to {ONNX_PATH}...")
    torch.onnx.export(
        model,
        dummy_args,
        ONNX_PATH,
        input_names=input_names,
        output_names=["last_hidden_state"],
        dynamic_axes=dynamic_axes,
        opset_version=14,
        do_constant_folding=True
    )
    print("ONNX model export complete!")

if __name__ == "__main__":
    export()
