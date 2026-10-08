const jsonBody = (schema) => ({
  required: true,
  content: { "application/json": { schema } },
});

const errorResponse = {
  description: "Erreur",
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "My Social Networks API",
    version: "1.0.0",
    description: "API sociale pour groupes, événements, discussions, albums, sondages et billetterie.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Auth" }, { name: "Groups" }, { name: "Events" },
    { name: "Threads" }, { name: "Photos" }, { name: "Polls" }, { name: "Tickets" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: { type: "object", properties: { message: { type: "string" } } },
      AuthRequest: {
        type: "object", required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } },
      },
      GroupEventRequest: {
        type: "object", required: ["title", "description", "startDate", "endDate", "location"],
        properties: {
          title: { type: "string" }, description: { type: "string" },
          startDate: { type: "string", format: "date-time" }, endDate: { type: "string", format: "date-time" },
          location: { type: "string" }, coverUrl: { type: "string" }, isPublic: { type: "boolean" },
          ticketingEnabled: { type: "boolean" }, shoppingListEnabled: { type: "boolean" }, carpoolingEnabled: { type: "boolean" },
        },
      },
      TicketTier: {
        type: "object", required: ["name", "price", "totalQuantity"],
        properties: {
          name: { type: "string" }, price: { type: "number", minimum: 0 },
          totalQuantity: { type: "integer", minimum: 1 }, soldQuantity: { type: "integer", minimum: 0, readOnly: true },
        },
      },
      TicketPurchase: {
        type: "object", required: ["ticketTierId", "buyer"],
        properties: {
          ticketTierId: { type: "string" },
          buyer: {
            type: "object", required: ["firstName", "lastName", "fullAddress", "email"],
            properties: {
              firstName: { type: "string" }, lastName: { type: "string" },
              fullAddress: { type: "string" }, email: { type: "string", format: "email" },
            },
          },
        },
      },
      Poll: {
        type: "object", required: ["title", "questions"],
        properties: {
          title: { type: "string" },
          questions: {
            type: "array", items: {
              type: "object", required: ["questionText", "options"], properties: {
                questionText: { type: "string" }, options: { type: "array", minItems: 2, items: { type: "object", required: ["id", "text"], properties: { id: { type: "string" }, text: { type: "string" } } } },
              }
            }
          },
        },
      },
    },
  },
  paths: {
    "/api/v1/auth/register": { post: { tags: ["Auth"], summary: "Créer un compte", requestBody: jsonBody({ $ref: "#/components/schemas/AuthRequest" }), responses: { 201: { description: "Compte créé" }, 400: errorResponse } } },
    "/api/v1/auth/login": { post: { tags: ["Auth"], summary: "Se connecter", requestBody: jsonBody({ $ref: "#/components/schemas/AuthRequest" }), responses: { 200: { description: "JWT retourné" }, 401: errorResponse } } },
    "/api/v1/groups": { post: { tags: ["Groups"], security: [{ bearerAuth: [] }], summary: "Créer un groupe", responses: { 201: { description: "Groupe créé" }, 401: errorResponse } }, get: { tags: ["Groups"], security: [{ bearerAuth: [] }], summary: "Lister les groupes", responses: { 200: { description: "Groupes" } } } },
    "/api/v1/groups/{id}/join": { post: { tags: ["Groups"], security: [{ bearerAuth: [] }], summary: "Rejoindre un groupe", parameters: [{ $ref: "#/components/parameters/id" }], responses: { 200: { description: "Groupe rejoint" }, 403: errorResponse } } },
    "/api/v1/groups/{id}/leave": { post: { tags: ["Groups"], security: [{ bearerAuth: [] }], summary: "Quitter un groupe", parameters: [{ $ref: "#/components/parameters/id" }], responses: { 200: { description: "Groupe quitté" } } } },
    "/api/v1/groups/{groupId}/events": { post: { tags: ["Events"], security: [{ bearerAuth: [] }], summary: "Créer un événement de groupe", parameters: [{ $ref: "#/components/parameters/groupId" }], requestBody: jsonBody({ $ref: "#/components/schemas/GroupEventRequest" }), responses: { 201: { description: "Événement créé" }, 403: errorResponse } } },
    "/api/v1/events": { post: { tags: ["Events"], security: [{ bearerAuth: [] }], summary: "Créer un événement", requestBody: jsonBody({ $ref: "#/components/schemas/GroupEventRequest" }), responses: { 201: { description: "Événement créé" } } }, get: { tags: ["Events"], security: [{ bearerAuth: [] }], summary: "Lister les événements visibles", responses: { 200: { description: "Événements" } } } },
    "/api/v1/events/{eventId}/ticket-tiers": { post: { tags: ["Tickets"], security: [{ bearerAuth: [] }], summary: "Créer un tarif", parameters: [{ $ref: "#/components/parameters/eventId" }], requestBody: jsonBody({ $ref: "#/components/schemas/TicketTier" }), responses: { 201: { description: "Tarif créé" }, 403: errorResponse } }, get: { tags: ["Tickets"], security: [{ bearerAuth: [] }], summary: "Lister les tarifs", parameters: [{ $ref: "#/components/parameters/eventId" }], responses: { 200: { description: "Tarifs" } } } },
    "/api/v1/events/{eventId}/tickets/purchase": { post: { tags: ["Tickets"], summary: "Acheter un billet extérieur", parameters: [{ $ref: "#/components/parameters/eventId" }], requestBody: jsonBody({ $ref: "#/components/schemas/TicketPurchase" }), responses: { 201: { description: "Billet acheté" }, 409: errorResponse } } },
    "/api/v1/events/{eventId}/polls": { post: { tags: ["Polls"], security: [{ bearerAuth: [] }], summary: "Créer un sondage", parameters: [{ $ref: "#/components/parameters/eventId" }], requestBody: jsonBody({ $ref: "#/components/schemas/Poll" }), responses: { 201: { description: "Sondage créé" }, 403: errorResponse } } },
    "/api/v1/polls/{pollId}/vote": { post: { tags: ["Polls"], security: [{ bearerAuth: [] }], summary: "Répondre à un sondage", parameters: [{ $ref: "#/components/parameters/pollId" }], requestBody: jsonBody({ type: "object", required: ["answers"], properties: { answers: { type: "array", items: { type: "object", properties: { questionId: { type: "string" }, selectedOptionId: { type: "string" } } } } } }), responses: { 201: { description: "Vote enregistré" }, 409: errorResponse } } },
    "/api/v1/polls/{pollId}/results": { get: { tags: ["Polls"], security: [{ bearerAuth: [] }], summary: "Résultats d'un sondage", parameters: [{ $ref: "#/components/parameters/pollId" }], responses: { 200: { description: "Résultats" } } } },
    "/api/v1/photos/{photoId}/comments": { get: { tags: ["Photos"], security: [{ bearerAuth: [] }], summary: "Lister les commentaires", parameters: [{ $ref: "#/components/parameters/photoId" }], responses: { 200: { description: "Commentaires" } } }, post: { tags: ["Photos"], security: [{ bearerAuth: [] }], summary: "Commenter une photo", parameters: [{ $ref: "#/components/parameters/photoId" }], requestBody: jsonBody({ type: "object", required: ["content"], properties: { content: { type: "string" } } }), responses: { 201: { description: "Commentaire créé" } } } },
  },
};

openapi.components.parameters = {
  id: { name: "id", in: "path", required: true, schema: { type: "string" } },
  groupId: { name: "groupId", in: "path", required: true, schema: { type: "string" } },
  eventId: { name: "eventId", in: "path", required: true, schema: { type: "string" } },
  pollId: { name: "pollId", in: "path", required: true, schema: { type: "string" } },
  photoId: { name: "photoId", in: "path", required: true, schema: { type: "string" } },
};

export default openapi;
