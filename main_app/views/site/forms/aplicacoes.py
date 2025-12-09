import json
from django import forms
from django.core.cache import cache
from ....models import Aplicacoes
from django.urls import reverse_lazy
from .form_base import FormViewBase
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from collections import defaultdict
from utils.strings import is_negative_number
from utils.cache_helpers import get_cached_queryset
from datetime import datetime
from django.http import JsonResponse
from django.shortcuts import redirect
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@login_required(login_url='colaborador:login', redirect_field_name='next')
def salvar_aplicacao_na_sessao(request):
    """
    Salva os dados da aplicação recebidos via requisição POST na sessão
    do usuário.

    Espera um corpo JSON contendo os dados do formulário. Em caso de sucesso,
    armazena os dados em `request.session['form_data']`.

    Retorna:
        JsonResponse: Status da operação (success ou error).
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


class AplicacoesForm(forms.ModelForm):
    """
    Formulário para o modelo Aplicacoes, com validações personalizadas
    nos campos de entrada.
    """
    class Meta:
        model = Aplicacoes
        fields = ['data', 'banco', 'conta', 'aplicacao', 'valor', 'origem']

    def __init__(self, *args, **kwargs):
        """
        Inicializa o formulário e define um dicionário para armazenar
        erros personalizados.
        """
        super().__init__(*args, **kwargs)

        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Realiza validações nos campos do formulário.

        Valida o comprimento de campos de texto, o tipo da data e se
        o valor é um número não-negativo.

        Retorna:
            dict: Dados limpos e validados.
        """
        cleaned_data = super().clean()

        print('cleaned_data:', cleaned_data)

        # Validações de campo
        for field in ['banco', 'conta', 'aplicacao', 'origem']:
            if len(cleaned_data.get(field, '')) < 2:
                self.add_error(field, 'Digite pelo menos 2 caracteres.')

        # Validação do campo `data`
        data = cleaned_data.get('data')
        if not data or not isinstance(data, datetime):
            self.add_error('data', 'Data inválida. Use o formato DD/MM/AAAA.')

        # Validação do campo `valor`
        valor = cleaned_data.get('valor')
        if valor is None or is_negative_number(valor):
            self.add_error(
                'valor', 'Requer um valor maior ou igual a R$ 0,00.')

        return cleaned_data


class FormAplicacoesBaseView(FormViewBase):
    """
    View base para o formulário de Aplicações. Utiliza o modelo Aplicacoes
    para criar ou editar registros. Usa cache e salva dados em sessão.

    Atributos:
        model: Modelo utilizado (Aplicacoes).
        form_class: Classe de formulário usada.
        success_url: URL de redirecionamento após sucesso.
        context_object_name: Nome do objeto no contexto.
    """
    model = Aplicacoes
    form_class = AplicacoesForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:aplicacoes_list')
    title = None
    context_object_name = 'aplicacoes'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Recupera o queryset do modelo Aplicacoes com caching.

        Retorna:
            QuerySet: Lista de objetos Aplicacoes.
        """
        return get_cached_queryset(self.model, 'aplicacoes_queryset')

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Define self.object como None para exibir um formulário vazio.

        Retorna:
            HttpResponse: Página com o formulário renderizado.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Recupera o objeto a ser editado com base no parâmetro 'pk'.

        Retorna:
            Aplicacoes | None: Instância do objeto ou None para criação.
        """
        pk = self.kwargs.get('pk')
        if pk:
            return Aplicacoes.objects.filter(pk=pk).first()
        return None

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Manipula o comportamento quando o formulário é válido.

        Salva os dados no banco e armazena-os na sessão para reutilização.

        Retorna:
            HttpResponseRedirect: Redirecionamento após o sucesso.
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
        Manipula o comportamento quando o formulário é inválido.

        Salva os dados inválidos na sessão para reaproveitamento e renderiza
        a resposta com os erros.

        Retorna:
            HttpResponse: Página com os erros e formulário preenchido.
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
        Atualiza o contexto do template com os dados e o conteúdo da sessão.

        Retorna:
            dict: Contexto atualizado com dados da aplicação.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'banco', 'conta',
                              'aplicacao', 'valor', 'origem'))

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
class FormAplicacoesView(FormAplicacoesBaseView):
    """
    View responsável por exibir o formulário para novo registro de aplicação.

    Limpa dados de sessão ao iniciar.
    """
    title = 'Novo Registro de Aplicação'
    ambiente = 'aplicacoes.html'
    controles_ambiente = 'aplicacoes.js'
    estilo_ambiente = 'forms/aplicacoes.css'

    def dispatch(self, request, *args, **kwargs):
        """
        Limpa os dados do formulário da sessão antes de processar a requisição.

        Retorna:
            HttpResponse: Resultado do processamento padrão.
        """
        # Limpa a sessão ao iniciar a view
        request.session.pop('form_data', None)
        return super().dispatch(request, *args, **kwargs)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormAplicacoesListView(FormAplicacoesBaseView):
    """
    View para exibir e confirmar o registro de uma aplicação financeira.

    Recebe os dados via POST e os salva no banco de dados.
    """
    title = 'Confirmar Registro de Aplicação'
    ambiente = 'aplicacoes_list.html'
    controles_ambiente = 'aplicacoes_list.js'
    estilo_ambiente = 'forms/aplicacoes_list.css'

    def post(self, request, *args, **kwargs):
        """
        Processa uma requisição POST contendo os dados da aplicação.

        Substitui hora zerada por hora atual, valida campos e salva
        os dados no banco.

        Retorna:
            JsonResponse: Resultado da operação (sucesso ou erro).
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            # Substitui '00:00:00' pela hora atual em data['data']
            current_time = datetime.now().strftime('%H:%M:%S')
            data['data'] = data['data'].replace('00:00:00', current_time)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") or not data.get("valor") or not data.get("banco") or not data.get("conta") or not data.get("aplicacao") or not data.get("origem"):  # noqa E503
                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            aplicacao = Aplicacoes.objects.create(
                banco=data["banco"],
                conta=data["conta"],
                aplicacao=data["aplicacao"],
                data=data["data"],
                valor=data["valor"],
                origem=data["origem"],
            )

            return JsonResponse({"status": "success",
                                 "id": aplicacao.id}, status=201)
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
    def salvar_aplicacao_na_sessao(request):
        """
        Função auxiliar para salvar dados de aplicação no banco de dados.

        Espera uma requisição POST com os dados da aplicação no corpo JSON.
        Cria um novo objeto Aplicacoes e retorna uma resposta JSON.

        Retorna:
            JsonResponse: Status da operação (success ou error).
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                aplicacao = Aplicacoes(**data)  # Cria uma instância do modelo
                aplicacao.save()  # Salva no banco de dados
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
class FormAplicacoesEditView(FormAplicacoesBaseView):
    """
    View para editar um registro existente de aplicação financeira.
    """
    title = 'Editar Novo Registro de Aplicação'
    ambiente = 'aplicacoes.html'
    controles_ambiente = 'aplicacoes.js'
    estilo_ambiente = 'forms/aplicacoes.css'


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormAplicacoesDeleteView(FormAplicacoesBaseView):
    """
    View para excluir um registro de aplicação financeira.

    Após exclusão, o cache do queryset de aplicações é limpo.
    """

    def delete(self, request, *args, **kwargs):
        """
        Executa a exclusão do objeto e limpa o cache correspondente.

        Retorna:
            HttpResponse: Resultado padrão da exclusão.
        """
        response = super().delete(request, *args, **kwargs)
        cache.delete('aplicacoes_queryset')  # Limpa o cache após a exclusão
        return response
