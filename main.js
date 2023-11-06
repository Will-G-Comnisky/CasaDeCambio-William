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



// ---------FETCH para obter simbolo e nome das moedas

async function buscarMoedas() {
    const resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado");
    if (!resposta.ok) {
        throw new Error('Erro ao buscar moedas');
    }

    return resposta.json();
}

// ---------FETCH para obter cotação de moedas

async function buscarCotacao(moedaSelecionada, dataCotacao) {
    const resposta = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda=${moedaSelecionada}&@dataCotacao=${dateString}&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`);
    if (!resposta.ok) {
        throw new Error('Erro ao buscar cotação');
    }

    const cotacao = await resposta.json();
    console.log(cotacao);
    return cotacao;
}

// ------------ FUNÇÃO para criar as opções de moeda no select do HTML

function criarOption(moeda) {
    let option = document.createElement('option');
    option.value = moeda.simbolo;
    option.innerText = moeda.simbolo + " (" + moeda.nomeFormatado + ")";
    return option;
}

var btnConverter = document.getElementById('idCotacao');
btnConverter.addEventListener('click', async function() {
    let selectMoeda = document.getElementById('idMoedas');
    let moedaSelecionada = selectMoeda.value;

    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    let dateString = `${month}-${day}-${year}`;

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





/*

---------------ANOTAÇÕES DE COMO SERIA COM AJAX------------------------

function buscarMoedas() {
    var xhr = new XMLHttpRequest();
    
    xhr.open('GET', 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado')
    
    xhr.addEventListener('load', function() {
        let moedas = JSON.parse(xhr.responseText);
        console.log(moedas.value[1]);
        
        moedas.value.forEach(moeda => {
            let option = document.createElement('option');
            option.value = moeda.simbolo + ' (' + moeda.nomeFormatado + ')';
            listaMoedas.appendChild(option);
        });
    })
    
    xhr.send();
}

let adicionarMoedas = document.getElementById('idGerar');
adicionarMoedas.addEventListener('click', function (e) { //Como eu quero que essa função seja executada ao carregar a pagina, posso adicionar onload? Ou DOMContentLoad?
    e.preventDefault();
    console.log('Passou aqui')
    buscarMoedas(); //
});

*/