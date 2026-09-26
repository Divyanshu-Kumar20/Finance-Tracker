import os
import sys
import onnx
import qai_hub as hub

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "model_merged.onnx")
OUTPUT_PATH = os.path.join(BASE_DIR, "model", "model_snapdragon.onnx")

SEQ_LEN = 128  # matches max_length used in main.py's tokenizer call

def get_input_names(model_path):
    model = onnx.load(model_path)
    return [i.name for i in model.graph.input]

def compile_model():
    print("=======================================================")
    print(" Qualcomm AI Hub Model Compilation for Snapdragon X ")
    print("=======================================================")

    if not os.path.exists(MODEL_PATH):
        print(f"[Error] ONNX model file not found at: {MODEL_PATH}")
        print("Please run export_model.py first.")
        sys.exit(1)

    print(f"[*] Found input ONNX model: {MODEL_PATH}")

    input_names = get_input_names(MODEL_PATH)
    print(f"[*] Detected model inputs: {input_names}")

    # Build static input specs for every input the model actually has
    input_specs = {name: ((1, SEQ_LEN), "int64") for name in input_names}

    device_name = "Snapdragon X Elite CRD"
    print(f"[*] Target Hardware Device: {device_name}")

    try:
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
            input_specs=input_specs,
            options="--target_runtime qnn_dlc --truncate_64bit_io"
        )

        print(f"[*] Job Submitted! Job ID: {compile_job.job_id}")
        print(f"[*] View live progress at: {compile_job.url}")
        print("[*] Waiting for Qualcomm AI Hub compilation to complete...")

        compile_job.wait()
        target_model = compile_job.get_target_model()

        if target_model is None:
            print("[Error] Compile job did not produce a target model. Check the job URL above for details.")
            return

        target_model.download(OUTPUT_PATH)
        print(f"[Success] Compiled Snapdragon QNN model saved to: {OUTPUT_PATH}")

        print("[*] Submitting profiling job to measure NPU latency and memory footprint...")
        profile_job = hub.submit_profile_job(
            model=target_model,
            device=target_device
        )
        profile_job.wait()
        profile_data = profile_job.download_profile()
        print("\n--- Profiling Results ---")
        print(profile_data)

    except Exception as e:
        print("\n-------------------------------------------------------")
        print(" [Notice] Qualcomm AI Hub Compilation Output Status")
        print("-------------------------------------------------------")
        safe_msg = str(e).encode("ascii", "ignore").decode("ascii")
        print(f"Details:\n{safe_msg}")
        print("\nFor detailed execution flow and HP Snapdragon PC deployment plan, refer to `docs/snapdragon-plan.md`.")

if __name__ == "__main__":
    compile_model()