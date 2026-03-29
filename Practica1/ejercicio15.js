/*
Proporcione un ejemplo para convertir un callback en una promesa.
*/

// Función original con callback
function sumarDos(numero, callback) {
    if (typeof numero !== "number") {
        callback("Error: no es un número", null);
    } else {
        callback(null, numero + 2);
    }
}

//Convertimos el callback en promesa
function sumarDosPromesa(numero) {
    return new Promise((resolve, reject) => {
        sumarDos(numero, (error, resultado) => {
            if (error) {
                reject(error);
            } else {
                resolve(resultado);
            }
        });
    });
}

// Uso con .then()
sumarDosPromesa(5)
    .then(resultado => {
        console.log("Resultado con .then():", resultado);
    })
    .catch(error => {
        console.error("Error con .then():", error);
    });

// 4️⃣ Uso con async/await
async function probar() {
    try {
        const resultado = await sumarDosPromesa(10);
        console.log("Resultado con async/await:", resultado);
    } catch (error) {
        console.error("Error con async/await:", error);
    }
}

probar();