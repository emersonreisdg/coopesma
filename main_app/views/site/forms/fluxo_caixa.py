import json
from django import forms
from django.core.cache import cache
from ....models import DespesaReceita
from django.urls import reverse_lazy
from .form_base import FormViewBase
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from collections import defaultdict
# from utils.strings import is_negative_number
from utils.cache_helpers import get_cached_queryset
from datetime import datetime
# from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import redirect
import base64
from django.core.exceptions import ValidationError
import mimetypes
from utils.coopesma.json_encoder_data import JSONEncoderCustom


def normalize_keys(item):
    """
    Normaliza as chaves de um dicionário contendo dados de fluxo de caixa.
    Converte nomes de colunas legíveis (ex: 'DATA') para nomes de campo do
    modelo (ex: 'data').

    Parâmetros:
        item (dict): Dicionário com dados a serem normalizados.

    Retorna:
        dict: Novo dicionário com chaves padronizadas.
    """
    key_map = {
        "DATA": "data",
        "P. DE CONTAS": "plano_de_contas",
        "VALOR": "valor",
        "TIPO": "tipo",
        "SUBTIPO": "subtipo",
        "CATEGORIA": "categoria"
    }
    # Converte chaves conhecidas
    return {key_map.get(k, k): v for k, v in item.items()}


