/* 
¿Cuando es conveniente utilizar un callback, y cuando es necesario utilizar una
promesa?
Callback
Conviene usarlo cuando:
    1.La operación es simple y corta.
    2.Solo necesitas ejecutar una acción después de otra.
    3.No hay muchas dependencias entre procesos.
    4.Estás trabajando con APIs antiguas que solo aceptan callbacks.

Promesa
Es mejor usarla cuando:
    1.Trabajas con operaciones asíncronas (peticiones HTTP, base de datos, archivos).
    2.Necesitas encadenar varias operaciones.
    3.Quieres mejor manejo de errores.
    4.Quieres usar async/await (que internamente usa promesas).
*/