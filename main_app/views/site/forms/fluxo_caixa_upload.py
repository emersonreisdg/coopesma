import json
from django import forms
# from django.core.cache import cache
from ....models import DespesaReceita
from django.urls import reverse_lazy
from .form_base import FormViewBase
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from collections import defaultdict
# from utils.strings import is_negative_number
from utils.cache_helpers import get_cached_queryset
# from datetime import datetime
from django.http import JsonResponse
# from django.shortcuts import redirect
# import datetime
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@login_required(login_url='colaborador:login', redirect_field_name='next')
def salvar_fluxo_caixa_na_sessao(request):
    """
    Salva dados agrupados e filtrados na sessão do usuário via requisição
    POST contendo um corpo JSON. Retorna sucesso ou erro conforme o caso.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print('DADOS RECEBIDOS:', data)
            print('Dados sendo salvos na sessão:')
            request.session['filtered_data'] = data.get('filteredData', [])
            request.session['grouped_data'] = data.get('groupedData', [])

            # # Verificando se os dados foram salvos na sessão
            # print('Dados salvos na sessão:')
            # print('filtered_data:', request.session.get('filtered_data'))
            # print('grouped_data:', request.session.get('grouped_data'))

            return JsonResponse({'status': 'success'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error',
                                 'message': 'JSON inválido'}, status=400)
    return JsonResponse({'status': 'error',
                         'message': 'Método não permitido'}, status=405)


class FluxoCaixaForm(forms.ModelForm):
    """
    Formulário baseado no modelo DespesaReceita utilizado para fluxos
    de caixa. No momento, nenhum campo é diretamente manipulado.
    """
    class Meta:
        model = DespesaReceita
        # fields = ['data', 'plano_de_contas', 'valor']
        fields = []

    def __init__(self, *args, **kwargs):
        """
        Inicializa o formulário e prepara estrutura para armazenar erros.
        """
        super().__init__(*args, **kwargs)

        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Executa validações personalizadas no formulário.
        Atualmente apenas invoca a limpeza padrão.
        """
        cleaned_data = super().clean()
        return cleaned_data


# class ExcelUploadForm(forms.Form):
    # arquivo = forms.FileField(label="Selecione um arquivo Excel")


