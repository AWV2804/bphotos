import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Define Swagger options dynamically
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BPhotos API',
            version: '1.0.0',
            description: 'API documentation for the self-hosted BPhotos system',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Change when deployed
                description: 'Local development server',
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme',
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: ['./src/routes/*.ts'], // **Dynamically scan route files**
};

// Initialize Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Function to use Swagger in Express
export function setupSwagger(app: Express) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log('📄 Swagger Docs available at http://localhost:3000/api-docs');
}