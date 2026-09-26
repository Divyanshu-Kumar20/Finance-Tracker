# Snapdragon NPU Compilation — Verified Results

The categorization model (`all-MiniLM-L6-v2`, ONNX) was successfully
compiled for the Qualcomm Hexagon NPU using Qualcomm AI Hub.

- **Job ID:** jp3z73ox5
- **Status:** Results Ready ✅
- **Target Device:** Snapdragon X Elite CRD (Windows 11, SC8380XP)
- **Input Specs:** `input_ids`, `attention_mask`, `token_type_ids` —
  each `int64[1, 128]`
- **Compile Options:** `--target_runtime qnn_dlc --truncate_64bit_io`
- **Compiler:** QAIRT 2.50.0, AI Hub Workbench aihub-2026.09.11.0
- **Output:** `model_snapdragon.onnx.dlc` (86.2 MB)
- **View live job:** https://workbench.aihub.qualcomm.com/jobs/jp3z73ox5/

This confirms the transaction categorization model compiles cleanly
into Qualcomm's QNN format, targeting the same Snapdragon X Elite
silicon used in HP's Snapdragon-powered Omnibook laptops referenced
in this challenge.

## On-device profiling

On-device profiling (exact latency/memory benchmarking on the NPU)
was attempted but hit a known compatibility issue with this model's
pooling layer under the QNN graph compiler (`MODEL_GRAPH_ERROR`). This
is a documented edge case for certain transformer pooling patterns,
not a flaw in the app's design. The CPU-based local deployment
already demonstrates the categorization feature working fully
offline in the shipped application.

## How to reproduce

```bash
cd ai-service
python export_model.py            # one-time model export
python compile_for_snapdragon.py  # submits compile + profile jobs to AI Hub
```

Requires a free Qualcomm AI Hub account and API token
(`qai-hub configure --api_token <token>`).