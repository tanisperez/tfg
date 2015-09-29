## Sistema autónomo de monitorización meteorológica con emisión de informes periódicos

En este repositorio se encuentra el Trabajo de Fin de Grado realizado por Estanislao Ramón Pérez Nartallo y dirigido por José Antonio García Naya. Aquí se encuentra la memoria del proyecto, junto con todo el código fuente y los esquemas empleados.

## Software libre

El software desarrollado está disponible bajo la licencia GLPv3 (ver archivo LICENSE) lo que permite a cualquiera que lo desee consultar, modificar o emplear cualquier parte del proyecto según sus necesidades, respetando siempre las condiciones de la licencia.

## Resumen del proyecto

En este Trabajo de Fin de Grado se ha construido una estación meteorológica que recoge datos de sus sensores y los envía a un servidor mediante conectividad WiFi.
Para el desarrollo del trabajo se ha empleado una metodología incremental basada en iteraciones:
* Estudio sobre el estado del arte.
* Análisis de requisitos.
* Diseño e implementación del servicio REST.
* Diseño e implementación de la estación meteorológica.
* Estudio del consumo energético de la estación meteorológica.
* Desarrollo del cliente Web.


En cuanto al hardware nos hemos decantado por emplear soluciones de hardware abierto como es Arduino, Adafruit CC3000 y una Raspberry Pi. La estación meteorológica está constituida por una placa Arduino Uno, una Shield WiFi Adafruit CC3000 y un par de sensores: DHT22 y BMP180. La Raspberry Pi dispone de una distribución GNU/Linux que ejecuta el software del servidor REST y el cliente Web.

El software del sistema, el servidor REST y el cliente Web, están desarrollados en Javascript, empleando el entorno de ejecución multiplataforma Node.js, lo que nos otorga independencia de la plataforma y del sistema operativo. La programación de Arduino se ha realizado empleando el entorno de desarrollo propio de Arduino mediante el lenguaje de programación Processing, basado en C++.

El servidor REST ha sido diseñado de forma que su API sea versionable y se adapte a diferentes versiones de los clientes que la empleen. Como sistema de almacenamiento se ha optado por MongoDB. El sistema emplea unas políticas de acceso y seguridad basada en grupos de usuarios: administradores, usuarios y estaciones meteorológicas; limitando de esta manera las funciones que pueden realizar.
Por último, el cliente Web permite manejar todas las funciones del sistema empleando la API REST desarrollada. Se pueden consultar los datos de la estación meteorológica de forma gráfica y configurar sus parámetros de transmisión.


![Estación meteorológica](/station/CC3000/photos/Weather station.png) 
