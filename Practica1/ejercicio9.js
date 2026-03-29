/*
Crear una promesa que devuelva un mensaje de éxito después de 3 segundos.
*/

function promesaExitosa() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("¡Éxito! La operación se completó después de 3 segundos");
        }, 3000);
    });
}

// Consumir la promesa
promesaExitosa()
    .then(mensaje => {
        console.log(mensaje);
    })
    .catch(error => {
        console.log("Error:", error);
    });

console.log("Esperando 3 segundos...");