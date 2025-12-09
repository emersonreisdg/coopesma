from .models import (Aplicacoes, CargosESalarios, Controle, Indicacao,
                     DespesasAdministrativas, ExecucaoOrcamentaria,
                     FluxosDeCaixa, DespesaReceita, HistoricoDeReajustes,
                     HistoricoIndicesFinanceiros, HistoricoMatriculas,
                     HistoricoOrcamentario, Ifes, Matriculas, Ofertas,
                     Parametros, PrevisaoOrcamentaria, ProjecaoFates
                     )
from django.contrib import admin


@admin.action(description='Clonar item selecionado')
def clonar_modelo(modeladmin, request, queryset):
    for obj in queryset:
        obj.pk = None  # Remove a PK para criar um novo objeto
        obj.save()


@admin.register(Aplicacoes)
class AplicacoesAdmin(admin.ModelAdmin):
    list_display = ['data', 'banco',
                    'conta', 'aplicacao', 'valor', 'origem']
    list_display_links = 'data',
    search_fields = 'banco', 'conta', 'aplicacao',  'origem',
    list_filter = 'data', 'banco', 'conta', 'aplicacao', 'origem',
    list_per_page = 10
    ordering = '-data',


@admin.register(CargosESalarios)
class CargosESalariosAdmin(admin.ModelAdmin):
    list_display = ['cargo', 'numero_funcionarios',
                    'carga_horaria', 'salario']
    list_display_links = 'cargo',
    search_fields = 'cargo',
    list_filter = 'cargo',
    list_per_page = 10
    ordering = ['cargo']


@admin.register(Controle)
class ControleAdmin(admin.ModelAdmin):
    list_display = ['data', 'numero_cooperado', 'cooperado', 'aluno', 'turma',
                    'cobranca_receita', 'plano_desconto',
                    'beneficios', 'rateio', 'desconto_percentual',
                    'desconto', 'valor_liquido', 'livros',
                    'numero_parcelas', 'soma_livros', 'indicou'
                    ]
    list_display_links = 'numero_cooperado', 'cooperado',
    search_fields = 'numero_cooperado', 'cooperado', 'aluno', 'turma',
    'cobranca_receita', 'plano_desconto', 'beneficios', 'indicou'
    list_filter = 'cooperado', 'aluno', 'turma',
    list_per_page = 10
    ordering = ['cooperado']


@admin.register(Indicacao)
class IndicacaoAdmin(admin.ModelAdmin):
    list_display = ['data', 'numero_cooperado', 'cooperado',
                    'numero_cooperado_indicado', 'cooperado_indicado'
                    ]
    list_display_links = 'numero_cooperado', 'cooperado',
    'numero_cooperado_indicado', 'cooperado_indicado'
    search_fields = 'cooperado', 'cooperado_indicado'
    list_filter = 'cooperado', 'cooperado_indicado'
    list_per_page = 10
    ordering = ['cooperado']


@admin.register(DespesasAdministrativas)
class DespesasAdministrativasAdmin(admin.ModelAdmin):
    list_display = ['data', 'descricao', 'valor',
                    ]
    list_display_links = 'descricao',
    search_fields = 'descricao',
    list_filter = 'descricao',
    list_per_page = 10
    ordering = ['-data']


