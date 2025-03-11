import axios from 'axios';
import * as dotenv from 'dotenv';


dotenv.config();

const STRAPI_BASE_URL = 'https://strapi-production-c6c3.up.railway.app';
const STRAPI_API_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_ADMIN_URL = `${STRAPI_BASE_URL}/api`;
const API_TOKEN = process.env.STRAPI_API_TOKEN;
console.log(API_TOKEN)
if (!API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN no está definido en el archivo .env');
  process.exit(1);
}

console.log('URL de Strapi API:', STRAPI_API_URL);
console.log('URL de Strapi Admin:', STRAPI_ADMIN_URL);
console.log('Token (primeros 10 caracteres):', API_TOKEN?.substring(0, 10));

// Cliente para la API pública
const apiClient = axios.create({
  baseURL: STRAPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

// Cliente para la API administrativa
const adminClient = axios.create({
  baseURL: STRAPI_ADMIN_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

// Agregar interceptor para logs detallados
apiClient.interceptors.request.use(request => {
  console.log('Request headers:', request.headers);
  return request;
});

type ModelAttribute = {
  type: string;
  required?: boolean;
  multiple?: boolean;
  relation?: string;
  target?: string;
  enum?: string[];
};

type ModelDefinition = {
  displayName: string;
  singularName: string;
  pluralName: string;
  attributes: Record<string, ModelAttribute>;
};

type Models = {
  [key: string]: ModelDefinition;
};

const models: Models = {
  pilot: {
    displayName: 'Pilot',
    singularName: 'pilot',
    pluralName: 'pilots',
    attributes: {
      name: { type: 'string', required: true },
      kartNumber: { type: 'integer', required: true },
      categories: { type: 'json' },
      biography: { type: 'text' },
      country: { type: 'string', required: true },
      teamName: { type: 'string', required: true },
      profileUrl: { type: 'string' },
      teamLogo: { type: 'media', multiple: false },
    },
  },
  championship: {
    displayName: 'Championship',
    singularName: 'championship',
    pluralName: 'championships',
    attributes: {
      year: { type: 'string', required: true },
      season: {
        type: 'enumeration',
        required: true,
        enum: ['verano', 'invierno']
      },
      classes: { type: 'relation', relation: 'oneToMany', target: 'api::class.class' },
      teams: { type: 'relation', relation: 'oneToMany', target: 'api::team.team' },
    },
  },
  class: {
    displayName: 'Class',
    singularName: 'class',
    pluralName: 'classes',
    attributes: {
      title: { type: 'string', required: true },
      ageGroup: { type: 'string', required: true },
      details: { type: 'json' },
      img: { type: 'media', multiple: false },
      categories: { type: 'relation', relation: 'oneToMany', target: 'api::category.category' },
      championship: { type: 'relation', relation: 'manyToOne', target: 'api::championship.championship' },
    },
  },
  category: {
    displayName: 'Category',
    singularName: 'category',
    pluralName: 'categories',
    attributes: {
      name: { type: 'string', required: true },
      class: { type: 'relation', relation: 'manyToOne', target: 'api::class.class' },
      results: { type: 'relation', relation: 'oneToMany', target: 'api::race-result.race-result' },
    },
  },
  raceResult: {
    displayName: 'Race Result',
    singularName: 'race-result',
    pluralName: 'race-results',
    attributes: {
      points: { type: 'decimal' },
      rank: { type: 'integer' },
      number: { type: 'integer', required: true },
      country: { type: 'string', required: true },
      driver: { type: 'string', required: true },
      team: { type: 'string', required: true },
      scores: { type: 'json', required: true },
      worst: { type: 'integer', required: true },
      tiebreaker: { type: 'integer' },
      category: { type: 'relation', relation: 'manyToOne', target: 'api::category.category' },
    },
  },
  team: {
    displayName: 'Team',
    singularName: 'team',
    pluralName: 'teams',
    attributes: {
      name: { type: 'string', required: true },
      logo: { type: 'media', multiple: false },
      points: { type: 'integer', required: true },
      championship: { type: 'relation', relation: 'manyToOne', target: 'api::championship.championship' },
    },
  },
};

async function createContentType(model: ModelDefinition) {
  try {
    const response = await adminClient.post('/content-types/api::pilot.pilot', {
      contentType: {
        displayName: model.displayName,
        singularName: model.singularName,
        pluralName: model.pluralName,
        attributes: model.attributes,
      },
    });
    console.log(`Created model: ${model.displayName}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating model ${model.displayName}:`, error);
    throw error;
  }
}

async function createAllModels() {
  try {
    // Crear modelos en orden específico debido a las relaciones
    const order = ['pilot', 'championship', 'team', 'class', 'category', 'raceResult'];

    for (const modelName of order) {
      await createContentType(models[modelName]);
    }

    console.log('All models created successfully');
  } catch (error) {
    console.error('Error creating models:', error);
  }
}

// Función para probar la autenticación
async function testAuth() {
  try {
    // Probamos la API con un endpoint que sabemos que funciona
    const response = await apiClient.get('/users');
    console.log('API funcionando, usuarios encontrados:', response.data.length);
    return true;
  } catch (error: any) {
    console.error('Error de autenticación:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    return false;
  }
}

// Ejecutar el script
async function main() {
  const isAuthenticated = await testAuth();
  if (isAuthenticated) {
    await createAllModels();
  } else {
    console.error('No se pudo autenticar con Strapi. Verifica tu token de API.');
  }
}

main();
