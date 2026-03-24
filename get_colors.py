from PIL import Image
import sys

def get_colors(image_file):
    img = Image.open(image_file)
    img = img.resize((150, 150))
    # Convert to RGB if RGBA
    if img.mode == 'RGBA':
        # Create a white background
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
        img = background
    
    img = img.convert('RGB')
    colors = img.getcolors(150*150)
    if colors:
        sorted_colors = sorted(colors, key=lambda t: t[0], reverse=True)
        for count, color in sorted_colors[:10]:
            hex_col = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
            print(f"{hex_col} (Count: {count})")
    
if __name__ == '__main__':
    get_colors(sys.argv[1])