@admin.register(ExecucaoOrcamentaria)
class ExecucaoOrcamentariaAdmin(admin.ModelAdmin):
    list_display = ['data', 'receitas', 'mensalidade', 'receitas_financeiras',
                    'capital_social', 'acordo_judicial', 'outras_receitas',
                    'aluguel_cantina_e_outros', 'livros', 'despesas',
                    'despesas_administrativas', 'ordenados_e_salarios',
                    'ordenados_salarios_docentes',
                    'ordenados_salarios_adm_apoio', 'despesas_ensino',
                    'material_didativo', 'devolucao_mensalidade',
                    'beneficios', 'plano_saude', 'vale_transporte',
                    'vale_alimentacao', 'material_lanche_agua_cafe',
                    'seguro_funcionarios', 'seguro_funcionarios',
                    'impostos', 'darf', 'dua', 'encargos_trabalhistas',
                    'fgts', 'inss', 'manutencao_instalacoes',
                    'material_construcao', 'marketing', 'despesas_servicos',
                    'percentual_despesas_servicos', 'despesas_operacionais',
                    'percentual_despesas_operacionais', 'depesas_financeiras',
                    'percentual_despesas_financeiras'
                    ]
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(FluxosDeCaixa)
class FluxosDeCaixaAdmin(admin.ModelAdmin):
    list_display = ['data', 'plano_de_contas', 'valor']
    list_display_links = 'data', 'plano_de_contas',
    search_fields = 'data', 'plano_de_contas',
    list_filter = 'data', 'plano_de_contas',
    list_per_page = 10
    ordering = ['-data']


@admin.register(DespesaReceita)
class DespesaReceitaAdmin(admin.ModelAdmin):
    list_display = ['data',
                    'plano_de_contas',
                    'valor',
                    'tipo',
                    'subtipo',
                    'categoria'
                    ]
    actions = ['delete_selected']  # Habilita a ação de exclusão em massa
    list_display_links = 'data', 'plano_de_contas', 'tipo', 'subtipo',
    search_fields = 'data', 'plano_de_contas', 'tipo', 'subtipo', 'categoria'
    list_filter = 'data', 'plano_de_contas',
    list_per_page = 10
    ordering = ['-data']


@admin.register(HistoricoDeReajustes)
class HistoricoDeReajustesAdmin(admin.ModelAdmin):
    list_display = ['data', 'professores', 'professores_acumulado',
                    'adm_apoio', 'acumulado_adm_apoio', 'total',
                    'total_acumulado', 'inpc', 'inpc_acumulado',
                    'ipca', 'ipca_acumulado', 'plano_saude_professores',
                    'ticket_alimentacao_professores',
                    'vale_transporte_professores',
                    'plano_saude_adm_apoio', 'ticket_alimentacao_adm_apoio',
                    'vale_transporte_adm_apoio']
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(HistoricoIndicesFinanceiros)
class HistoricoIndicesFinanceirosAdmin(admin.ModelAdmin):
    list_display = ['data', 'ativo_circulante', 'realizavel_a_longo_prazo',
                    'investimento_imobilizado', 'total_ativo',
                    'passivo_circulante', 'exigivel_a_longo_prazo',
                    'patrimonio_liquido', 'receita_liquida_total',
                    'lucro_liquido', 'depreciacao', 'resultado_operacional',
                    'contas_a_receber', 'diponivel', 'sobra_bruta',
                    'indice_liquidez_geral',
                    'indice_solvencia_geral', 'indice_liquidez_corrente',
                    'indice_endividamento_total', 'grau_imobilizacao',
                    'ebitda', 'margem_lucro_liquida', 'margem_contribuicao'
                    ]
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(HistoricoMatriculas)
class HistoricoMatriculasAdmin(admin.ModelAdmin):
    list_display = ['data', 'numero_matriculas', 'meta',]
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(HistoricoOrcamentario)
class HistoricoOrcamentarioAdmin(admin.ModelAdmin):
    list_display = ['data', 'receita_ato_cooperado', 'despesa_servicos',
                    'despesas_operacionais', 'despesas_financeiras',
                    'despesas_totais', 'resultado_liquido',
                    'receita_ato_nao_cooperado', 'receitas_totais',
                    'fates_5_porcento', 'fates_destinacao_sobras',
                    'fates_destinacao_sobras', 'fates_entrada_total',
                    'fates_reversao_legal', 'fates_reversao_descontos',
                    'fates_reversao_total', 'saldo_fates',
                    'capital_social_novas_integralizacoes',
                    'capital_social_reversao', 'capital_social_integralizado',
                    'reserva_legal_10_porcento', 'reserva_legal_total',
                    'destinacao_sobras_perdas_a_outras_reservas_estatutarias',
                    'reversao_outras_reservas_estatutarias',
                    'outras_reservas_estatutarias',
                    'destinacao_sobras_perdas_exercicio_anterior',
                    'reversao_reservas', 'sobra_perda_exercicio',
                    'constituicao_reservas', 'reserva_lucro',
                    'reversao_reserva_investimento',
                    'saldo_reserva_investimento',
                    'reversao_fundo_despesas_correntes',
                    'saldo_fundo_despesas_correntes',
                    'patrimonio_liquido_sobra_perda_exercicio',
                    'patrimonio_liquido_constituicao_reserva',
                    'patrimonio_liquido_reserva_incentivos_fiscais',
                    'patrimonio_liquido',
                    'sobras_perdas_a_disposicao_ago_ato_cooperado',
                    'sobras_perdas_a_disposicao_ago_ato_nao_cooperado',
                    'sobras_perdas_a_disposicao_ago_total',
                    'inadimplencia_quitada',
                    'percentual_inadimplencia_quitada',
                    'inadimplencia_adquirida',
                    'percentual_inadimplencia_adquirida',
                    'inadimplencia_acumulada',
                    'percentual_inadimplencia_acumulada'
                    ]
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(Ifes)
class IfesAdmin(admin.ModelAdmin):
    list_display = ['data', 'aprovados_ifes']
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(Matriculas)
class MatriculasAdmin(admin.ModelAdmin):
    list_display = ['data', 'serie', 'alunos', 'rematriculados',
                    'nao_rematriculados',
                    'novos', 'particular', 'publica', 'migrantes',
                    'iniciantes', 'capacidade_ideal_alunos',
                    'saldo_oocupacao_ideal', 'vagas_ofertadas',
                    'vagas_ofertadas', 'vagas_ociosas',
                    'capacidade_maxima_alunos',
                    'saldo_ocupacao_maxima', 'aprovados_ifes'
                    ]
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']


