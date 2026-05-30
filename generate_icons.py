from PIL import Image, ImageDraw
import os
from pathlib import Path

icons_dir = 'icons'
Path(icons_dir).mkdir(exist_ok=True)

sizes = [16, 32, 48, 64, 128]

for size in sizes:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 48
    
    rect_margin = int(4 * scale)
    rect_width = size - 2 * rect_margin
    rect_height = int(32 * scale)
    rect_y = int(8 * scale)
    corner_radius = int(4 * scale)
    
    draw.rounded_rectangle(
        [rect_margin, rect_y, rect_margin + rect_width, rect_y + rect_height],
        radius=corner_radius,
        fill=(74, 144, 217, 255)
    )
    
    inner_margin = int(8 * scale)
    inner_width = size - 2 * inner_margin
    inner_height = int(24 * scale)
    inner_y = int(12 * scale)
    inner_corner = int(2 * scale)
    
    draw.rounded_rectangle(
        [inner_margin, inner_y, inner_margin + inner_width, inner_y + inner_height],
        radius=inner_corner,
        fill=(255, 255, 255, 255)
    )
    
    circle_x = int(16 * scale)
    circle_y = int(18 * scale)
    circle_radius = int(3 * scale)
    
    draw.ellipse(
        [circle_x - circle_radius, circle_y - circle_radius,
         circle_x + circle_radius, circle_y + circle_radius],
        fill=(255, 71, 87, 255)
    )
    
    output_file = os.path.join(icons_dir, f'icon-{size}.png')
    img.save(output_file, 'PNG')
    print(f'已生成: {output_file} ({size}x{size})')

print('所有图标已生成完成！')
