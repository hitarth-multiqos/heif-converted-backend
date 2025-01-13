import os
import sys
from PIL import Image
import pyheif

def convert_image(input_file):
    # Check if the file exists
    if not os.path.isfile(input_file):
        print(f"File not found: {input_file}")
        return None
    
    # Set output file path (changing extension to .jpg)
    output_file = input_file.replace('.heic', '.jpg').replace('.heif', '.jpg')
    print(f"Output file path: {output_file}")

    try:
        # Open and convert the image if it's a HEIC/HEIF file
        if input_file.lower().endswith(('.heic', '.heif')):
            heif_file = pyheif.read(input_file)  # Read HEIC/HEIF file
            img = Image.frombytes(
                heif_file.mode, 
                heif_file.size, 
                heif_file.data, 
                "raw", 
                heif_file.mode, 
                heif_file.stride,
            )
        else:
            # If it's a regular image file, use PIL
            img = Image.open(input_file)
        
        img.convert('RGB').save(output_file, 'JPEG')
        print(f"Conversion completed: {output_file}")
        return output_file

    except Exception as e:
        print(f"Error during conversion: {e}")
        return None

if __name__ == '__main__':
    input_file = sys.argv[1]  # Get the file path from command line argument
    print(f"Input file path: {input_file}")
    converted_file = convert_image(input_file)

    if converted_file:
        print(f"File saved to: {converted_file}")
    else:
        print("Conversion failed.")
