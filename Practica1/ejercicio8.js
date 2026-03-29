/* 
Realizar un código para ejecutar una función callback después 2 segundos.
*/


setTimeout((miCallback) => {
    console.log("Respuesta");
    let a,b,s;
    a = 2;
    b = 2;
    s = a+b;
    console.log(s);
}, 2000);

console.log("Cual es la suma de: 2+2");


