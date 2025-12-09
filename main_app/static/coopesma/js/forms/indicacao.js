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
        const form = document.getElementById("indicacao-form");
        const formData = new FormData(form);
        const formObj = {};
        formData.forEach((value, key) => {
            formObj[key] = value;
        });

        // // Capturar o valor formatado do campo 'rateio'
        // const rateioField = document.getElementById("rateio");
        // const rateioAutoNumericInstance = AutoNumeric.getAutoNumericElement(rateioField);
        // formObj["rateio"] = rateioAutoNumericInstance.getNumber();

        // // Capturar o valor formatado do campo 'desconto_percentual'
        // const descontoPercentualField = document.getElementById("desconto_percentual");
        // const descontoPOercentualAutoNumericInstance = AutoNumeric.getAutoNumericElement(descontoPercentualField);
        // formObj["desconto_percentual"] = descontoPercentualAutoNumericInstance.getNumber();

        // // Capturar o valor formatado do campo 'livros'
        // const livrosField = document.getElementById("livros");
        // const livrosAutoNumericInstance = AutoNumeric.getAutoNumericElement(livrosField);
        // formObj["livros"] = livrosAutoNumericInstance.getNumber();

        // // Capturar o valor formatado do campo 'numero_parcelas'
        // const numeroParcelasField = document.getElementById("numero_parcelas");
        // const numeroParcelasFieldAutoNumericInstance = AutoNumeric.getAutoNumericElement(numeroParcelasField);
        // formObj["numero_parcelas"] = numeroParcelasFieldAutoNumericInstance.getNumber();

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

                console.log('element:',element);
                
                if (element.is('select')) {
                    // Verifica se o item já existe no seletor específico
                    if (element.find(`option[value="${value}"]`).length === 0) {
                        element.append(new Option(value, value, true, true));
                        console.log('(element.find(`option[value="${value}"]`):',element.find(`option[value="${value}"]`));
                    }
                } else if (element.is('input')) {
                    // Define o valor do input
                    element.val(value);
                    console.log('element.value:',element.value);
                }
            }
        });

       
        const fieldName = $(selector).attr("name");
        if (form_data && form_data[fieldName]) {
            $(selector).val(form_data[fieldName]).trigger('change');
        }
    }


    // // Inicializar AutoNumeric
    // const rateioAutoNumericInstance = new AutoNumeric('#rateio', {
    //     digitGroupSeparator: '.',
    //     decimalCharacter: ',',
    //     currencySymbol: 'R$ ',
    //     currencySymbolPlacement: 'p',
    //     decimalPlaces: 2,
    //     minimumValue: '0',
    //     maximumValue: '9999999999.99',
    //     unformatOnSubmit: true
    // });

    // const descontoPercentualAutoNumericInstance = new AutoNumeric('#desconto_percentual', {
    //     digitGroupSeparator: '.',
    //     decimalCharacter: ',',
    //     suffixText: '%',
    //     decimalPlaces: 1,
    //     minimumValue: '0',
    //     maximumValue: '100.0',
    //     unformatOnSubmit: true
    // });

    // const livrosAutoNumericInstance = new AutoNumeric('#livros', {
    //     digitGroupSeparator: '.',
    //     decimalCharacter: ',',
    //     currencySymbol: 'R$ ',
    //     currencySymbolPlacement: 'p',
    //     decimalPlaces: 2,
    //     minimumValue: '0',
    //     maximumValue: '9999999999.99',
    //     unformatOnSubmit: true
    // });

    // const numeroParcelasAutoNumericInstance = new AutoNumeric('#numero_parcelas', {
    //     digitGroupSeparator: '.',
    //     decimalCharacter: ',',
    //     decimalPlaces: 0,
    //     minimumValue: '1',
    //     maximumValue: '12',
    //     unformatOnSubmit: true
    // });

    // Inicializar campos Select2
    configureSelectWithAddNew("#cooperado", [...new Set(data.map(item => item.cooperado).filter(Boolean))]);
    // configureSelectWithAddNew("#aluno", [...new Set(data.map(item => item.aluno).filter(Boolean))]);
    // configureSelectWithAddNew("#turma", [...new Set(data.map(item => item.turma).filter(Boolean))]);
    // configureSelectWithAddNew("#cobranca_receita", [...new Set(data.map(item => item.cobranca_receita).filter(Boolean))]);
    // configureSelectWithAddNew("#plano_desconto", [...new Set(data.map(item => item.plano_desconto).filter(Boolean))]);
    // configureSelectWithAddNew("#beneficios", [...new Set(data.map(item => item.beneficios).filter(Boolean))]);
    // // configureSelectWithAddNew("#indicado", [...new Set(data.map(item => item.indicado).filter(Boolean))]);
    // configureSelectWithAddNew("#indicou", [...new Set(data.map(item => item.indicou).filter(Boolean))]);

    
    // if (form_data && form_data.rateio) {
    //     rateioAutoNumericInstance.set(form_data.rateio);
    // }
    // if (form_data && form_data.desconto_percentual) {
    //     descontoPercentualAutoNumericInstance.set(form_data.desconto_percentual);
    // }
    // if (form_data && form_data.livros) {
    //     livrosAutoNumericInstance.set(form_data.livros);
    // }
    // if (form_data && form_data.numero_parcelas) {
    //     numeroParcelasAutoNumericInstance.set(form_data.numero_parcelas);
    // }

    // Inicializar calendário Flatpickr
    flatpickr(".date-picker", {
        dateFormat: "d/m/Y",
        defaultDate: form_data.data ? convertDateToISO(form_data.data) : null
    });

    // Submeter o formulário
    document.getElementById("submit-button").addEventListener("click", function (event) {
        // const rateioField = document.getElementById("rateio");
        // const rateioAutoNumericInstance = AutoNumeric.getAutoNumericElement(rateioField);
        // rateioField.value = rateioAutoNumericInstance.getNumber();

        // const descontoPercentualField = document.getElementById("desconto_percentual");
        // const descontoPercentualAutoNumericInstance = AutoNumeric.getAutoNumericElement(descontoPercentualField);
        // descontoPercentualField.value = descontoPercentualAutoNumericInstance.getNumber();
        
        // const livrosField = document.getElementById("livros");
        // const livrosAutoNumericInstance = AutoNumeric.getAutoNumericElement(livrosField);
        // livrosField.value = livrosAutoNumericInstance.getNumber();

        // const numeroParcelasField = document.getElementById("numero_parcelas");
        // const numeroParcelasAutoNumericInstance = AutoNumeric.getAutoNumericElement(numeroParcelasField);
        // numeroParcelasField.value = numeroParcelasAutoNumericInstance.getNumber();
     
        fetch("/formulario/indicacao/salvar_sessao/", {
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

