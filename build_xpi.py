import zipfile
import os
from pathlib import Path

extension_files = [
    'manifest.json',
    'background.js',
    'popup.html',
    'popup.js',
    'styles.css',
    'icon.svg',
    'LICENSE'
]

extension_dirs = ['icons']

output_file = 'closed_tabs_viewer-1.0.xpi'

print('开始打包Firefox扩展...')

with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zf:
    for file in extension_files:
        if os.path.exists(file):
            zf.write(file)
            print(f'  添加文件: {file}')
        else:
            print(f'  警告: 文件不存在 - {file}')
    
    for dir_name in extension_dirs:
        if os.path.exists(dir_name) and os.path.isdir(dir_name):
            for root, dirs, files in os.walk(dir_name):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = file_path
                    zf.write(file_path, arcname)
                    print(f'  添加文件: {arcname}')
        else:
            print(f'  警告: 目录不存在 - {dir_name}')

file_size = os.path.getsize(output_file)
print(f'\n打包完成！')
print(f'输出文件: {output_file}')
print(f'文件大小: {file_size:,} 字节 ({file_size/1024:.2f} KB)')
print(f'\n现在可以将此文件上传到Firefox商店了。')
