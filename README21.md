## SDK 5.2
## Variables de Entorno

Para probar la aplicación, es necesario establecer las variables de entorno en un archivo `.env`. El archivo debe incluir la siguiente variable:

```plaintext
BACKEND_URL=http://127.0.0.1:3001
```

Coloca el archivo `.env` en la carpeta `hybrid-frontend/WEB`.

## Prueba de la Aplicación en la Web

Para probar la aplicación de forma web, sigue estos pasos:

1. **Instala los módulos de npm** (si aún no lo has hecho):

   ```bash
   npm install
   ```

2. **Limpia el caché** (si es necesario):

   ```bash
   npm cache clean --force
   ```

3. **Arregla posibles vulnerabilidades** (si es necesario):

   ```bash
   npm audit fix --force
   ```

4. **Inicia la aplicación**:

   ```bash
   npx expo start
   ```

5. **Prueba la aplicación en la web**: Presiona `w` en la terminal para abrir la aplicación en el navegador.

## Prueba de la Aplicación en Móvil

Para ejecutar la aplicación en un dispositivo móvil, utiliza los siguientes comandos:

1. **Inicia la aplicación**:

   ```bash
   npm start -- --tunnel --reset-cache
   ```

   O puedes usar el siguiente comando como preferencia:

   ```bash
   npx expo start --tunnel --clear
   ```

2. **Configura ngrok** para exponer el backend:

   ```bash
   ngrok http 3001
   ```

3. **Cambia la variable de entorno en el archivo `.env`** con la URL proporcionada por ngrok:

   ```plaintext
   BACKEND_URL=https://abcd1234.ngrok.io
   ```

4. **Inicia el servidor de Rails** en el puerto 3001:

   ```bash
   rails s -p 3001
   ```

5. **Inicia la aplicación de Expo** de nuevo:

   ```bash
   npx expo start --tunnel
   ```

6. **Escanea el código QR** con la aplicación de Expo en tu dispositivo móvil.

## Notas Adicionales

Asegúrate de que el backend esté corriendo y accesible a través de la URL definida en `BACKEND_URL` para que la aplicación funcione correctamente.



