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



    // Função para capturar dados do formulário
    function getFormData() {
        const form = document.getElementById("aplicacoes-form");
        const formData = new FormData(form);
        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        // Capturar o valor formatado do campo 'valor'
        const valorField = document.getElementById("valor");
        const autoNumericInstance = AutoNumeric.getAutoNumericElement(valorField);
        formObj["valor"] = autoNumericInstance.getNumber();

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
                
                // Verifica se o item já existe no seletor específico
                if ($(`[name="${key}"] option[value="${value}"]`).length === 0) {
                    $(`[name="${key}"]`).append(new Option(value, value, true, true));
                }
            }
        });

       
        const fieldName = $(selector).attr("name");
        if (form_data && form_data[fieldName]) {
            $(selector).val(form_data[fieldName]).trigger('change');
        }
    }

    // Inicializar AutoNumeric
    const autoNumericInstance = new AutoNumeric('#valor', {
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
    configureSelectWithAddNew("#banco", [...new Set(data.map(item => item.banco).filter(Boolean))]);
    configureSelectWithAddNew("#conta", [...new Set(data.map(item => item.conta).filter(Boolean))]);
    configureSelectWithAddNew("#aplicacao", [...new Set(data.map(item => item.aplicacao).filter(Boolean))]);
    configureSelectWithAddNew("#origem", [...new Set(data.map(item => item.origem).filter(Boolean))]);

    if (form_data && form_data.valor) {
        autoNumericInstance.set(form_data.valor);
    }

    // Inicializar calendário Flatpickr
    flatpickr(".date-picker", {
        dateFormat: "d/m/Y",
        defaultDate: form_data.data ? convertDateToISO(form_data.data) : null
    });

    const getCookieInline = function (name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    // Submeter o formulário
    document.getElementById("submit-button").addEventListener("click", function (event) {
        const valorField = document.getElementById("valor");
        const autoNumericInstance = AutoNumeric.getAutoNumericElement(valorField);
        valorField.value = autoNumericInstance.getNumber();

        fetch("/formulario/aplicacoes/salvar_sessao/", {
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
