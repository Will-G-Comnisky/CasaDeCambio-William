var listaMoedas = document.getElementById('idMoedas');
listaMoedas.addEventListener('load', function()  {
    buscarMoedas() 
});


function buscarMoedas() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado')

    xhr.addEventListener('load', function() {
        let moedas = JSON.parse(xhr.responseText);
        listaMoedas.innerHTML = '';
        moedas.forEach(moeda => {
            let option = document.createElement('option');
            option.value = moeda.simbolo;
            option.textContent = '(' + moeda.nomeFormatado + ')';
            listaMoedas.appendChild(option);
        });
    })

    xhr.send();
}

function exibirMoedas(moedasJSON) {
    console.log(moedasJSON)

    let moedasOBJ = JSON.parse(moedasJSON);
    console.log(moedasOBJ);
}

let dataHoje = new Date().toLocaleDateString("pt-BR");
console.log(dataHoje); // 01/11/2023