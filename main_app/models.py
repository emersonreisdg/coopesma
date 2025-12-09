from django.db import models
from django.utils.translation import gettext_lazy as _
# from utils import formatted_date


class Aplicacoes(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    banco = models.TextField(db_column='Banco', blank=True, null=True)
    conta = models.TextField(db_column='Conta', blank=True, null=True)
    aplicacao = models.TextField(db_column='Aplicacao', blank=True, null=True)
    valor = models.FloatField(db_column='Valor', blank=True, null=True)
    # valor = models.DecimalField(db_column='Valor',
    #                             max_digits=10,
    #                             decimal_places=2,
    #                             blank=True,
    #                             null=True)
    origem = models.TextField(db_column='Origem', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Aplicacoes'
        verbose_name = _('Investiment')
        verbose_name_plural = _('Investiments')

    # def __str__(self):
    #     return self.data.strftime('%Y-%m-%d')

    def __str__(self):
        return self.data.strftime('%d/%m/%Y') if self.data else 'No Date'


class CargosESalarios(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    cargo = models.TextField(db_column='Cargo', blank=True, null=True)
    numero_funcionarios = models.IntegerField(
        db_column='Numero Funcionarios', blank=True, null=True)
    carga_horaria = models.TextField(
        db_column='Carga Horaria', blank=True, null=True)
    salario = models.FloatField(db_column='Salario', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Cargos e Salarios'
        # verbose_name = #_('Position and Salary')
        # _('Positions and Salaries')
        verbose_name_plural = 'Cargos e Salarios'


class Controle(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    numero_cooperado = models.IntegerField(
        db_column='Numero Cooperado', blank=True, null=True)
    cooperado = models.TextField(db_column='Cooperado', blank=True, null=True)
    numero_alunos = models.IntegerField(
        db_column='Numero Alunos', blank=True, null=True)
    aluno = models.TextField(db_column='Aluno', blank=True, null=True)
    turma = models.TextField(db_column='Turma', blank=True, null=True)
    cobranca_receita = models.TextField(
        db_column='Cobranca Receita', blank=True, null=True)
    plano_desconto = models.TextField(
        db_column='Plano Desconto', blank=True, null=True)
    cooperar_plus = models.FloatField(
        db_column='COOPERAR PLUS', blank=True, null=True)
    beneficios = models.TextField(
        db_column='Beneficios', blank=True, null=True)
    rateio = models.FloatField(db_column='Rateio', blank=True, null=True)
    desconto_percentual = models.FloatField(
        db_column='Desconto Percentual', blank=True, null=True)
    desconto = models.FloatField(db_column='Desconto', blank=True, null=True)
    valor_liquido = models.FloatField(
        db_column='Valor Liquido', blank=True, null=True)
    livros = models.FloatField(db_column='Livros', blank=True, null=True)
    numero_parcelas = models.IntegerField(
        db_column='Numero Parcelas', blank=True, null=True)
    soma_livros = models.FloatField(
        db_column='Soma Livros', blank=True, null=True)
    soma_parcela_livros = models.TextField(
        db_column='Soma Parcela Livros', blank=True, null=True)
    # indicado = models.TextField(db_column='Indicado', blank=True, null=True)
    indicou = models.TextField(db_column='Indicou', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'Controle'
        verbose_name_plural = 'Controle de Cooperados'


class DespesaReceita(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=False, null=False)
    plano_de_contas = models.TextField(
        db_column="Plano de Contas", blank=False, null=False)
    valor = models.FloatField(db_column='Valor', blank=False, null=False)
    tipo = models.TextField(db_column="Tipo", blank=False, null=False)
    subtipo = models.TextField(db_column="Subtipo", blank=False, null=False)
    categoria = models.TextField(db_column="Categoria", blank=True, null=True)

    def __str__(self):
        return f"{self.data}"

    class Meta:
        managed = True
        db_table = 'Despesas e Receitas'
        verbose_name_plural = 'Despesas e Receitas'


class Indicacao(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    numero_cooperado = models.IntegerField(
        db_column='Numero Cooperado', blank=True, null=True)
    cooperado = models.TextField(db_column='Cooperado', blank=True, null=True)
    numero_cooperado_indicado = models.IntegerField(
        db_column='Numero Cooperado Indicado', blank=True, null=True)
    cooperado_indicado = models.TextField(
        db_column='Cooperado Indicado', blank=True, null=True)

    def __str__(self):
        return f"{self.cooperado} - {self.data}"

    class Meta:
        managed = False
        db_table = 'Indicacao'
        verbose_name_plural = 'Indicacoes'


class Controle2022(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    cooperado = models.DateTimeField(
        db_column='Cooperado', blank=True, null=True)
    numero_alunos = models.IntegerField(
        db_column='Numero Alunos', blank=True, null=True)
    aluno = models.TextField(db_column='Aluno', blank=True, null=True)
    beneficio = models.TextField(db_column='Beneficio', blank=True, null=True)
    cooperar_mais_1 = models.IntegerField(
        db_column='Cooperar Mais 1', blank=True, null=True)
    turma_field = models.TextField(db_column='TURMA ', blank=True, null=True)
    cobranca = models.TextField(db_column='Cobranca', blank=True, null=True)
    rateio = models.FloatField(db_column='Rateio', blank=True, null=True)
    desconto_percentual = models.FloatField(
        db_column='Desconto Percentual', blank=True, null=True)
    desconto = models.FloatField(db_column='Desconto', blank=True, null=True)
    valor_liquido = models.FloatField(
        db_column='Valor Liquido', blank=True, null=True)
    soma_rateio = models.FloatField(
        db_column='Soma Rateio', blank=True, null=True)
    soma_desconto = models.FloatField(
        db_column='Soma Desconto', blank=True, null=True)
    livros = models.FloatField(db_column='Livros', blank=True, null=True)
    numero_parcelas = models.FloatField(
        db_column='Numero Parcelas', blank=True, null=True)
    soma_livros = models.FloatField(
        db_column='Soma Livros', blank=True, null=True)
    soma_parcela_livros = models.FloatField(
        db_column='Soma Parcela Livros', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Controle 2022'


class DespesasAdministrativas(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    descricao = models.TextField(db_column='Descricao', blank=True, null=True)
    valor = models.FloatField(db_column='Valor', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Despesas Administrativas'
        verbose_name = 'Despesa Administrativa'
        verbose_name_plural = 'Despesas Administrativas'

    # def formatted_date(self):
    #     return formatted_date(self.data)

    # formatted_date.short_description = 'Data Formatada'

    # def __str__(self):
    #     return self.formatted_date()


class Destinacoes(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    recurso = models.TextField(db_column='Recurso', blank=True, null=True)
    valor = models.FloatField(db_column='Valor', blank=True, null=True)
    destino = models.TextField(db_column='Destino', blank=True, null=True)
    valor_destinado = models.FloatField(
        db_column='Valor Destinado', blank=True, null=True)
    situacao = models.TextField(db_column='Situacao', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Destinacoes'


class ExecucaoOrcamentaria(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    receitas = models.FloatField(db_column='Receitas', blank=True, null=True)
    receitas_principais = models.FloatField(
        db_column='Receitas Principais', blank=True, null=True)
    mensalidade = models.FloatField(
        db_column='Mensalidade', blank=True, null=True)
    receitas_financeiras = models.FloatField(
        db_column='Receitas Financeiras', blank=True, null=True)
    capital_social = models.FloatField(
        db_column='Capital Social', blank=True, null=True)
    acordo_judicial = models.FloatField(
        db_column='Acordo Judicial', blank=True, null=True)
    outras_receitas = models.FloatField(
        db_column='Outras Receitas', blank=True, null=True)
    aluguel_cantina_e_outros = models.FloatField(
        db_column='Aluguel Cantina e Outros', blank=True, null=True)
    livros = models.FloatField(db_column='Livros', blank=True, null=True)
    despesas = models.FloatField(db_column='Despesas', blank=True, null=True)
    despesas_administrativas = models.FloatField(
        db_column='Despesas Administrativas', blank=True, null=True)
    ordenados_e_salarios = models.FloatField(
        db_column='Ordenados e Salarios', blank=True, null=True)
    ordenados_salarios_docentes = models.FloatField(
        db_column='Ordenados Salarios Docentes', blank=True, null=True)
    ordenados_salarios_adm_apoio = models.FloatField(
        db_column='Ordenados Salarios Adm Apoio', blank=True, null=True)
    despesas_ensino = models.FloatField(
        db_column='Despesas Ensino', blank=True, null=True)
    material_didativo = models.FloatField(
        db_column='Material Didativo', blank=True, null=True)
    devolucao_mensalidade = models.FloatField(
        db_column='Devolucao Mensalidade', blank=True, null=True)
    beneficios = models.FloatField(
        db_column='Beneficios', blank=True, null=True)
    plano_saude = models.FloatField(
        db_column='Plano Saude', blank=True, null=True)
    vale_transporte = models.FloatField(
        db_column='Vale Transporte', blank=True, null=True)
    vale_alimentacao = models.FloatField(
        db_column='Vale Alimentacao', blank=True, null=True)
    material_lanche_agua_cafe = models.FloatField(
        db_column='Material Lanche Agua Cafe', blank=True, null=True)
    seguro_funcionarios = models.FloatField(
        db_column='Seguro Funcionarios', blank=True, null=True)
    consignacao_funcionarios = models.FloatField(
        db_column='Consignacao Funcionarios', blank=True, null=True)
    impostos = models.FloatField(db_column='Impostos', blank=True, null=True)
    darf = models.FloatField(db_column='DARF', blank=True, null=True)
    dua = models.FloatField(db_column='DUA', blank=True, null=True)
    encargos_trabalhistas = models.FloatField(
        db_column='Encargos Trabalhistas', blank=True, null=True)
    fgts = models.FloatField(db_column='FGTS', blank=True, null=True)
    inss = models.FloatField(db_column='INSS', blank=True, null=True)
    manutencao_instalacoes = models.FloatField(
        db_column='Manutencao Instalacoes', blank=True, null=True)
    material_construcao = models.FloatField(
        db_column='Material Construcao', blank=True, null=True)
    marketing = models.FloatField(db_column='Marketing', blank=True, null=True)
    despesas_servicos = models.FloatField(
        db_column='Despesas Servicos', blank=True, null=True)
    percentual_despesas_servicos = models.FloatField(
        db_column='Percentual Despesas Servicos', blank=True, null=True)
    despesas_operacionais = models.FloatField(
        db_column='Despesas Operacionais', blank=True, null=True)
    percentual_despesas_operacionais = models.FloatField(
        db_column='Percentual Despesas Operacionais', blank=True, null=True)
    depesas_financeiras = models.FloatField(
        db_column='Depesas Financeiras', blank=True, null=True)
    percentual_despesas_financeiras = models.FloatField(
        db_column='Percentual Despesas Financeiras', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Execucao_Orcamentaria'
        verbose_name = 'Execucao Orcamentaria'  # _('Budget Execution')
        # _('Budget Executions')
        verbose_name_plural = 'Execucoes Orcamentarias'


class FluxosDeCaixa(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    chave = models.TextField(
        db_column='Chave', blank=True, null=True)  # Excluir no futuro
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    plano_de_contas = models.TextField(
        db_column='Plano de Contas', blank=True, null=True)
    valor = models.FloatField(db_column='Valor', blank=True, null=True)
    percentual = models.TextField(
        db_column='Percentual', blank=True, null=True)  # Excluir no futuro

    class Meta:
        managed = False
        db_table = 'Fluxos de Caixa'
        verbose_name = 'Fluxo de Caixa'
        verbose_name_plural = 'Fluxos de Caixas'


class HistoricoDeReajustes(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    professores = models.FloatField(
        db_column='Professores', blank=True, null=True)
    professores_acumulado = models.FloatField(
        db_column='Professores Acumulado', blank=True, null=True)
    adm_apoio = models.FloatField(db_column='Adm Apoio', blank=True, null=True)
    acumulado_adm_apoio = models.FloatField(
        db_column='Acumulado Adm Apoio', blank=True, null=True)
    total = models.FloatField(db_column='Total', blank=True, null=True)
    total_acumulado = models.FloatField(
        db_column='Total Acumulado', blank=True, null=True)
    inpc = models.FloatField(db_column='INPC', blank=True, null=True)
    inpc_acumulado = models.FloatField(
        db_column='INPC Acumulado', blank=True, null=True)
    ipca = models.FloatField(db_column='IPCA', blank=True, null=True)
    ipca_acumulado = models.FloatField(
        db_column='IPCA Acumulado', blank=True, null=True)
    plano_saude_professores = models.FloatField(
        db_column='Plano Saude Professores', blank=True, null=True)
    ticket_alimentacao_professores = models.FloatField(
        db_column='Ticket Alimentacao Professores', blank=True, null=True)
    vale_transporte_professores = models.FloatField(
        db_column='Vale Transporte Professores', blank=True, null=True)
    plano_saude_adm_apoio = models.FloatField(
        db_column='Plano Saude Adm Apoio', blank=True, null=True)
    ticket_alimentacao_adm_apoio = models.FloatField(
        db_column='Ticket Alimentacao Adm Apoio', blank=True, null=True)
    vale_transporte_adm_apoio = models.FloatField(
        db_column='Vale Transporte Adm Apoio', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Historico de Reajustes'
        verbose_name = 'Historico de Reajuste'
        verbose_name_plural = 'Historico de Reajustes'


class HistoricoIndicesFinanceiros(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    ativo_circulante = models.FloatField(
        db_column='Ativo Circulante', blank=True, null=True)
    realizavel_a_longo_prazo = models.FloatField(
        db_column='Realizavel a Longo Prazo', blank=True, null=True)
    investimento_imobilizado = models.FloatField(
        db_column='Investimento Imobilizado', blank=True, null=True)
    total_ativo = models.FloatField(
        db_column='Total Ativo', blank=True, null=True)
    passivo_circulante = models.FloatField(
        db_column='Passivo Circulante', blank=True, null=True)
    exigivel_a_longo_prazo = models.IntegerField(
        db_column='Exigivel a Longo Prazo', blank=True, null=True)
    patrimonio_liquido = models.FloatField(
        db_column='Patrimonio Liquido', blank=True, null=True)
    receita_liquida_total = models.FloatField(
        db_column='Receita Liquida Total', blank=True, null=True)
    lucro_liquido = models.FloatField(
        db_column='Lucro Liquido', blank=True, null=True)
    depreciacao = models.FloatField(
        db_column='Depreciacao', blank=True, null=True)
    resultado_operacional = models.FloatField(
        db_column='Resultado Operacional', blank=True, null=True)
    contas_a_receber = models.FloatField(
        db_column='Contas a Receber', blank=True, null=True)
    diponivel = models.FloatField(db_column='Diponivel', blank=True, null=True)
    sobra_bruta = models.FloatField(
        db_column='Sobra Bruta', blank=True, null=True)
    indice_liquidez_geral = models.FloatField(
        db_column='Indice Liquidez Geral', blank=True, null=True)
    indice_solvencia_geral = models.FloatField(
        db_column='Indice Solvencia Geral', blank=True, null=True)
    indice_liquidez_corrente = models.FloatField(
        db_column='Indice Liquidez Corrente', blank=True, null=True)
    indice_endividamento_total = models.FloatField(
        db_column='Indice Endividamento Total', blank=True, null=True)
    grau_imobilizacao = models.FloatField(
        db_column='Grau Imobilizacao', blank=True, null=True)
    ebitda = models.FloatField(db_column='EBITDA', blank=True, null=True)
    margem_lucro_liquida = models.FloatField(
        db_column='Margem Lucro Liquida', blank=True, null=True)
    margem_contribuicao = models.FloatField(
        db_column='Margem Contribuicao', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Historico_Indices_Financeiros'
        verbose_name = 'Historico de Indices Financeiros'
        verbose_name_plural = 'Historico de Indices Financeiros'


class HistoricoMatriculas(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    numero_matriculas = models.IntegerField(
        db_column='Numero Matriculas', blank=True, null=True)
    meta = models.FloatField(db_column='Meta', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Historico_Matriculas'
        verbose_name = 'Historico de Matriculas'
        verbose_name_plural = 'Historico de Matriculas'


class HistoricoOrcamentario(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    receita_ato_cooperado = models.FloatField(
        db_column='Receita Ato Cooperado', blank=True, null=True)
    despesa_servicos = models.FloatField(
        db_column='Despesa Servicos', blank=True, null=True)
    despesas_operacionais = models.FloatField(
        db_column='Despesas Operacionais', blank=True, null=True)
    despesas_financeiras = models.FloatField(
        db_column='Despesas Financeiras', blank=True, null=True)
    despesas_totais = models.FloatField(
        db_column='Despesas Totais', blank=True, null=True)
    resultado_liquido = models.FloatField(
        db_column='Resultado Liquido', blank=True, null=True)
    receita_ato_nao_cooperado = models.FloatField(
        db_column='Receita Ato Nao Cooperado', blank=True, null=True)
    receitas_totais = models.FloatField(
        db_column='Receitas Totais', blank=True, null=True)
    fates_5_porcento = models.FloatField(
        db_column='FATES 5 Porcento', blank=True, null=True)
    fates_destinacao_sobras = models.FloatField(
        db_column='FATES Destinacao Sobras', blank=True, null=True)
    fates_entrada_total = models.FloatField(
        db_column='FATES Entrada Total', blank=True, null=True)
    fates_reversao_legal = models.FloatField(
        db_column='FATES Reversao Legal', blank=True, null=True)
    fates_reversao_descontos = models.FloatField(
        db_column='FATES Reversao Descontos', blank=True, null=True)
    fates_reversao_total = models.FloatField(
        db_column='FATES Reversao Total', blank=True, null=True)
    saldo_fates = models.FloatField(
        db_column='Saldo FATES', blank=True, null=True)
    capital_social_novas_integralizacoes = models.FloatField(
        db_column='Capital Social Novas Integralizacoes',
        blank=True,
        null=True
    )
    capital_social_reversao = models.FloatField(
        db_column='Capital Social Reversao', blank=True, null=True)
    capital_social_integralizado = models.FloatField(
        db_column='Capital Social Integralizado', blank=True, null=True)
    reserva_legal_10_porcento = models.FloatField(
        db_column='Reserva Legal 10 Porcento', blank=True, null=True)
    reserva_legal_total = models.FloatField(
        db_column='Reserva Legal Total', blank=True, null=True)
    destinacao_sobras_perdas_a_outras_reservas_estatutarias = models.FloatField(  # noqa E503
        db_column='Destinacao Sobras Perdas a Outras Reservas Estatutarias',
        blank=True,
        null=True
    )
    reversao_outras_reservas_estatutarias = models.FloatField(
        db_column='Reversao Outras Reservas Estatutarias',
        blank=True,
        null=True
    )
    outras_reservas_estatutarias = models.FloatField(
        db_column='Outras Reservas Estatutarias', blank=True, null=True)
    destinacao_sobras_perdas_exercicio_anterior = models.FloatField(
        db_column='Destinacao Sobras Perdas Exercicio Anterior',
        blank=True,
        null=True
    )
    reversao_reservas = models.FloatField(
        db_column='Reversao Reservas', blank=True, null=True)
    sobra_perda_exercicio = models.FloatField(
        db_column='Sobra Perda Exercicio', blank=True, null=True)
    constituicao_reservas = models.FloatField(
        db_column='Constituicao Reservas', blank=True, null=True)
    reserva_lucro = models.FloatField(
        db_column='Reserva Lucro', blank=True, null=True)
    reversao_reserva_investimento = models.FloatField(
        db_column='Reversao Reserva Investimento', blank=True, null=True)
    saldo_reserva_investimento = models.FloatField(
        db_column='Saldo Reserva Investimento', blank=True, null=True)
    fundo_de_despesas_correntes = models.FloatField(
        db_column='Fundo de Despesas Correntes', blank=True, null=True)
    reversao_fundo_despesas_correntes = models.FloatField(
        db_column='Reversao Fundo Despesas Correntes', blank=True, null=True)
    saldo_fundo_despesas_correntes = models.FloatField(
        db_column='Saldo Fundo Despesas Correntes', blank=True, null=True)
    patrimonio_liquido_sobra_perda_exercicio = models.FloatField(
        db_column='Patrimonio Liquido Sobra Perda Exercicio',
        blank=True,
        null=True
    )
    patrimonio_liquido_constituicao_reserva = models.FloatField(
        db_column='Patrimonio Liquido Constituicao Reserva',
        blank=True,
        null=True
    )
    patrimonio_liquido_reserva_incentivos_fiscais = models.FloatField(
        db_column='Patrimonio Liquido Reserva Incentivos Fiscais',
        blank=True,
        null=True
    )
    patrimonio_liquido = models.FloatField(
        db_column='Patrimonio Liquido', blank=True, null=True)
    sobras_perdas_a_disposicao_ago_ato_cooperado = models.FloatField(
        db_column='Sobras Perdas a Disposicao AGO Ato Cooperado',
        blank=True,
        null=True
    )
    sobras_perdas_a_disposicao_ago_ato_nao_cooperado = models.FloatField(
        db_column='Sobras Perdas a Disposicao AGO Ato Nao Cooperado',
        blank=True,
        null=True
    )
    sobras_perdas_a_disposicao_ago_total = models.FloatField(
        db_column='Sobras Perdas a Disposicao AGO Total',
        blank=True,
        null=True
    )
    inadimplencia_quitada = models.FloatField(
        db_column='Inadimplencia Quitada', blank=True, null=True)
    percentual_inadimplencia_quitada = models.FloatField(
        db_column='Percentual Inadimplencia Quitada', blank=True, null=True)
    inadimplencia_adquirida = models.FloatField(
        db_column='Inadimplencia Adquirida', blank=True, null=True)
    percentual_inadimplencia_adquirida = models.FloatField(
        db_column='Percentual Inadimplencia Adquirida', blank=True, null=True)
    inadimplencia_acumulada = models.FloatField(
        db_column='Inadimplencia Acumulada', blank=True, null=True)
    percentual_inadimplencia_acumulada = models.FloatField(
        db_column='Percentual Inadimplencia Acumulada', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Historico_Orcamentario'
        verbose_name = 'Historico Orcamentario'
        verbose_name_plural = 'Historico Orcamentario'


class Ifes(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    aprovados_ifes = models.IntegerField(
        db_column='Aprovados IFES', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'IFES'
        verbose_name_plural = 'IFES'


class Matriculas(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    serie = models.TextField(db_column='Serie', blank=True, null=True)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    alunos = models.FloatField(db_column='Alunos', blank=True, null=True)
    rematriculados = models.FloatField(
        db_column='Rematriculados', blank=True, null=True)
    nao_rematriculados = models.FloatField(
        db_column='Nao Rematriculados', blank=True, null=True)
    novos = models.IntegerField(db_column='Novos', blank=True, null=True)
    particular = models.FloatField(
        db_column='Particular', blank=True, null=True)
    publica = models.FloatField(db_column='Publica', blank=True, null=True)
    migrantes = models.FloatField(db_column='Migrantes', blank=True, null=True)
    iniciantes = models.FloatField(
        db_column='Iniciantes', blank=True, null=True)
    capacidade_ideal_alunos = models.FloatField(
        db_column='Capacidade Ideal Alunos', blank=True, null=True)
    saldo_oocupacao_ideal = models.FloatField(
        db_column='Saldo Oocupacao Ideal', blank=True, null=True)
    vagas_ofertadas = models.FloatField(
        db_column='Vagas Ofertadas', blank=True, null=True)
    vagas_ociosas = models.FloatField(
        db_column='Vagas Ociosas', blank=True, null=True)
    capacidade_maxima_alunos = models.FloatField(
        db_column='Capacidade Maxima Alunos', blank=True, null=True)
    saldo_ocupacao_maxima = models.FloatField(
        db_column='Saldo Ocupacao Maxima', blank=True, null=True)
    aprovados_ifes = models.FloatField(
        db_column='Aprovados IFES', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Matriculas'
        verbose_name_plural = 'Matriculas'


class Ofertas(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    serie = models.TextField(db_column='Serie', blank=True, null=True)
    ano = models.IntegerField(db_column='Ano', blank=True, null=True)
    turmas_ofertadas = models.IntegerField(
        db_column='Turmas Ofertadas', blank=True, null=True)
    vagas_ofertadas = models.IntegerField(
        db_column='Vagas Ofertadas', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Ofertas'
        verbose_name_plural = 'Ofertas'


class Parametros(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    serie = models.TextField(db_column='Serie', blank=True, null=True)
    ano = models.IntegerField(db_column='Ano', blank=True, null=True)
    numero_ideal_alunos = models.IntegerField(
        db_column='Numero Ideal Alunos', blank=True, null=True)
    numero_maximo_alunos = models.IntegerField(
        db_column='Numero Maximo Alunos', blank=True, null=True)
    numero_ideal_turmas = models.FloatField(
        db_column='Numero Ideal Turmas', blank=True, null=True)
    numero_maximo_turmas = models.FloatField(
        db_column='Numero Maximo Turmas', blank=True, null=True)
    capacidade_ideal_alunos = models.FloatField(
        db_column='Capacidade Ideal Alunos', blank=True, null=True)
    capacidade_maxima_alunos = models.IntegerField(
        db_column='Capacidade Maxima Alunos', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Parametros'
        verbose_name_plural = 'Parametros'


class PrevisaoOrcamentaria(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    tipo = models.TextField(db_column='Tipo', blank=True, null=True)
    subtipo = models.TextField(db_column='Subtipo', blank=True, null=True)
    categoria = models.TextField(db_column='Categoria', blank=True, null=True)
    item = models.TextField(db_column='Item', blank=True, null=True)
    valor = models.FloatField(db_column='Valor', blank=True, null=True)
    observacao = models.TextField(
        db_column='Observacao', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Previsao_Orcamentaria'
        verbose_name_plural = 'Previsao Orcamentaria'


class ProjecaoFates(models.Model):
    id = models.AutoField(
        db_column='Id', primary_key=True, blank=False, null=False)
    data = models.DateTimeField(db_column='Data', blank=True, null=True)
    projecao_fates = models.FloatField(
        db_column='Projecao_Fates', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Projecao_Fates'
        verbose_name_plural = 'Projecao_Fates'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    first_name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class AuthorsProfile(models.Model):
    bio = models.TextField()
    author = models.OneToOneField(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'authors_profile'


class DjangoAdminLog(models.Model):
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey(
        'DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    action_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class TagTag(models.Model):
    name = models.CharField(max_length=255)
    slug = models.CharField(unique=True, max_length=50)
    object_id = models.CharField(max_length=255)
    content_type = models.ForeignKey(DjangoContentType, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'tag_tag'
