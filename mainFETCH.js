
let valorDestino = document.getElementById('idValorMoeda2');
var cotacaoCompraRadio = document.getElementById("cotacaoCompraRadio");
var cotacaoVendaRadio = document.getElementById("cotacaoVendaRadio");


// Cada input na tela é uma lista de moedas, por isso criamos essas três variaveis:
var listaMoedas1 = document.getElementsByClassName('moedas')[0];
var listaMoedas2 = document.getElementsByClassName('moedas')[1];
var listaMoedas3 = document.getElementsByClassName('moedas')[2];

// ------ FUNÇÃO auto executavel async await para buscar as informações de moedas
(async function() {
    let moedas = await buscarMoedas();
    
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas1.appendChild(option);
    });
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas2.appendChild(option);
    });
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas3.appendChild(option);
    });
})();

function getDate() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    let dateString = `${month}-${day}-${year}`;
    
    // Necessário verificar se o dia que está sendo feito a cotação é um dia útil:
    let diaDaSemana = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Se for sábado (6) ou domingo (0), ajusta para o último dia útil (sexta-feira)
    if (diaDaSemana === 6 || diaDaSemana === 0) {
        const ultimoDiaUtil = new Date(date);
        ultimoDiaUtil.setDate(date.getDate() - (diaDaSemana === 0 ? 2 : 1));
        // Se for domingo (0), subtrai 2 dias para obter a última sexta-feira
        // Se for sábado (6), subtrai 1 dia para obter a última sexta-feira

        // Atualiza as variáveis para usar o último dia útil
        day = ultimoDiaUtil.getDate().toString().padStart(2, '0');
        month = (ultimoDiaUtil.getMonth() + 1).toString().padStart(2, '0');
        year = ultimoDiaUtil.getFullYear();
        dateString = `${month}-${day}-${year}`;
    }

    // Retornar os valores
    return {
        day: day,
        month: month,
        year: year,
        dateString: dateString
    };
}

// ---------FETCH para obter simbolo e nome das moedas

async function buscarMoedas() {
    const resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado");
    if (!resposta.ok) {
        throw new Error('Erro ao buscar moedas');
    }

    return resposta.json();
}


// ------------ FUNÇÃO para criar as opções de moeda no select do HTML

function criarOption(moeda) {
    let option = document.createElement('option');
    option.value = moeda.simbolo;
    option.innerText = moeda.nomeFormatado + " (" + moeda.simbolo + ")";
    return option;
}

// Event listener que adquire a cotação da moeda em real:

var selectCotacao = document.getElementById('idMoedas');
selectCotacao.addEventListener('change', async function() {
    let selectMoeda = document.getElementById('idMoedas');
    let moedaSelecionada = selectMoeda.value;

    let dateValues = getDate();
    let dateString = dateValues.dateString;

    var apiUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moedaSelecionada}'&@dataCotacao='${dateString}'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const cotacao = await response.json();
            let saida = document.getElementById('idSaida1');
            saida.value = 'R$ ' + cotacao.value[4].cotacaoCompra;    
            console.log(cotacao.value[4].cotacaoCompra); // Captura dos dados da cotação de compra da moeda selecionada
        } else {
            console.error('Erro na solicitação à API');
        }
    } catch (error) {
        console.error('Erro na solicitação à API:', error);
    }
});



// Event Listener que realiza a conversão das moedas ao clicar no botão:

let converterBtn = document.getElementById('idConverter');
converterBtn.addEventListener('click', async function () {

    let dateValues = getDate();
    let dateString = dateValues.dateString
    
    let moedaOrigem = document.getElementById('idMoedaConversao1');
    let moedaOrigemSelecionada = moedaOrigem.value;

    let moedaDestino = document.getElementById('idMoedaConversao2');
    let moedaDestinoSelecionada = moedaDestino.value

    let valorOrigem = document.getElementById('idValorMoeda1').value;

    // Verificar se os campos estão preenchidos
    if (!moedaOrigem || !moedaDestino || isNaN(valorOrigem)) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const apiUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moedaOrigemSelecionada}'&@dataCotacao='${dateString}'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;
    const apiUrl2 = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moedaDestinoSelecionada}'&@dataCotacao='${dateString}'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;

    // Necessário verificar se o usuário quer a cotação de venda ou compra

    if (cotacaoCompraRadio.checked) {
        try {
            const respostaOrigem = await fetch(apiUrl);
            if (respostaOrigem.ok) {
                let cotacoesJsonOrigem = await respostaOrigem.json();
                cotacaoOrigem = cotacoesJsonOrigem.value[4].cotacaoCompra; // TA FUNCIONANDO, TA RETORNANDO O VALOR EM REAL DA MOEDA SELECIONADA
            } else {
                console.error('Erro na solicitação à API de moeda de origem');
            }
    
            const respostaDestino = await fetch(apiUrl2);
            if (respostaDestino.ok) {
                let cotacoesJsonDestino = await respostaDestino.json();
                cotacaoDestino = cotacoesJsonDestino.value[4].cotacaoCompra // TA FUNCIONANDO, TA RETORNANDO O VALOR EM REAL DA MOEDA SELECIONADA
            } else {
                console.error('Erro na solicitação à API de moeda de destino');
            }
    
            let valorOrigemEmReal = cotacaoOrigem * valorOrigem;
    
            let valorConvertido = valorOrigemEmReal / cotacaoDestino;
    
            valorDestino.value = valorConvertido.toFixed(2);
    
            msgFinal();
    
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro na conversão. Por favor, tente novamente.');
        }
    } else if (cotacaoVendaRadio.checked) {
        try {
            const respostaOrigem = await fetch(apiUrl);
            if (respostaOrigem.ok) {
                let cotacoesJsonOrigem = await respostaOrigem.json();
                cotacaoOrigem = cotacoesJsonOrigem.value[4].cotacaoVenda; // TA FUNCIONANDO, TA RETORNANDO O VALOR EM REAL DA MOEDA SELECIONADA
            } else {
                console.error('Erro na solicitação à API de moeda de origem');
            }
    
            const respostaDestino = await fetch(apiUrl2);
            if (respostaDestino.ok) {
                let cotacoesJsonDestino = await respostaDestino.json();
                cotacaoDestino = cotacoesJsonDestino.value[4].cotacaoVenda // TA FUNCIONANDO, TA RETORNANDO O VALOR EM REAL DA MOEDA SELECIONADA
            } else {
                console.error('Erro na solicitação à API de moeda de destino');
            }
    
            let valorOrigemEmReal = cotacaoOrigem * valorOrigem;
    
            let valorConvertido = valorOrigemEmReal / cotacaoDestino;
    
            valorDestino.value = valorConvertido.toFixed(2);
    
            msgFinal();
    
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro na conversão. Por favor, tente novamente.');
        }
    } else {
        console.log('Não foi possível definir a conversão')
    }
});

// Exibe uma mensagem final para o usuário para melhor compreensão da operação.
function msgFinal () {
    let valorOrigem = document.getElementById('idValorMoeda1').value;
    let valorDestino = document.getElementById('idValorMoeda2').value;
    let moedaOrigem = document.getElementById('idMoedaConversao1').value;     
    let moedaDestino = document.getElementById('idMoedaConversao2').value;
    let mensagem = 'O valor de ' + valorOrigem + ' ' + moedaOrigem + ' vale o mesmo que ' + valorDestino + ' ' + moedaDestino;
    
    let h2Element = document.querySelector('h2.msgFinal');

    if (h2Element) {
        // Se o elemento já existir, atualizar o conteúdo
        h2Element.innerHTML = mensagem;
    } else {
        // Se o elemento não existir, criar um novo
        h2Element = document.createElement('h2');
        h2Element.innerHTML = mensagem;
        h2Element.classList.add('msgFinal');
        document.body.appendChild(h2Element);
    }
}

// --------------------------------------------------------------------------

// Abaixo seria um principio de código caso seja feito com AJAX e não fetch.
/*

const listaMoedas = document.getElementById('idMoedas');

buscarMoedas(carregarSelectMoedas) //  1- adicionando callback ao código

function buscarMoedas(funcaoCB) { //  2 - adicionando callback ao código (parametro funcaoCB)
    var xhr = new XMLHttpRequest();
    
    xhr.open('GET', 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado')
    
    xhr.addEventListener('load', function() {
        let moedas = JSON.parse(xhr.responseText);
        console.log(moedas.value);
        funcaoCB(moedas) //  3 - adicionando callback ao código (funcaoCB = carregarSelectMoedas, função mais abaixo no código)

         // 4 -  removido o forEach para ser adicionado em uma função separada que será carregarSelectMoedas
    })
    
    xhr.send();
}

function carregarSelectMoedas(moedas) { // 5 -  Criação da função carregarSelectMoedas com moedas como parametro
    moedas.value.forEach(moeda => {
        let option = document.createElement('option');
        option.value = moeda.simbolo;
        option.innerText = moeda.simbolo + " (" + moeda.nomeFormatado + ")";
        listaMoedas.appendChild(option);
    });
}

//Como eu quero que essa função seja executada ao carregar a pagina, posso adicionar onload? Ou DOMContentLoad?
*/