@login_required(login_url='colaborador:login', redirect_field_name='next')
def salvar_fluxo_caixa_na_sessao(request):
    """
    Armazena dados de fluxo de caixa na sessão do usuário via POST com JSON.
    Se um arquivo Excel for enviado codificado em base64, ele também é
    decodificado e armazenado na sessão.

    Retorna:
        JsonResponse: Resposta JSON indicando sucesso ou erro.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Decodificar o arquivo Excel, se presente
            excel_file_base64 = data.get('excel_file')
            if excel_file_base64:
                try:
                    # Decodificar os dados do arquivo
                    excel_file_bytes = base64.b64decode(excel_file_base64)

                    # Armazenar os dados do arquivo na sessão
                    # (ou processar conforme necessário)
                    request.session['excel_file_content'] = \
                        excel_file_bytes.decode('utf-8', errors='ignore')
                except base64.binascii.Error:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Erro ao decodificar o arquivo Excel'
                    }, status=400)

            print('Dados sendo salvos na sessão:', data)
            request.session['form_data'] = data
            return JsonResponse({'status': 'success'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error',
                                 'message': 'JSON inválido'}, status=400)
    return JsonResponse({'status': 'error',
                         'message': 'Método não permitido'}, status=405)

# Recupera o queryset e o armazena em cache por 15 minutos


class FluxoCaixaForm(forms.ModelForm):
    """
    Formulário baseado no modelo DespesaReceita para criação ou edição de
    registros de fluxo de caixa. Realiza validações adicionais.
    """
    class Meta:
        model = DespesaReceita
        fields = ['data', 'plano_de_contas',
                  'valor', 'tipo', 'subtipo', 'categoria']

    def __init__(self, *args, **kwargs):
        """
        Inicializa o formulário e estrutura para controle de erros.
        """
        super().__init__(*args, **kwargs)
        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Valida campos obrigatórios como 'tipo' e 'subtipo'. Adiciona erros
        personalizados se não estiverem preenchidos.

        Retorna:
            dict: Dados limpos do formulário.
        """
        cleaned_data = super().clean()

        # Validações de campo
        for field in ['tipo', 'subtipo']:
            if not cleaned_data.get(field):  # Verifica se está vazio ou None
                self.add_error(
                    field, 'O enquadramento de Tipo e Subtipo é obrigatório!')
                return cleaned_data

        return cleaned_data

    def clean_excel_file(self):
        """
        Valida o campo de upload de arquivo Excel, garantindo que o tipo MIME
        seja compatível com planilhas válidas.

        Retorna:
            File: Arquivo validado.

        Lança:
            ValidationError: Se o arquivo não for um Excel válido.
        """
        excel_file = self.cleaned_data.get('excel_file')
        if excel_file:
            mime_type, _ = mimetypes.guess_type(excel_file.name)
            if mime_type not in ['application/vnd.ms-excel',
                                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:  # noqa E503
                raise ValidationError("O arquivo deve ser um Excel válido.")
        return excel_file


class FormFluxoCaixaBaseView(FormViewBase):
    """
    View base para manipulação de formulários de fluxo de caixa. Permite
    criação, edição e upload de dados com integração à sessão do usuário.
    """
    model = DespesaReceita
    form_class = FluxoCaixaForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:fluxo_caixa_confirmar')
    title = None
    context_object_name = 'fluxo_caixa'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Recupera o queryset do modelo com cache aplicado.

        Retorna:
            QuerySet: Conjunto de objetos do modelo DespesaReceita.
        """
        return get_cached_queryset(self.model, 'fluxo_caixa_queryset')

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Processa requisições GET e inicializa objeto vazio para formulário.

        Retorna:
            HttpResponse: Resposta com o formulário renderizado.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Retorna o objeto a ser editado com base no parâmetro 'pk' da URL.
        Se 'pk' não for fornecido, retorna None.

        Retorna:
            DespesaReceita | None
        """
        pk = self.kwargs.get('pk')
        if pk:
            return DespesaReceita.objects.filter(pk=pk).first()
        return None

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Processa dados válidos do formulário. Codifica o conteúdo do arquivo
        Excel (se presente) e armazena na sessão. Salva dados limpos.

        Retorna:
            HttpResponseRedirect: Redireciona após sucesso.
        """
        print('FORMULÁRIO VÁLIDO')
        # self.object = form.save(commit=False)

        # Obtém os dados do formulário
        if self.form_data is None:
            self.form_data = form.cleaned_data

        # Converte objetos datetime para strings
        for key, value in self.form_data.items():
            if isinstance(value, datetime):
                self.form_data[key] = value.isoformat()

        # Verifica se há um arquivo Excel no formulário
        excel_file = form.cleaned_data.get('excel_file')
        if excel_file:
            try:
                # Lê o conteúdo do arquivo e converte para Base64
                excel_file_content = excel_file.read()
                excel_file_base64 = base64.b64encode(
                    excel_file_content).decode('utf-8')

                # Armazena o arquivo em Base64 na sessão
                self.request.session['excel_file'] = excel_file_base64

                self.request.session['message'] = {
                    'type': 'success',
                    'text': 'Dados salvos com sucesso!',
                }
            except Exception as e:
                print(f"Erro ao processar o arquivo Excel: {e}")

            # Armazena os dados do formulário na sessão
            # self.request.session['form_data'] = self.form_data
            # # return redirect(self.success_url)
            # return HttpResponseRedirect(self.success_url)
            #     # Armazena os dados do formulário na sessão
            self.request.session['form_data'] = self.form_data
            return redirect(self.success_url)

    # Renderiza o template com os dados do formulário preenchidos e os erros

    def form_invalid(self, form):
        """
        Processa formulário inválido. Converte valores datetime para string
        e armazena os dados na sessão para reuso e exibição de erro.

        Retorna:
            HttpResponse: Resposta renderizada com erros.
        """
        print('FORMULÁRIO INVÁLIDO')
        # Captura os dados do formulário inválido
        form_data = form.cleaned_data

        print('form_invalid.form_data:', form_data)

        # Converte objetos datetime para strings
        for key, value in form_data.items():
            if isinstance(value, datetime):
                form_data[key] = value.isoformat()
                print('form_invalid.isinstance(value, datetime)==True')

        # Salva os dados na sessão
        self.request.session['form_data'] = form_data

        self.request.session['message'] = {
            'type': 'error',
            'text': 'Erro ao salvar os dados. Verifique o formulário.',
        }
        # return self.render_to_response(self.get_context_data(form=form))
        return self.render_to_response(self.get_context_data(form=form))

    def update_context(self, ctx):
        """
        Atualiza o contexto com dados da base e dados da sessão (formulário).

        Retorna:
            dict: Contexto atualizado.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'plano_de_contas', 'valor'))

        # Recupera dados armazenados na sessão
        form_data = self.request.session.get('form_data', {})
        print("Dados recuperados da sessão:", form_data)  # Para debug

        ctx.update({
            'data': json.dumps(data, cls=JSONEncoderCustom),
            'form_data': json.dumps(form_data, default=str)
        })

        return ctx


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormFluxoCaixaView(FormFluxoCaixaBaseView):
    """
    View responsável por apresentar o formulário para criação de um novo
    registro de fluxo de caixa. Limpa a sessão ao iniciar.
    """
    title = 'Novo Registro de Fluxo de Caixa'
    ambiente = 'fluxo_caixa.html'
    controles_ambiente = 'fluxo_caixa.js'
    estilo_ambiente = 'forms/fluxo_caixa.css'

    def dispatch(self, request, *args, **kwargs):
        """
        Remove dados de formulário anteriores da sessão antes de continuar.

        Retorna:
            HttpResponse: Requisição processada normalmente.
        """
        request.session.pop('form_data', None)
        return super().dispatch(request, *args, **kwargs)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormFluxoCaixaListView(FormFluxoCaixaBaseView):
    """
    View que permite revisar e confirmar os dados de fluxo de caixa antes
    de persistí-los no banco de dados.
    """
    title = 'Confirmar Registro de Fluxo de Caixa'
    ambiente = 'fluxo_caixa_list.html'
    controles_ambiente = 'fluxo_caixa_list.js'
    estilo_ambiente = 'forms/fluxo_caixa_list.css'
    form_class = FluxoCaixaForm

    # def normalize_keys(self, item):
    #     key_map = {
    #         "DATA": "data",
    #         "P. DE CONTAS": "plano_de_contas",
    #         "VALOR": "valor",
    #         "TIPO": "tipo",
    #         "SUBTIPO": "subtipo",
    #         "CATEGORIA": "categoria"
    #     }
    #     # Converte chaves conhecidas
    #     return {key_map.get(k, k): v for k, v in item.items()}

    # def post(self, request, *args, **kwargs):
    #     try:
    #         print("Recebendo dados da requisição...")
    #         data = json.loads(request.body)
    #         print("Dados recebidos:", data)

    #         # Verifica se a lista de dados está vazia
    #         if not data or not isinstance(data, list):
    #             print("Lista de dados vazia ou inválida.")
    #             return JsonResponse({"status": "error",
    #                                  "errors": "Nenhum dado enviado."},
    #                                 status=400)

    #         current_time = '00:00:00'
    #         errors = {}  # Dicionário para armazenar erros de validação

    #         if isinstance(data, list):
    #             for item in data:
    #                 # Converte as chaves para o formato correto
    #                 item = normalize_keys(item)
    #                 print('Item normalizado:', item)

    #                 # Cria uma instância do formulário com os dados
    #                 # normalizados
    #                 form = FluxoCaixaForm(data=item)

    #                 # Valida o formulário
    #                 if not form.is_valid():
    #                     print("Erros de validação:", form.errors)
    #                     return JsonResponse({"status": "error",
    #                                          "errors": form.errors},
    #                                         status=400)

    #                 print('Formulário válido!')

    #                 # Formata a data para o padrão do banco de dados
    #                 item["data"] = datetime.strptime(
    #                     item["data"], '%d/%m/%Y').strftime('%Y-%m-%d') + ' ' + current_time  # noqa E503

    #                 # Salva o registro no banco de dados usando o formulário
    #                 fluxo = form.save(commit=False)
    #                 fluxo.data = item["data"]  # Atualiza a data formatada
    #                 fluxo.save()
    #                 # fluxo = DespesaReceita.objects.create(
    #                 #     data=item["data"],
    #                 #     plano_de_contas=item["plano_de_contas"],
    #                 #     valor=item["valor"],
    #                 #     tipo=item["tipo"],
    #                 #     subtipo=item["subtipo"],
    #                 #     categoria=item["categoria"],
    #                 # )
    #                 print("Registro salvo no banco de dados:", fluxo)

    #             # 🔥 Limpar apenas os dados recebidos na sessão
    #             # for item in data:
    #             #     # Normaliza chaves para garantir consistência
    #             #     item = normalize_keys(item)
    #             #     for key in item.keys():
    #             #         if key in request.session:
    #             #             # Remove apenas as chaves enviadas no JSON
    #             #             del request.session[key]

    #             return JsonResponse({"status": "success"}, status=201)

    #         print("Formato de dados inválido.")
    #         return JsonResponse({"status": "error",
    #                             "errors": "Formato de dados inválido."},
    #                             status=400)

    #     except json.JSONDecodeError:
    #         print("Erro de decodificação JSON")
    #         return JsonResponse({"status": "error",
    #                             "errors": "JSON inválido."},
    #                             status=400)

    #     except Exception as e:
    #         print("Erro geral:", str(e))
    #         return JsonResponse({"status": "error",
    #                             "errors": str(e)},
    #                             status=500)

    def post(self, request, *args, **kwargs):
        """
        Processa uma lista de registros recebidos via JSON. Valida cada item
        usando o formulário. Salva registros válidos e retorna erros em caso
        de falhas individuais.

        Retorna:
            JsonResponse: Resposta de sucesso ou erro detalhado por item.
        """
        try:
            print("Recebendo dados da requisição...")
            data = json.loads(request.body)
            print("Dados recebidos:", data)

            # Verifica se a lista de dados está vazia
            if not data or not isinstance(data, list):
                print("Lista de dados vazia ou inválida.")
                return JsonResponse({"status": "error",
                                     "errors": "Nenhum dado enviado."},
                                    status=400)

            current_time = '00:00:00'
            errors = {}  # Dicionário para armazenar erros de validação

            for index, item in enumerate(data):
                # Normaliza as chaves antes de validar
                item = normalize_keys(item)
                print('Item normalizado:', item)

                # Cria uma instância do formulário com os dados normalizados
                form = FluxoCaixaForm(data=item)

                # Valida o formulário
                if not form.is_valid():
                    print("Erros de validação:", form.errors)
                    # Adiciona os erros ao dicionário de erros
                    for field, field_errors in form.errors.items():
                        errors[f"item_{index}_{field}"] = field_errors
                    continue  # Continua para o próximo item, sem salvar este

                # Formata a data para o padrão do banco de dados
                item["data"] = datetime.strptime(
                    item["data"], '%d/%m/%Y').strftime('%Y-%m-%d') + \
                    ' ' + current_time

                # Salva o registro no banco de dados usando o formulário
                fluxo = form.save(commit=False)
                fluxo.data = item["data"]  # Atualiza a data formatada
                fluxo.save()
                print("Registro salvo no banco de dados:", fluxo)

            # Se houver erros, retorna os erros no formato JSON
            if errors:
                return JsonResponse({"status": "error",
                                     "errors": errors},
                                    status=400)

            return JsonResponse({"status": "success"}, status=201)

        except json.JSONDecodeError:
            print("Erro de decodificação JSON")
            return JsonResponse({"status": "error",
                                 "errors": "JSON inválido."},
                                status=400)

        except Exception as e:
            print("Erro geral:", str(e))
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
        Método auxiliar que salva um único registro de fluxo de caixa a
        partir dos dados JSON enviados na requisição.

        Retorna:
            JsonResponse: Indica sucesso ou erro da operação.
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                fluxo = DespesaReceita(**data)  # Cria uma instância do modelo
                fluxo.save()  # Salva no banco de dados
                return JsonResponse({"status": "success", "message":
                                     "Registro de Cooperado salvo com sucesso!"
                                     })
            except Exception as e:
                return JsonResponse({"status": "error", "message":
                                     str(e)}, status=400)
        return JsonResponse({"status": "error",
                             "message": "Método não permitido."}, status=405)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormFluxoCaixaEditView(FormFluxoCaixaBaseView):
    """
    View para edição de registros de fluxo de caixa existentes.
    Herda lógica da view base.
    """
    title = 'Editar Novo Registro de Fluxo de Caixa'
    ambiente = 'fluxo_caixa.html'
    controles_ambiente = 'fluxo_caixa.js'
    estilo_ambiente = 'forms/fluxo_caixa.css'


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormFluxoCaixaDeleteView(FormFluxoCaixaBaseView):
    """
    View responsável por deletar um registro de fluxo de caixa.
    Após exclusão, limpa o cache para garantir consistência.
    """

    def delete(self, request, *args, **kwargs):
        """
        Realiza a exclusão do objeto e limpa o cache relacionado.

        Retorna:
            HttpResponse: Resposta HTTP padrão para exclusão.
        """
        response = super().delete(request, *args, **kwargs)
        # Limpa o cache após a exclusão
        cache.delete('fluxo_caixa_queryset')
        return response