@admin.register(Ofertas)
class OfertasAdmin(admin.ModelAdmin):
    list_display = ['ano', 'turmas_ofertadas', 'vagas_ofertadas']
    list_display_links = 'ano',
    search_fields = 'ano',
    list_filter = 'ano',
    list_per_page = 10
    ordering = ['-ano']


@admin.register(Parametros)
class ParametrosAdmin(admin.ModelAdmin):
    list_display = ['ano', 'serie', 'numero_ideal_alunos',
                    'numero_maximo_alunos', 'numero_ideal_turmas',
                    'numero_maximo_turmas', 'capacidade_ideal_alunos',
                    'capacidade_maxima_alunos',
                    ]
    list_display_links = 'ano', 'serie'
    search_fields = 'ano', 'serie'
    list_filter = 'ano', 'serie'
    list_per_page = 10
    ordering = ['-ano']


@admin.register(PrevisaoOrcamentaria)
class PrevisaoOrcamentariaAdmin(admin.ModelAdmin):
    list_display = ['data', 'tipo', 'subtipo', 'categoria',
                    'item', 'valor', 'observacao',
                    ]
    list_display_links = 'data', 'tipo', 'subtipo', 'categoria', 'item',
    search_fields = 'data', 'tipo', 'subtipo', 'categoria', 'item',
    list_filter = 'data', 'tipo', 'subtipo', 'categoria', 'item',
    list_per_page = 10
    ordering = ['-data']
    actions = [clonar_modelo]


@admin.register(ProjecaoFates)
class ProjecaoFatesAdmin(admin.ModelAdmin):
    list_display = ['data', 'projecao_fates']
    list_display_links = 'data',
    search_fields = 'data',
    list_filter = 'data',
    list_per_page = 10
    ordering = ['-data']
