import csv
from datetime import datetime
from main_app.models import DespesaReceita
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Importa despesas e receitas de um arquivo CSV"

    # Limpar a tabela
    DespesaReceita.objects.all().delete()

    def handle(self, *args, **options):
        with open(r'C:\Users\cawan\OneDrive - Universidade Federal do Espírito Santo\Projetos_Visual_Studio_Code\Projetos em Python\COOPESMA\despesas_receitas.csv',  # noqa E503
                  'r', encoding='utf-8') as file:
            # Define o separador correto
            reader = csv.DictReader(file, delimiter=';')
            for row in reader:
                # Converte 'janeiro-22' para um formato padrão
                #  (exemplo: '2022-01-01')
                mes_ano = row['Data']
                try:
                    # Converte texto para data
                    data = datetime.strptime(mes_ano, "%B-%y")
                except ValueError:
                    # Tratamento para meses em português (ex: janeiro)
                    meses = {
                        "janeiro": "01", "fevereiro": "02", "março": "03",
                        "abril": "04", "maio": "05", "junho": "06",
                        "julho": "07", "agosto": "08", "setembro": "09",
                        "outubro": "10", "novembro": "11", "dezembro": "12"
                    }
                    mes, ano = mes_ano.split('-')
                    data = datetime.strptime(f"{meses[mes]}-{ano}", "%m-%y")

                # Converte valor para float, trocando ',' por '.'
                # valor = float(row['Valor'].replace(',', '.'))

                valor_str = row['Valor'].strip()  # Remove espaços em branco
                if valor_str:  # Verifica se o valor não está vazio
                    valor = float(valor_str.replace(',', '.'))
                else:
                    valor = 0.0

                # Cria o objeto no banco de dados
                DespesaReceita.objects.create(
                    data=data,
                    plano_de_contas=row['Plano de Contas'],
                    valor=valor,
                    tipo=row['Tipo'],
                    subtipo=row['Subtipo'],
                    categoria=row['Categoria']
                )
        self.stdout.write(self.style.SUCCESS(
            'Importação concluída com sucesso!'))