class ExcelUploadBaseView(FormViewBase):
    """
    View base para upload de dados de fluxo de caixa (despesas e receitas).
    Utiliza o modelo DespesaReceita e trabalha com dados de sessão.
    """
    model = DespesaReceita
    form_class = FluxoCaixaForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:fluxo_caixa')
    title = None
    context_object_name = 'fluxo_caixa_upload'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Retorna o queryset do modelo DespesaReceita com cache aplicado.
        """
        return get_cached_queryset(self.model, 'fluxo_caixa_queryset')

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Define self.object como None e renderiza o formulário vazio.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Retorna o objeto a ser editado ou None se for uma criação nova.
        """
        pk = self.kwargs.get('pk')
        if pk:
            return DespesaReceita.objects.filter(pk=pk).first()
        return None

    def get_success_url(self):
        """
        Redireciona para a mesma URL após o envio do formulário.
        """
        return self.request.path

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Processa os dados da tabela armazenada na sessão, calcula o valor
        líquido (recebido - pago) e cria registros no banco.
        """
        print('FORMULÁRIO VÁLIDO')
        dados_tabela = self.request.session.get('form_data', None)
        if not dados_tabela:
            form.add_error(None, 'Dados da tabela não encontrados na sessão.')
            return self.form_invalid(form)

        # Processar os dados da tabela aqui
        for row in dados_tabela:
            recebido = float(row['RECEBIDO']) if row['RECEBIDO'] else 0.0
            pago = float(row['PAGO']) if row['PAGO'] else 0.0
            valor = recebido - pago

            DespesaReceita.objects.create(
                data=row['DATA'],
                plano_de_contas=row['P. DE CONTAS'],
                valor=valor
            )

        return super().form_valid(form)

    # Renderiza o template com os dados do formulário preenchidos e os erros

    def form_invalid(self, form):
        """
        Atualiza o contexto com erros do formulário inválido e renderiza.
        """
        print('FORMULÁRIO INVÁLIDO')
        context = self.get_context_data()
        context.update({"success": False, "errors": form.errors})
        return self.render_to_response(context)

    def update_context(self, ctx):
        """
        Atualiza o contexto com os dados existentes para exibição.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'plano_de_contas',
                    'valor', 'tipo', 'subtipo', 'categoria'))

        ctx.update({
            'data': json.dumps(data, cls=JSONEncoderCustom),
        })

        return ctx


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class ExcelUploadView(ExcelUploadBaseView):
    """
    View responsável por exibir e processar o formulário de upload
    de fluxo de caixa (despesas e receitas).
    """
    title = "Carregar Fluxo de Despesas e Receitas"
    ambiente = 'fluxo_caixa_upload.html'
    controles_ambiente = 'fluxo_caixa_upload.js'
    estilo_ambiente = 'forms/fluxo_caixa.css'

    # def dispatch(self, request, *args, **kwargs):
    #     # Limpa a sessão ao iniciar a view
    #     # request.session.pop('filtered_data', None)
    #     # request.session.pop('grouped_data', None)
    #     return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """
        Recebe os dados da requisição POST em JSON e cria um novo
        registro no modelo DespesaReceita se os dados estiverem completos.
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") \
                    or not data.get("plano_de_contas") \
                    or not data.get("valor"):

                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            fluxo = DespesaReceita.objects.create(
                data=data["data"],
                plano_de_contas=data["plano_de_contas"],
                valor=data["valor"],
            )

            return JsonResponse({"status": "success",
                                 "id": fluxo.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error",
                                 "errors": "JSON inválido."},
                                status=400)
        except Exception as e:
            return JsonResponse({"status": "error",
                                 "errors": str(e)},
                                status=500)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class CompleteFluxoFormView(ExcelUploadBaseView):
    """
    View responsável por complementar os registros do fluxo de caixa
    com informações adicionais (tipo, subtipo, categoria).
    """
    title = "Enquadra Novos Itens Identificados em Fluxo de Caixa"
    ambiente = 'fluxo_caixa_completa.html'
    controles_ambiente = 'fluxo_caixa_completa.js'
    estilo_ambiente = 'forms/fluxo_caixa_completa.css'

    def update_context(self, ctx):
        """
        Recupera e insere no contexto os dados agrupados e filtrados
        armazenados anteriormente na sessão.
        """
        ctx = super().update_context(ctx)

        # Recupera dados armazenados na sessão
        filtered_data = self.request.session.get('filtered_data', {})
        print("Dados recuperados da sessão - filtered_data:",
              filtered_data)  # Para debug

        grouped_data = self.request.session.get('grouped_data', {})
        print("Dados recuperados da sessão - grouped_data:",
              grouped_data)  # Para debug

        ctx.update({
            # 'filtered_data': json.dumps(filtered_data, default=str),
            # 'grouped_data': json.dumps(grouped_data, default=str)

            'filtered_data': json.dumps(filtered_data,
                                        cls=JSONEncoderCustom),
            'grouped_data': json.dumps(grouped_data,
                                       cls=JSONEncoderCustom),
        })

        return ctx

    def post(self, request, *args, **kwargs):
        """
        Recebe os dados via JSON, valida campos obrigatórios e cria
        novo registro completo no modelo DespesaReceita.
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") \
                    or not data.get("plano_de_contas") \
                    or not data.get("valor") \
                    or not data.get("tipo") \
                    or not data.get("subtipo") \
                    or not data.get("categoria"):

                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            fluxo = DespesaReceita.objects.create(
                data=data["data"],
                plano_de_contas=data["plano_de_contas"],
                valor=data["valor"],
                tipo=data["tipo"],
                subtipo=data["subtipo"],
                categoria=data["categoria"],
            )

            return JsonResponse({"status": "success",
                                 "id": fluxo.id}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error",
                                 "errors": "JSON inválido."},
                                status=400)
        except Exception as e:
            return JsonResponse({"status": "error",
                                 "errors": str(e)},
                                status=500)

    @method_decorator(
        login_required(login_url='colaborador:login',
                       redirect_field_name='next'),
        name='dispatch'
    )
    def salvar_fluxo_caixa_na_sessao(request):
        """
        Salva os dados recebidos via POST diretamente como um novo
        registro de fluxo de caixa. Deve ser ajustado para `commit=True`.
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                # Cria uma instância do modelo
                fluxo_caixa = DespesaReceita(**data)
                fluxo_caixa.save(commit=False)  # Salva no banco de dados
                print('WANDER, ALTERE COMMIT PARA TRUE NO MOMENTO CERTO!')
                return JsonResponse({"status": "success", "message":
                                     "Registro de Cooperado salvo com sucesso!"
                                     })
            except Exception as e:
                return JsonResponse({"status": "error", "message":
                                     str(e)}, status=400)
        return JsonResponse({"status": "error",
                             "message": "Método não permitido."}, status=405)
