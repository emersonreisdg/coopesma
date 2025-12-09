import json
from django import forms
from django.core.cache import cache
from ....models import Indicacao
from django.urls import reverse_lazy
from .form_base import FormViewBase
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from collections import defaultdict
# from utils.strings import is_negative_number
from utils.cache_helpers import get_cached_queryset
from datetime import datetime
from django.http import JsonResponse
from django.shortcuts import redirect
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@login_required(login_url='colaborador:login', redirect_field_name='next')
def salvar_indicacao_na_sessao(request):
    """
    Salva os dados da indicação enviados via requisição POST na sessão
    do usuário autenticado.

    Retorna:
        JsonResponse: status de sucesso ou erro conforme o caso.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            request.session['form_data'] = data
            return JsonResponse({'status': 'success'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error',
                                 'message': 'JSON inválido'}, status=400)
    return JsonResponse({'status': 'error',
                         'message': 'Método não permitido'}, status=405)

# Recupera o queryset e o armazena em cache por 15 minutos


class IndicacaoForm(forms.ModelForm):
    """
    Formulário baseado no modelo Indicacao, com validações customizadas
    para os campos obrigatórios e para o campo de data.
    """
    class Meta:
        model = Indicacao
        fields = ['data', 'numero_cooperado', 'cooperado',
                  'numero_cooperado_indicado', 'cooperado_indicado']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Realiza validações personalizadas para os campos obrigatórios e
        formatação da data.
        """
        cleaned_data = super().clean()

        # Validações de campo
        for field in ['numero_cooperado',
                      'cooperado',
                      'numero_cooperado_indicado',
                      'cooperado_indicado'
                      ]:
            some_field = cleaned_data.get('some_field')

            # if some_field is None or some_field == '':
            #     self.add_error(field, "Informação obrigatória.")

            if isinstance(some_field, int) and some_field <= 0:
                self.add_error(field, "Digite um código válido.")

            elif isinstance(some_field, str):
                if not some_field.strip():
                    self.add_error(field, 'Informação obrigatória.')

            # elif len(cleaned_data.get(field, '')) == 0:
            #     self.add_error(field, 'Informação obrigatória.')

        # Validação do campo `data`
        data = cleaned_data.get('data')
        if not data or not isinstance(data, datetime):
            self.add_error('data', 'Data inválida. Use o formato DD/MM/AAAA.')

        # # Validação do campo `valor`
        # valor = cleaned_data.get('valor')
        # if valor is None or is_negative_number(valor):
        #     self.add_error(
        #         'valor', 'Requer um valor maior ou igual a R$ 0,00.')

        return cleaned_data


