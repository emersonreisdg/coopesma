document.addEventListener("DOMContentLoaded", function () {
    // Inicializar variáveis de dados JSON
    let data = [];
    let form_data = {};
    try {
        data = JSON.parse(document.getElementById("data-json").textContent);
    } catch (e) {
        console.error("Erro ao analisar data-json:", e);
        data = [];
    }

    try {
        form_data = JSON.parse(document.getElementById("formData-json").textContent);
    } catch (e) {
        console.error("Erro ao analisar formData-json:", e);
        form_data = {};
    }

    // Função para configurar um seletor Select2 vazio
    function configureEmptySelect(selector) {
        $(selector).select2({
            placeholder: "Selecione uma opção",
            allowClear: true,
        }).empty(); // Garante que o seletor começa vazio
    }

    // Função para preencher opções no seletor com base em um filtro
    function populateSelect(selector, options, selectedValue = null) {
        const $selector = $(selector);
        $selector.empty().append(new Option("", "", true, true)); // Adiciona uma opção vazia
        options.forEach(option => {
            const isSelected = option === selectedValue;
            $selector.append(new Option(option, option, isSelected, isSelected));
        });
        $selector.trigger("change"); // Atualiza o seletor
    }

    // Inicializar os seletores vazios
    configureEmptySelect("#subtipo");
    configureEmptySelect("#categoria");
    configureEmptySelect("#item");

    // Configurar o seletor de tipo
    configureEmptySelect("#tipo");
    const tipos = [...new Set(data.map(item => item.tipo).filter(Boolean))];
    populateSelect("#tipo", tipos, form_data.tipo || null);

    // Preencher seletores subsequentes se form_data existir
    if (form_data.tipo) {
        const subtipos = [...new Set(data.filter(item => item.tipo === form_data.tipo).map(item => item.subtipo).filter(Boolean))];
        populateSelect("#subtipo", subtipos, form_data.subtipo || null);

        if (form_data.subtipo) {
            const categorias = [...new Set(data.filter(item => item.tipo === form_data.tipo && item.subtipo === form_data.subtipo).map(item => item.categoria).filter(Boolean))];
            populateSelect("#categoria", categorias, form_data.categoria || null);

            if (form_data.categoria) {
                const items = [...new Set(data.filter(item => item.tipo === form_data.tipo && item.subtipo === form_data.subtipo && item.categoria === form_data.categoria).map(item => item.item).filter(Boolean))];
                populateSelect("#item", items, form_data.item || null);
            }
        }
    }

    // Lógica para preencher os seletores com base nas seleções do usuário
    $("#tipo").on("change", function () {
        const selectedTipo = $(this).val();
        const subtipos = [...new Set(data.filter(item => item.tipo === selectedTipo).map(item => item.subtipo).filter(Boolean))];
        populateSelect("#subtipo", subtipos);

        // Limpar seletores dependentes
        $("#categoria").empty();
        $("#item").empty();
    });

    $("#subtipo").on("change", function () {
        const selectedTipo = $("#tipo").val();
        const selectedSubtipo = $(this).val();
        const categorias = [...new Set(data.filter(item => item.tipo === selectedTipo && item.subtipo === selectedSubtipo).map(item => item.categoria).filter(Boolean))];
        populateSelect("#categoria", categorias);

        // Limpar seletores dependentes
        $("#item").empty();
    });

    $("#categoria").on("change", function () {
        const selectedTipo = $("#tipo").val();
        const selectedSubtipo = $("#subtipo").val();
        const selectedCategoria = $(this).val();
        const items = [...new Set(data.filter(item => item.tipo === selectedTipo && item.subtipo === selectedSubtipo && item.categoria === selectedCategoria).map(item => item.item).filter(Boolean))];
        populateSelect("#item", items);
    });

    // Função para capturar dados do formulário
    function getFormData() {
        const form = document.getElementById("previsao-orcamentaria-form");
        const formData = new FormData(form);
        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        // Capturar o valor formatado do campo 'valor'
        const valorField = document.getElementById("valor");
        const valorAutoNumericInstance = AutoNumeric.getAutoNumericElement(valorField);
        formObj["valor"] = valorAutoNumericInstance.getNumber();

        return formObj;
    }

    // Função para converter data no formato esperado
    function convertDateToISO(dateStr) {
        if (dateStr) {
            if (dateStr instanceof Date) {
                return dateStr.toISOString().split('T')[0];
            }
            if (dateStr.includes("-")) {
                const dateObj = new Date(dateStr);
                if (!isNaN(dateObj.getTime())) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    return `${day}/${month}/${year}`;
                }
            }
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                return dateStr;
            }
        }
        return null;
    }

    // Função para configurar campos com Select2
    function configureSelectWithAddNew(selector, data) {
        $(selector).select2({
            tags: true,
            placeholder: $(selector).data("placeholder"),
            allowClear: true,
            createTag: function (params) {
                const term = $.trim(params.term);
                if (term === "") return null;
                return { id: term, text: term, newTag: true };
            }
        });

        data.forEach(item => {
            // console.log('form_data[$(selector).attr("name")] :', form_data[$(selector).attr("name")]);
            const isSelected = form_data[$(selector).attr("name")] === item;
            // console.log('isSelected:', isSelected);
            
            // Verifica se o item já existe no seletor
            if ($(selector + ' option[value="' + item + '"]').length === 0) {
                $(selector).append(new Option(item, item, isSelected, isSelected));
            }
        });
        
        // Adiciona qualquer item de form_data que não esteja em data ao seletor específico
        Object.keys(form_data).forEach(key => {
            const value = form_data[key];
            if (!data.includes(value)) {
                console.log('Adicionando item de form_data não contido em data:', value);
                
                const element = $(`[name="${key}"]`);
                
                if (element.is('select')) {
                    // Verifica se o item já existe no seletor específico
                    if (element.find(`option[value="${value}"]`).length === 0) {
                        element.append(new Option(value, value, true, true));
                    }
                } else if (element.is('input')) {
                    // Define o valor do input
                    element.val(value);
                }
            }
        });

       
        const fieldName = $(selector).attr("name");
        if (form_data && form_data[fieldName]) {
            $(selector).val(form_data[fieldName]).trigger('change');
        }
    }


    // Inicializar AutoNumeric
    const valorAutoNumericInstance = new AutoNumeric('#valor', {
        digitGroupSeparator: '.',
        decimalCharacter: ',',
        currencySymbol: 'R$ ',
        currencySymbolPlacement: 'p',
        decimalPlaces: 2,
        minimumValue: '0',
        maximumValue: '9999999999.99',
        unformatOnSubmit: true
    });

    
    // Inicializar campos Select2
    // configureSelectWithAddNew("#tipo", [...new Set(data.map(item => item.tipo).filter(Boolean))]);
    // configureSelectWithAddNew("#subtipo", [...new Set(data.map(item => item.subtipo).filter(Boolean))]);
    // configureSelectWithAddNew("#categoria", [...new Set(data.map(item => item.categoria).filter(Boolean))]);
    // configureSelectWithAddNew("#item", [...new Set(data.map(item => item.item).filter(Boolean))]);
        
    if (form_data && form_data.valor) {
        valorAutoNumericInstance.set(form_data.valor);
    }

    // Inicializar calendário Flatpickr
    flatpickr(".date-picker", {
        dateFormat: "d/m/Y",
        defaultDate: form_data.data ? convertDateToISO(form_data.data) : null
    });

    // Submeter o formulário
    document.getElementById("submit-button").addEventListener("click", function (event) {
        const valorField = document.getElementById("valor");
        const valorAutoNumericInstance = AutoNumeric.getAutoNumericElement(valorField);
        valorField.value = valorAutoNumericInstance.getNumber();

             
        fetch("/formulario/previsao_orcamentaria/salvar_sessao/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookieInline("csrftoken")
            },
            body: JSON.stringify(getFormData())
        })
        .then(response => {
            if (!response.ok) {
                console.error("Falha ao salvar dados do formulário na sessão");
            }
        })
        .catch(error => console.error("Erro ao salvar dados do formulário:", error));
    });

});

