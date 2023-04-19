const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EveryFin Backend API',
      version: '1.0.0',
      description: 'EveryFin Backend API',
    },
    servers: [
      {
        url: 'http://localhost:7515',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Здесь указываются пути к файлам, содержащим маршруты API
};

const specs = swaggerJsdoc(options);
module.exports = specs;
