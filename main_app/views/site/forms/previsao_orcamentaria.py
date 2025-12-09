import json
from django import forms
from django.core.cache import cache
from ....models import PrevisaoOrcamentaria
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
def salvar_previsao_orcamentaria_na_sessao(request):
    """
    Salva os dados do formulário de previsão orçamentária na sessão
    do usuário autenticado, enviados via JSON em uma requisição POST.

    Retorna:
        JsonResponse: status de sucesso ou erro com mensagem apropriada.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print('Dados sendo salvos na sessão:', data)
            request.session['form_data'] = data
            return JsonResponse({'status': 'success'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error',
                                 'message': 'JSON inválido'}, status=400)
    return JsonResponse({'status': 'error',
                         'message': 'Método não permitido'}, status=405)

# Recupera o queryset e o armazena em cache por 15 minutos


class PrevisaoOrcamentariaForm(forms.ModelForm):
    """
    Formulário para o modelo PrevisaoOrcamentaria, com validações
    adicionais para campos obrigatórios e valores válidos.
    """
    class Meta:
        model = PrevisaoOrcamentaria
        fields = ['data', 'tipo', 'subtipo', 'categoria', 'item',
                  'valor', 'observacao'
                  ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Valida campos obrigatórios e verifica se o valor numérico
        é não negativo.
        """
        cleaned_data = super().clean()

        # Validações de campo
        for field in ['tipo', 'subtipo', 'categoria',
                      'item']:
            if len(cleaned_data.get(field, '')) == 0:
                self.add_error(field, 'Informação obrigatória.')

        # Validação do campo `data`
        data = cleaned_data.get('data')
        print('data:', data)

        # Validação do campo `valor`
        valor = cleaned_data.get('valor')
        if valor is None or is_negative_number(valor):
            self.add_error(
                'valor', 'Requer um valor maior ou igual a R$ 0,00.')

        return cleaned_data


class FormPrevisaoOrcamentariaBaseView(FormViewBase):
    """
    View base para criação, edição e exibição de formulários de
    previsão orçamentária. Define comportamento padrão de contexto,
    validação, salvamento e redirecionamento.
    """
    model = PrevisaoOrcamentaria
    form_class = PrevisaoOrcamentariaForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:previsao_orcamentaria_list')
    title = None
    context_object_name = 'previsao_orcamentaria'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Retorna o queryset do modelo usando cache.
        """
        return get_cached_queryset(self.model,
                                   'previsao_orcamentaria_queryset'
                                   )

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Define self.object como None para formulários de criação.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Retorna um objeto existente para edição, ou None para novo registro.
        """
        pk = self.kwargs.get('pk')
        if pk:
            return PrevisaoOrcamentaria.objects.filter(pk=pk).first()
        return None

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Manipula o formulário válido, armazena os dados na sessão e
        redireciona para a URL de sucesso.
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
        Manipula o formulário inválido, armazena os dados com erros
        na sessão e renderiza novamente o template.
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
        return self.render_to_response(self.get_context_data(form=form))

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados do formulário e
        com o dataset serializado para uso no frontend.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'tipo', 'subtipo', 'categoria', 'item',
                              'valor', 'observacao')
                    )

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
class FormPrevisaoOrcamentariaView(FormPrevisaoOrcamentariaBaseView):
    """
    View de criação de uma nova previsão orçamentária.
    Inicializa com ambiente, controles e estilo específicos.
    Limpa os dados da sessão no início da navegação.
    """
    title = 'Novo Registro de Previsão Orçamentária'
    ambiente = 'previsao_orcamentaria.html'
    controles_ambiente = 'previsao_orcamentaria.js'
    estilo_ambiente = 'forms/previsao_orcamentaria.css'

    def dispatch(self, request, *args, **kwargs):
        """
        Remove dados armazenados anteriormente na sessão ao iniciar a view.
        """
        # Limpa a sessão ao iniciar a view
        request.session.pop('form_data', None)
        return super().dispatch(request, *args, **kwargs)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormPrevisaoOrcamentariaListView(FormPrevisaoOrcamentariaBaseView):
    """
    View para confirmar e salvar previsões orçamentárias a partir
    de dados enviados via requisição JSON.
    """
    title = 'Confirmar Registro de Previsão Orçamentaria'
    ambiente = 'previsao_orcamentaria_list.html'
    controles_ambiente = 'previsao_orcamentaria_list.js'
    estilo_ambiente = 'forms/previsao_orcamentaria_list.css'

    def post(self, request, *args, **kwargs):
        """
        Processa a requisição POST contendo os dados da previsão orçamentária.
        Verifica se os campos obrigatórios estão preenchidos,
        ajusta o campo data, e salva no banco de dados.
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            # Substitui '00:00:00' pela hora atual em data['data']
            current_time = datetime.now().strftime('%H:%M:%S')
            data['data'] = data['data'].replace('00:00:00', current_time)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") \
                    or not data.get("tipo") \
                    or not data.get("subtipo") \
                    or not data.get("categoria") \
                    or not data.get("item") \
                    or not data.get("valor"):

                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            previsao = PrevisaoOrcamentaria.objects.create(
                data=data["data"],
                tipo=data["tipo"],
                subtipo=data["subtipo"],
                categoria=data["categoria"],
                item=data["item"],
                valor=data["valor"],
                observacao=data["observacao"],
            )

            return JsonResponse({"status": "success",
                                 "id": previsao.id}, status=201)
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
    def salvar_previsao_orcamentaria_na_sessao(request):
        """
        Salva os dados recebidos via JSON diretamente no banco de dados,
        criando uma nova instância do modelo PrevisaoOrcamentaria.
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                # Cria uma instância do modelo
                previsao = PrevisaoOrcamentaria(**data)
                previsao.save()  # Salva no banco de dados
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
class FormPrevisaoOrcamentariaEditView(FormPrevisaoOrcamentariaBaseView):
    """
    View para edição de registros existentes de previsão orçamentária.
    Reutiliza a estrutura e o estilo da view de criação.
    """
    title = 'Editar Novo Registro de Previsão Orçamentária'
    ambiente = 'previsao_orcamentaria.html'
    controles_ambiente = 'previsao_orcamentaria.js'
    estilo_ambiente = 'forms/previsao_orcamentaria.css'


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormPrevisaoOrcamentariaDeleteView(FormPrevisaoOrcamentariaBaseView):
    """
    View responsável por excluir um registro de previsão orçamentária.
    Após a exclusão, o cache associado é invalidado.
    """

    def delete(self, request, *args, **kwargs):
        """
        Executa a exclusão do objeto e limpa o cache relacionado ao queryset.
        """
        response = super().delete(request, *args, **kwargs)
        # Limpa o cache após a exclusão
        cache.delete('previsao_orcamentaria_queryset')
        return response
