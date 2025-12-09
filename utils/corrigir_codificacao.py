# Script para converter a codificação do arquivo models.py para UTF-8
with open('main_app/models.py', 'r', encoding='latin1') as file:
    content = file.read()
    print(content)

with open('main_app/models.py', 'w', encoding='utf-8') as file:
    file.write(content)
