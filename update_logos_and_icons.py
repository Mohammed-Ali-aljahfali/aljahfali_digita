import glob

html_files = glob.glob('*.html')

for fpath in html_files:
    # Read file content safely
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update logo filename
    content = content.replace('logo-aljahfali.png', 'logo.png')
    
    # 2. Update favicon links
    if 'about.html' in fpath:
        # For about.html, insert links above manifest if not present
        if 'favicon.ico' not in content:
            content = content.replace(
                '<link rel="manifest" href="manifest.json" />',
                '<link rel="icon" href="favicon.ico" sizes="any">\n  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n  <link rel="manifest" href="manifest.json" />'
            )
    else:
        # Remove old tags
        content = content.replace('<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" >', '')
        content = content.replace('<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" >', '')
        content = content.replace('<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" >', '')
        content = content.replace('<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" >', '')
        
        # Add the new ones above manifest if not already added
        if 'favicon.ico' not in content:
            content = content.replace(
                '<link rel="manifest" href="manifest.json" >',
                '<link rel="icon" href="favicon.ico" sizes="any">\n  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n  <link rel="manifest" href="manifest.json" >'
            )
            
    # Write back safely
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML files updated successfully!")
