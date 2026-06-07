import glob
import os

html_files = glob.glob('*.html')

for fpath in html_files:
    print(f"Processing {fpath}...")
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update logo filename
    content = content.replace('logo-aljahfali.png', 'logo.png')
    
    # 2. Update favicon links
    if 'about.html' in fpath:
        # For about.html, add icon links above manifest link if not present
        if 'favicon.ico' not in content:
            old_manifest = '<link rel="manifest" href="manifest.json" />'
            new_manifest = '<link rel="icon" href="favicon.ico" sizes="any">\n  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n  <link rel="manifest" href="manifest.json" />'
            content = content.replace(old_manifest, new_manifest)
    else:
        # For other files, remove old links and add the new ones
        content = content.replace('<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" >', '')
        content = content.replace('<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" >', '')
        content = content.replace('<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" >', '')
        content = content.replace('<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" >', '')
        
        # Insert the new ones above manifest
        if 'favicon.ico' not in content:
            old_manifest = '<link rel="manifest" href="manifest.json" >'
            new_manifest = '<link rel="icon" href="favicon.ico" sizes="any">\n  <link rel="apple-touch-icon" href="apple-touch-icon.png">\n  <link rel="manifest" href="manifest.json" >'
            content = content.replace(old_manifest, new_manifest)
            
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("HTML files updated successfully!")
