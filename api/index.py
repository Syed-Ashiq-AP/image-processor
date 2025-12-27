from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from mangum import Mangum
from rembg import remove
from PIL import Image
import io
import requests

app = FastAPI()

@app.post("/api/remove-background")
async def remove_background(
    file: UploadFile = File(None),
    imageUrl: str = Form(None),
    backgroundColor: str = Form("transparent"),
    width: int = Form(None),
    height: int = Form(None),
    format: str = Form("png")
):
    try:
        # Get image data
        if file:
            image_data = await file.read()
            input_image = Image.open(io.BytesIO(image_data))
        elif imageUrl:
            response = requests.get(imageUrl)
            input_image = Image.open(io.BytesIO(response.content))
        else:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Remove background
        output_image = remove(input_image)
        
        # Resize if dimensions provided (always maintain aspect ratio)
        if width or height:
            original_width, original_height = output_image.size
            aspect_ratio = original_width / original_height
            
            if width and height:
                # Both dimensions provided - fit within bounds while maintaining aspect ratio
                if original_width / width > original_height / height:
                    # Width is the limiting factor
                    new_width = width
                    new_height = int(width / aspect_ratio)
                else:
                    # Height is the limiting factor
                    new_height = height
                    new_width = int(height * aspect_ratio)
            elif width:
                # Only width provided
                new_width = width
                new_height = int(width / aspect_ratio)
            else:
                # Only height provided
                new_height = height
                new_width = int(height * aspect_ratio)
            
            output_image = output_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Apply background color if not transparent
        if backgroundColor and backgroundColor != "transparent":
            # Parse RGB color
            if backgroundColor.startswith("rgb("):
                # Extract RGB values from "rgb(r, g, b)" format
                rgb_str = backgroundColor.replace("rgb(", "").replace(")", "").replace(" ", "")
                rgb = tuple(map(int, rgb_str.split(",")))
            elif backgroundColor.startswith("#"):
                # Convert hex to RGB
                bg_color = backgroundColor.lstrip('#')
                rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
            else:
                rgb = (255, 255, 255)  # Default to white
            
            # Create new image with background color
            background = Image.new('RGB', output_image.size, rgb)
            if output_image.mode == 'RGBA':
                background.paste(output_image, mask=output_image.split()[3])
                output_image = background
        
        # Convert to output format
        output_buffer = io.BytesIO()
        if format.lower() in ["jpg", "jpeg"]:
            if output_image.mode == 'RGBA':
                output_image = output_image.convert('RGB')
            output_image.save(output_buffer, format="JPEG", quality=95)
            media_type = "image/jpeg"
        elif format.lower() == "webp":
            output_image.save(output_buffer, format="WEBP", quality=95)
            media_type = "image/webp"
        else:  # PNG
            output_image.save(output_buffer, format="PNG")
            media_type = "image/png"
        
        output_buffer.seek(0)
        return Response(content=output_buffer.read(), media_type=media_type)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
@app.get("/api")
async def root():
    return {"message": "Background Removal API", "status": "running"}

# Vercel serverless handler
handler = Mangum(app)