class FormIndicacaoBaseView(FormViewBase):
    """
    View base abstrata para manipulação do formulário de indicação.
    Herda de FormViewBase e implementa a lógica comum de contexto,
    queryset e comportamento padrão para as views derivadas.
    """
    model = Indicacao
    form_class = IndicacaoForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:indicacao_list')
    title = None
    context_object_name = 'indicacao'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Retorna um queryset cacheado para o modelo de indicação.
        """
        return get_cached_queryset(self.model, 'indicacao_queryset')

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Inicializa o objeto como None para formulários de criação.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Retorna o objeto a ser editado ou None em caso de novo registro.
        """
        pk = self.kwargs.get('pk')
        if pk:
            return Indicacao.objects.filter(pk=pk).first()
        return None

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Trata o salvamento dos dados do formulário quando ele é válido.
        Converte datas e armazena os dados na sessão antes de redirecionar.
        """
        print('FORMULÁRIO VÁLIDO')
        self.object = form.save(commit=False)

        # Obtém os dados do formulário
        if self.form_data is None:
            self.form_data = form.cleaned_data

        # Converte objetos datetime para strings
        for key, value in self.form_data.items():
            if isinstance(value, datetime):
                self.form_data[key] = value.isoformat()

        # Armazena os dados do formulário na sessão
        self.request.session['form_data'] = self.form_data
        return redirect(self.success_url)

    # Renderiza o template com os dados do formulário preenchidos e os erros
    def form_invalid(self, form):
        """
        Lida com formulários inválidos, armazenando os dados na sessão
        e renderizando novamente a página com os erros.
        """
        print('FORMULÁRIO INVÁLIDO')
        # Captura os dados do formulário inválido
        form_data = form.cleaned_data

        # Converte objetos datetime para strings
        for key, value in form_data.items():
            if isinstance(value, datetime):
                form_data[key] = value.isoformat()

        # Salva os dados na sessão
        self.request.session['form_data'] = form_data
        return self.render_to_response(self.get_context_data(form=form))

    def update_context(self, ctx):
        """
        Atualiza o contexto da view com os dados do formulário e do queryset,
        convertendo para JSON serializável.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'numero_cooperado', 'cooperado',
                    'numero_cooperado_indicado', 'cooperado_indicado'))

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
class FormIndicacaoView(FormIndicacaoBaseView):
    """
    View de criação de nova indicação. Redefine o título, o ambiente
    e os arquivos associados ao formulário.

    Limpa a sessão ao iniciar para garantir que não existam dados residuais.
    """
    title = 'Novo Registro de Indicacao'
    ambiente = 'indicacao.html'
    controles_ambiente = 'indicacao.js'
    estilo_ambiente = 'forms/indicacao.css'

    def dispatch(self, request, *args, **kwargs):
        """
        Remove dados anteriores da sessão ao iniciar a view.
        """
        request.session.pop('form_data', None)
        return super().dispatch(request, *args, **kwargs)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormIndicacaoListView(FormIndicacaoBaseView):
    """
    View para confirmação de registros de indicação.
    Processa requisições POST com dados enviados via JSON, valida e salva.
    """
    title = 'Confirmar Registro de Indicacao'
    ambiente = 'indicacao_list.html'
    controles_ambiente = 'indicacao_list.js'
    estilo_ambiente = 'forms/indicacao_list.css'

    def post(self, request, *args, **kwargs):
        """
        Processa os dados recebidos via POST (em JSON), valida os campos,
        formata a data e salva o registro no banco de dados.
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            # Substitui '00:00:00' pela hora atual em data['data']
            current_time = datetime.now().strftime('%H:%M:%S')
            data['data'] = data['data'].replace('00:00:00', current_time)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") or not data.get("numero_cooperado") or not data.get("cooperado") or not data.get("numero_cooperado_indicado") or not data.get("cooperado_indicado"):  # noqa E503
                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            indicacao = Indicacao.objects.create(
                data=data["data"],
                numero_cooperado=data["numero_cooperado"],
                cooperado=data["cooperado"],
                numero_cooperado_indicado=data["numero_cooperado_indicado"],
                cooperado_indicado=data["cooperado_indicado"]
            )

            return JsonResponse({"status": "success",
                                 "id": indicacao.id}, status=201)
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
    def salvar_indicacao_na_sessao(request):
        """
        Cria e salva um novo objeto Indicacao diretamente a partir
        dos dados recebidos via POST, sem passar por formulário.
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                indicacao = Indicacao(**data)  # Cria uma instância do modelo
                indicacao.save()  # Salva no banco de dados
                return JsonResponse({"status": "success", "message":
                                     "Aplicação salva com sucesso!"})
            except Exception as e:
                return JsonResponse({"status": "error", "message":
                                     str(e)}, status=400)
        return JsonResponse({"status": "error",
                             "message": "Método não permitido."}, status=405)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormIndicacaoEditView(FormIndicacaoBaseView):
    """
    View para edição de registros de indicação existentes.
    Reutiliza estrutura e estilo da view de criação.
    """
    title = 'Editar Novo Registro de Indicacao'
    ambiente = 'indicacao.html'
    controles_ambiente = 'indicacao.js'
    estilo_ambiente = 'forms/indicacao.css'


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormIndicacaoDeleteView(FormIndicacaoBaseView):
    """
    View para exclusão de registros de indicação.
    Após a exclusão, limpa o cache associado ao queryset.
    """

    def delete(self, request, *args, **kwargs):
        """
        Executa a exclusão do objeto e remove o cache relacionado.
        """
        response = super().delete(request, *args, **kwargs)
        cache.delete('indicacao_queryset')  # Limpa o cache após a exclusão
        return response
