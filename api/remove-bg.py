from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response
from rembg import remove
from PIL import Image
import io

app = FastAPI()

@app.post("/api/remove-bg")
async def handler(
    file: UploadFile = File(...),
    bg_color: str = Form(None),
    width: int = Form(None),
    height: int = Form(None),
    format: str = Form("png")
):
    try:
        # Read uploaded file
        image_data = await file.read()
        input_image = Image.open(io.BytesIO(image_data))
        
        # Remove background
        output_image = remove(input_image)
        
        # Resize if dimensions provided
        if width and height:
            output_image = output_image.resize((width, height), Image.Resampling.LANCZOS)
        elif width:
            aspect_ratio = output_image.height / output_image.width
            new_height = int(width * aspect_ratio)
            output_image = output_image.resize((width, new_height), Image.Resampling.LANCZOS)
        elif height:
            aspect_ratio = output_image.width / output_image.height
            new_width = int(height * aspect_ratio)
            output_image = output_image.resize((new_width, height), Image.Resampling.LANCZOS)
        
        # Apply background color if not transparent
        if bg_color and bg_color != "transparent":
            # Parse RGB color (format: "r,g,b")
            if "," in bg_color:
                rgb = tuple(map(int, bg_color.split(",")))
            else:
                # Convert hex to RGB
                bg_color = bg_color.lstrip('#')
                rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
            
            # Create new image with background color
            background = Image.new('RGB', output_image.size, rgb)
            if output_image.mode == 'RGBA':
                background.paste(output_image, mask=output_image.split()[3])
                output_image = background
        
        # Convert to output format
        output_buffer = io.BytesIO()
        if format.lower() == "jpg" or format.lower() == "jpeg":
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
