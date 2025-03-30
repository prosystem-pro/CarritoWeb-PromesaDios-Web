const fs = require('fs');
const axios = require('axios');

const apiUrl = 'https://carritoweb-promesadios-api.onrender.com/api/generar-modelos';
const modelsDirectory = './src/app/Modelos/'; 

if (!fs.existsSync(modelsDirectory)) {
  fs.mkdirSync(modelsDirectory);
}

axios.get(apiUrl)
  .then(response => {
    const modelsJson = response.data;

    Object.entries(modelsJson).forEach(([modelName, modelInterface]) => {
      const filePath = `${modelsDirectory}${modelName}.ts`;
      fs.writeFileSync(filePath, modelInterface, 'utf8');
      console.log(`Modelo ${modelName} generado en: ${filePath}`);
    });
  })
  .catch(error => {
    console.error('Error al obtener el JSON del backend:', error);
  });
