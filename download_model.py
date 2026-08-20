import os
import gdown

MODEL_URL = "https://drive.google.com/drive/folders/1l7uF3VLc3ScvHEiVug2aZYDTCdEmQWif?usp=drive_link"
OUTPUT_DIR = "backend/models"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Downloading model...")

gdown.download_folder(
    MODEL_URL,
    output=OUTPUT_DIR,
    quiet=False
)

print("Model downloaded successfully.")