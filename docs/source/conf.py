# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

import django
import os
import sys
# Adiciona a raiz do projeto ao caminho
sys.path.insert(0, os.path.abspath('../..'))
# Substitua com o nome do seu projeto
# os.environ['DJANGO_SETTINGS_MODULE'] = 'Coopesma.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Coopesma.settings')
django.setup()


project = 'Coopesma'
copyright = '2025, Wanderley Cardoso Celeste'
author = 'Wanderley Cardoso Celeste'
release = '0.1'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',  # Para suportar docstrings estilo Google e NumPy
]


templates_path = ['_templates']
exclude_patterns = []

language = 'pt_BR'

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = ['_static']
