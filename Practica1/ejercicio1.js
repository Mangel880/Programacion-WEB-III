/* 
Crear una funcion que cuente cuantas veces aparece acada vocal en un texto
y devuelva el resultado en un objeto.
let obj = miFuncion("euforia")
console.log(obk) // {a:1, e:1, i:1, o:1, u:1}
*/

/*
texto.toLowerCase() --> convierte todos lo caracterres de una 
cadena de texto a minusculas
*/ 

function miFuncion(texto){
    let  minusculas = texto.toLowerCase();
    
    let vocales = {
        a:0,
        e:0,
        i:0,
        o:0,
        u:0
    }

    for(let i = 0; i < minusculas.length; i++){
        let letra = minusculas[i];

        if(letra == 'a'){
            vocales.a++;
        }

        
        if(letra == 'e'){
            vocales.e++;
        }

        
        if(letra == 'i'){
            vocales.i++;
        }

        
        if(letra == 'o'){
            vocales.o++;
        }

        
        if(letra == 'u'){
            vocales.u++;
        }
    } return vocales;

}

let obj = miFuncion("euforia");
console.log(obj);