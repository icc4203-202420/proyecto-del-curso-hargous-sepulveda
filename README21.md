agregar las variables de entorno para probar la aplicación,
en un .env, de momento solo hay una, BACKEND_URL.

.env
´´´
BACKEND_URL=http://127.0.0.1:3001

´´´´

el frontend tiene que estar corriendo con la url del backend presente y puesta en las variables de entorno

el .env va dentro de la carpeta de hybrid-frontend
WEB:

Para probar la aplicación de forma web hay que instalar los módulos de npm,
limpiar el caché de ser necesario e iniciar.

npm cache clean --force (de ser necesario)
npm audit fix --force (de ser necesario)
npm install


npx expo start (comando para iniciar)
luego presionar w 
para la prueba web


MÓVIL:
Comandos para correrlo:

npm start -- --tunnel --reset-cache

npx expo start --tunnel --clear (de preferencia)

ngrok http 3001

cambiar la variable de entorno del .env

BACKEND_URL=https://abcd1234.ngrok.io

rails s -p 3001

npx expo start --tunnel

y luego se lee el qr con la aplicación