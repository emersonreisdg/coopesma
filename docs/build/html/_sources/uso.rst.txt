Uso
===

Este projeto é dividido em duas partes principais: servidor backend (Django) e frontend interativo (JavaScript). A seguir são apresentados os passos para instalação e execução local.

Instalação do Backend
---------------------
1. Clone o repositório do projeto:
   .. code-block:: bash

      git clone https://github.com/seuusuario/seuprojeto.git
      cd seuprojeto/backend

2. Crie um ambiente virtual e ative:
   .. code-block:: bash

      python -m venv venv
      source venv/bin/activate  # Linux/macOS
      venv\Scripts\activate     # Windows

3. Instale as dependências:
   .. code-block:: bash

      pip install -r requirements.txt

4. Aplique as migrações e inicie o servidor:
   .. code-block:: bash

      python manage.py migrate
      python manage.py runserver

Instalação do Frontend
----------------------
1. Acesse o diretório do frontend:
   .. code-block:: bash

      cd ../frontend

2. Instale as dependências (se houver):
   .. code-block:: bash

      npm install  # ou use apenas os arquivos JS se for vanilla JS

3. A interface web pode ser acessada pelo navegador, integrada ao Django via templates, ou servida separadamente se configurado.

Execução do Sistema
-------------------
Com o servidor Django em execução (`http://127.0.0.1:8000`), acesse o navegador e navegue até a rota principal do sistema. A interface permitirá:
- Enviar vídeos para análise.
- Visualizar gráficos interativos sobre as interações detectadas.
- Filtrar e exportar resultados.



Para executar o sistema em django:

.. code-block:: bash

    python manager.py runserver