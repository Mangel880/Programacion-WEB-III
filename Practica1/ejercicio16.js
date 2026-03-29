/**
Proporcione un ejemplo para migrar una función con promesas a async/await.
 */

function obtenerNumero() {
    return Promise.resolve(5);
}

function sumarTres(numero) {
    return Promise.resolve(numero + 3);
}

// Uso con promesas
obtenerNumero()
    .then(numero => {
        return sumarTres(numero);
    })
    .then(resultado => {
        console.log("Resultado:", resultado);
    })
    .catch(error => {
        console.error("Error:", error);
    });



    function obtenerNumero() {
    return Promise.resolve(5);
}

function sumarTres(numero) {
    return Promise.resolve(numero + 3);
}

// Uso con async/await
async function calcular() {
    try {
        const numero = await obtenerNumero();
        const resultado = await sumarTres(numero);
        console.log("Resultado:", resultado);
    } catch (error) {
        console.error("Error:", error);
    }
}

calcular();