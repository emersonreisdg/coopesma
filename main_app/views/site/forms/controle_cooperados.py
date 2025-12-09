import json
from django import forms
from django.core.cache import cache
from ....models import Controle
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
def salvar_controle_cooperados_na_sessao(request):
    """
    Salva os dados enviados via POST na sessão do usuário.

    Espera um corpo JSON contendo os dados do formulário.
    Retorna uma resposta JSON com status de sucesso ou erro.
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


class ControleCooperadosForm(forms.ModelForm):
    """
    Formulário do modelo Controle com validações específicas
    nos campos de entrada.
    """
    class Meta:
        model = Controle
        fields = ['data', 'cooperado', 'aluno', 'turma', 'cobranca_receita',
                  'plano_desconto', 'beneficios', 'rateio',
                  'desconto_percentual', 'desconto', 'valor_liquido',
                  'livros', 'numero_parcelas', 'soma_livros', 'indicou'
                  ]

    def __init__(self, *args, **kwargs):
        """
        Inicializa o formulário e define estrutura para erros personalizados.
        """
        super().__init__(*args, **kwargs)

        self._my_errors = defaultdict(list)

    def clean(self):
        """
        Valida os dados do formulário antes de salvar.

        Verifica se campos obrigatórios foram preenchidos
        e se valores numéricos são válidos.
        """
        cleaned_data = super().clean()

        # Validações de campo
        for field in ['cooperado', 'aluno', 'turma', 'cobranca_receita']:
            if len(cleaned_data.get(field, '')) == 0:
                self.add_error(field, 'Informação obrigatória.')

        # Validação do campo `data`
        data = cleaned_data.get('data')
        print('data:', data)
        # Transformar a variável data em um datetime no formato desejado
        # date_str = f"02/01/{data}T00:00:00"
        # data = datetime.strptime(date_str, "%d/%m/%YT%H:%M:%S")
        # print('data:', data)

        # if not data or not isinstance(data, datetime):
        #     self.add_error('data',
        # 'Data inválida. Use o formato DD/MM/AAAA.')

        # Validação do campo `data`
        # data = cleaned_data.get('data')
        # if data is None or is_negative_number(data):
        #     self.add_error(
        #         'data', 'Ano inválido.')

        # Validação do campo `rateio`
        rateio = cleaned_data.get('rateio')
        if rateio is None or is_negative_number(rateio):
            self.add_error(
                'rateio', 'Requer um valor maior ou igual a R$ 0,00.')

        # Validação do campo `desconto_percentual`
        desconto_percentual = cleaned_data.get('desconto_percentual')
        if desconto_percentual is None or is_negative_number(desconto_percentual):  # noqa E503
            self.add_error(
                'desconto_percentual', 'Requer um valor maior ou igual a 0,0%.'
            )

        # Validação do campo `livros`
        livros = cleaned_data.get('livros')
        if livros is None or is_negative_number(livros):
            self.add_error(
                'livros', 'Requer um valor maior ou igual a R$ 0,00.')

        # Validação do campo `numero_parcelas`
        numero_parcelas = cleaned_data.get('numero_parcelas')
        if numero_parcelas is None or is_negative_number(numero_parcelas):
            self.add_error(
                'numero_parcelas', 'Requer um valor de 1 a 12.')

        return cleaned_data


class FormControleCooperadosBaseView(FormViewBase):
    """
    View base para criar, editar ou visualizar registros de cooperados.

    Trabalha com o modelo Controle e utiliza sessão e cache para otimização.
    """
    model = Controle
    form_class = ControleCooperadosForm
    template_name = 'coopesma/pages/form.html'
    # Redireciona após salvar
    success_url = reverse_lazy('coopesma:controle_cooperados_list')
    title = None
    context_object_name = 'controle_cooperados'
    tipo_ambiente = 'form'
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = False
    form_data = None

    def get_queryset(self):
        """
        Recupera e armazena em cache o queryset de Controle.

        Retorna:
            QuerySet: Lista de registros de Controle.
        """
        return get_cached_queryset(self.model, 'controle_cooperados_queryset')

    # Define `object` como `None` para formulários vazios em requisições GET

    def get(self, request, *args, **kwargs):
        """
        Define `object` como None para renderizar um formulário vazio.

        Retorna:
            HttpResponse: Página com formulário vazio.
        """
        self.object = None
        return super().get(request, *args, **kwargs)

    def get_object(self, queryset=None):
        """
        Retorna o objeto a ser editado ou None se for um novo registro.

        Retorna:
            Controle | None: Objeto existente ou None.
        """
        pk = self.kwargs.get('pk')
        if pk:
            return Controle.objects.filter(pk=pk).first()
        return None

    # Salva o formulário no banco de dados quando o envio é válido
    def form_valid(self, form):
        """
        Manipula o comportamento quando o formulário é válido.

        Salva os dados no banco e armazena na sessão para persistência.

        Retorna:
            HttpResponseRedirect: Redirecionamento após salvar.
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
        Executa ações quando o formulário está inválido.

        Salva os dados incorretos na sessão para reuso e debug.

        Retorna:
            HttpResponse: Página com erros renderizados.
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
        Atualiza o contexto do template com os dados da view.

        Inclui os registros e dados da sessão.

        Retorna:
            dict: Contexto atualizado.
        """
        ctx = super().update_context(ctx)
        qs = self.get_queryset()
        data = list(qs.values('data', 'cooperado', 'aluno',
                              'turma', 'cobranca_receita',
                              'plano_desconto', 'beneficios',
                              'rateio', 'desconto_percentual',
                              'desconto', 'valor_liquido',
                              'livros', 'numero_parcelas',
                              'soma_livros', 'indicou'
                              )
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
class FormControleCooperadosView(FormControleCooperadosBaseView):
    """
    View para exibição do formulário de novo registro de cooperado.

    Limpa a sessão ao iniciar a requisição.
    """
    title = 'Novo Registro de Cooperado'
    ambiente = 'controle_cooperados.html'
    controles_ambiente = 'controle_cooperados.js'
    estilo_ambiente = 'forms/controle_cooperados.css'

    def dispatch(self, request, *args, **kwargs):
        """
        Limpa os dados da sessão antes de renderizar o formulário.

        Retorna:
            HttpResponse: Resposta padrão do Django.
        """
        # Limpa a sessão ao iniciar a view
        request.session.pop('form_data', None)
        return super().dispatch(request, *args, **kwargs)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormControleCooperadosListView(FormControleCooperadosBaseView):
    """
    View para confirmação do registro do cooperado.

    Realiza validações e persistência do registro via POST.
    """
    title = 'Confirmar Registro de Cooperado'
    ambiente = 'controle_cooperados_list.html'
    controles_ambiente = 'controle_cooperados_list.js'
    estilo_ambiente = 'forms/controle_cooperados_list.css'

    def post(self, request, *args, **kwargs):
        """
        Processa dados enviados via JSON para criação de registro.

        Valida dados obrigatórios, ajusta horário e salva no banco.

        Retorna:
            JsonResponse: Resultado da operação.
        """
        try:
            # Recebe os dados do corpo da requisição
            data = json.loads(request.body)

            # Substitui '00:00:00' pela hora atual em data['data']
            current_time = datetime.now().strftime('%H:%M:%S')
            data['data'] = data['data'].replace('00:00:00', current_time)

            print('dado recebido:', data)

            # Verifica se os dados estão completos
            if not data.get("data") or not data.get("cooperado") \
                    or not data.get("aluno") or not data.get("turma") \
                    or not data.get("cobranca_receita") \
                    or not data.get("plano_desconto") \
                    or not data.get("beneficios") or not data.get("rateio") \
                    or not data.get("desconto_percentual") \
                    or not data.get("desconto") \
                    or not data.get("valor_liquido") \
                    or not data.get("livros") \
                    or not data.get("numero_parcelas") \
                    or not data.get("soma_livros"):

                return JsonResponse({"status": "error",
                                     "errors": "Dados incompletos."},
                                    status=400)

            # Salva no banco de dados
            aplicacao = Controle.objects.create(
                data=data["data"],
                cooperado=data["cooperado"],
                aluno=data["aluno"],
                turma=data["turma"],
                cobranca_receita=data["cobranca_receita"],
                plano_desconto=data["plano_desconto"],
                beneficios=data["beneficios"],
                rateio=data["rateio"],
                desconto_percentual=data["desconto_percentual"],
                desconto=data["desconto"],
                valor_liquido=data["valor_liquido"],
                livros=data["livros"],
                numero_parcelas=data["numero_parcelas"],
                soma_livros=data["soma_livros"],
                # indicado=data["indicado"],
                indicou=data["indicou"],
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
    def salvar_controle_cooperados_na_sessao(request):
        """
        Recebe dados via POST e salva diretamente no banco de dados.

        Utiliza o modelo Controle. Deve receber dados JSON.

        Retorna:
            JsonResponse: Status da operação (success ou error).
        """
        if request.method == "POST":
            try:
                # Lê os dados enviados no corpo da requisição
                data = json.loads(request.body)
                aplicacao = Controle(**data)  # Cria uma instância do modelo
                aplicacao.save()  # Salva no banco de dados
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
class FormControleCooperadosEditView(FormControleCooperadosBaseView):
    """
    View para edição de um registro existente de cooperado.
    """
    title = 'Editar Novo Registro de Cooperado'
    ambiente = 'controle_cooperados.html'
    controles_ambiente = 'controle_cooperados.js'
    estilo_ambiente = 'forms/controle_cooperados.css'


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormControleCooperadosDeleteView(FormControleCooperadosBaseView):
    """
    View para deletar um registro de cooperado.

    Limpa o cache correspondente após a exclusão.
    """

    def delete(self, request, *args, **kwargs):
        """
        Executa a exclusão do objeto e limpa o cache.

        Retorna:
            HttpResponse: Resultado da exclusão.
        """
        response = super().delete(request, *args, **kwargs)
        # Limpa o cache após a exclusão
        cache.delete('controle_cooperados_queryset')
        return response
