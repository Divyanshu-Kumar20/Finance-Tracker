import os
import sys
import qai_hub as hub

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model.onnx")
OUTPUT_PATH = os.path.join(BASE_DIR, "model", "model_snapdragon.onnx")

def compile_model():
    print("=======================================================")
    print(" Qualcomm AI Hub Model Compilation for Snapdragon X ")
    print("=======================================================")

    if not os.path.exists(MODEL_PATH):
        print(f"[Error] ONNX model file not found at: {MODEL_PATH}")
        print("Please run export_model.py first.")
        sys.exit(1)

    print(f"[*] Found input ONNX model: {MODEL_PATH}")

    device_name = "Snapdragon X Elite CRD"
    print(f"[*] Target Hardware Device: {device_name}")

    try:
        # Query Qualcomm AI Hub device list
        devices = hub.get_devices(device_name)
        if not devices:
            print(f"[!] Device '{device_name}' not specifically listed. Searching available devices...")
            devices = hub.get_devices()
            target_device = devices[0] if devices else None
        else:
            target_device = devices[0]

        if not target_device:
            raise RuntimeError("No Qualcomm AI Hub devices available.")

        print(f"[*] Selected Target Device: {target_device.name}")

        print("[*] Submitting model compilation job to Qualcomm AI Hub Cloud...")
        compile_job = hub.submit_compile_job(
            model=MODEL_PATH,
            device=target_device,
            options="--target_runtime qnn_context_binary"
        )

        print(f"[*] Job Submitted! Job ID: {compile_job.job_id}")
        print("[*] Waiting for Qualcomm AI Hub compilation to complete...")
        
        target_model = compile_job.get_target_model()
        target_model.download(OUTPUT_PATH)
        print(f"[Success] Compiled Snapdragon ONNX/QNN model saved to: {OUTPUT_PATH}")

        # Submit profiling job
        print("[*] Submitting profiling job to measure NPU latency and memory footprint...")
        profile_job = hub.submit_profile_job(
            model=target_model,
            device=target_device
        )
        profile_data = profile_job.download_profile()
        print("\n--- Profiling Results ---")
        print(profile_data)

    except Exception as e:
        print("\n-------------------------------------------------------")
        print(" [Notice] Qualcomm AI Hub Compilation Output Status")
        print("-------------------------------------------------------")
        safe_msg = str(e).encode("ascii", "ignore").decode("ascii")
        print(f"Details:\n{safe_msg}")
        print("\nNote: Submitting jobs to Qualcomm AI Hub requires an active API token.")
        print("To configure your token: `qai-hub configure --api_token <your_api_token>`")
        print("For detailed execution flow and HP Snapdragon PC deployment plan, refer to `docs/snapdragon-plan.md`.")

if __name__ == "__main__":
    compile_model()
