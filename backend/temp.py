import rawpy
from PIL import Image
import os
import numpy as np

def crop_raw_output(file_path, crop_pixels=500):
    """
    Opens a raw image file (e.g., .ARW) using rawpy, postprocesses it,
    crops off 'crop_pixels' from the bottom, and returns:
      - a cropped image as a Pillow Image object, and 
      - the raw (uncompressed) byte output of the cropped image.
      
    Args:
        file_path (str): The path to the raw image file.
        crop_pixels (int): Number of pixels to remove from the bottom.
        
    Returns:
        tuple: (cropped_image, raw_bytes)
            cropped_image: Pillow Image object representing the cropped image.
            raw_bytes:     A bytes object containing the raw pixel data.
            
    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the image's height is less than or equal to crop_pixels.
    """
    # Remove extraneous quotes from the file path if present
    file_path = file_path.strip('"')
    
    # Verify the file exists
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"The file was not found: {file_path}")
    
    # Use rawpy to read and postprocess the raw image file into a NumPy array (RGB)
    with rawpy.imread(file_path) as raw:
        rgb_array = raw.postprocess()
    
    # Determine dimensions and verify there is enough height to crop the desired amount
    height, width = rgb_array.shape[:2]
    if height <= crop_pixels:
        raise ValueError("Image height is less than or equal to the crop amount.")
    
    # Crop the array by slicing off 'crop_pixels' from the bottom
    cropped_array = rgb_array[:height - crop_pixels, :, :]
    
    # Convert the cropped NumPy array to a Pillow Image
    cropped_image = Image.fromarray(cropped_array)
    
    # Get the raw byte output from the cropped NumPy array
    raw_bytes = cropped_array.tobytes()
    
    return cropped_image, raw_bytes

if __name__ == "__main__":
    # Set the input raw file path (adjust accordingly)
    input_image_path = r'D:\astrophotography\camera\7 jan\video\raw\conv\_DSC6550.ARW'
    
    # Set the output folder path
    output_folder = r'D:\astrophotography\project\rawcrop-clean\rawcr\output'
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        # Get the cropped Pillow image and the raw byte data
        cropped_image, raw_bytes = crop_raw_output(input_image_path, crop_pixels=500)
        
        # Save the cropped Pillow Image for viewing (as JPEG)
        cropped_image_path = os.path.join(output_folder, 'cropped_image.jpg')
        cropped_image.save(cropped_image_path)
        
        # Save the raw byte data to a binary file (this file contains unformatted pixel data)
        raw_bytes_path = os.path.join(output_folder, 'cropped_image_raw.bin')
        with open(raw_bytes_path, 'wb') as f:
            f.write(raw_bytes)
        
        print(f"Cropped image saved to: {cropped_image_path}")
        print(f"Raw byte output saved to: {raw_bytes_path}")
        
        # Optionally, display the cropped image
        cropped_image.show()
        
    except Exception as e:
        print("An error occurred:", e)
