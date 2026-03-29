/*
Proporcione un ejemplo concreto donde el anidamiento de promesas se puede
reescribir mejor con async/await haciendo el código más limpio y mantenible.
*/

function obtenerNumero() {
    return Promise.resolve(5);
}

function sumarDos(numero) {
    return Promise.resolve(numero + 2);
}

function multiplicarPorTres(numero) {
    return Promise.resolve(numero * 3);
}


obtenerNumero()
    .then(numero => {
        return sumarDos(numero)
            .then(resultado => {
                return multiplicarPorTres(resultado)
                    .then(final => {
                        console.log("Resultado final:", final);
                    });
            });
    })
    .catch(error => console.error(error));



async function calcular() {
    try {
        const numero = await obtenerNumero();
        const paso1 = await sumarDos(numero);
        const final = await multiplicarPorTres(paso1);

        console.log("Resultado final:", final);
    } catch (error) {
        console.error(error);
    }
}

calcular();