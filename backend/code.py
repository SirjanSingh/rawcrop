import os
import rawpy
import numpy as np
import subprocess
from tifffile import imwrite

# Define Input & Output Folders (using raw strings for Windows paths)
input_folder = r"D:\astrophotography\camera\7 jan\video\raw\conv"  # Folder with RAW images
output_folder = r"D:\astrophotography\camera\7 jan\video\raw\conv1"  # Folder for cropped output

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Process each RAW file
for filename in os.listdir(input_folder):
    if filename.lower().endswith(('.arw', '.dng', '.nef', '.cr2')):  # Add more formats if needed
        raw_path = os.path.join(input_folder, filename)
        output_tiff = os.path.join(output_folder, filename.replace('.arw', '.tiff').replace('.dng', '.tiff'))

        print(f"Processing {filename}...")

        # Open RAW file
        with rawpy.imread(raw_path) as raw:
            raw_image = raw.raw_image_visible.copy()  # Get RAW Bayer data
            
            # Get original dimensions
            height, width = raw_image.shape
            
            # Define crop: Keep the full width but remove 500 pixels from the bottom
            cropped_image = raw_image[:height - 1300, :]

            # Save as TIFF (for stacking)
            imwrite(output_tiff, cropped_image.astype(np.uint16))

            # Copy metadata from original to cropped file using ExifTool
            subprocess.run(["exiftool", "-TagsFromFile", raw_path, "-all:all", "-overwrite_original", output_tiff])

        print(f"Saved cropped TIFF: {output_tiff}")

print("✅ Batch Cropping Done! 500px removed from the bottom.") 