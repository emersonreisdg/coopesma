# Script para remover caracteres nulos de models.py
file_path = 'main_app/models.py'

with open(file_path, 'rb') as file:
    content = file.read()

# Remove caracteres nulos
cleaned_content = content.replace(b'\x00', b'')

with open(file_path, 'wb') as file:
    file.write(cleaned_content)

print(f"Caracteres nulos removidos de {file_path}.")
