## Servicio REST

El servicio REST requiere tener instalado en el sistema Node.js y la herramienta npm. Tras descargar el código fuente es necesario instalar los módulos. Para ello ejecutamos el siguiente comando dentro de la carpeta del servicio REST.

> npm install

El servicio dispone de varios parámetros de configuración que se encuentran en el fichero config.js, en donde puedes configurar la conexión con MongoDB, que puede estar en local o remoto.

Para iniciar los documentos básicos en la base de datos hay que ejecutar el script install.js. En caso de que se deseen ejecutar los tests, también es necesario ejecutar install-test.js.

> node install.js

> node install-test.js

Para arrancar el servicio se emplea la herramienta npm mediante el comando:

> npm start

Si se desea ejecutar las pruebas, se debe de arrancar el servicio en modo testing:

> npm start test
> npm test
