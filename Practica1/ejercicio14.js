/*
Proporcione un ejemplo para convertir una promesa en un callback.
*/
function sumarDosCallback(numero, callback) {
    sumarDos(numero)
        .then(resultado => callback(null, resultado))
        .catch(error => callback(error, null));
}


sumarDosCallback(5, (error, resultado) => {
    if (error) {
        console.error(error);
    } else {
        console.log("Resultado:", resultado);
    }
});