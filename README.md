# My Social Networks API

API REST Express/Mongoose pour gérer des groupes, événements, discussions, albums photo, sondages et billetterie.

## Pré-requis

- Node.js 18+
- MongoDB 6+ accessible par une URI
- npm

## Installation

```bash
npm install
cp .env.example .env
```

Configurer ensuite `.env` :

```env
MONGODB_URI=mongodb://127.0.0.1:27017/my-social-networks
JWT_SECRET=change-me-with-a-long-random-secret
```

Démarrer l'API :

```bash
npm start
```

L'API écoute sur `http://localhost:3000`.

## Documentation OpenAPI

Swagger UI est disponible sans authentification à l'adresse [`http://localhost:3000/api-docs/`](http://localhost:3000/api-docs/).

Le document OpenAPI est défini dans [src/openapi.mjs](src/openapi.mjs).

## Seed

Le seed supprime les données des collections fonctionnelles puis crée :

- 2 utilisateurs ;
- 1 groupe public contenant les deux utilisateurs ;
- 1 événement public avec billetterie activée ;
- 2 tarifs ;
- 1 achat extérieur.

```bash
npm run seed
```

Comptes créés :

- `alice.seed@example.com` / `SeedPassword1!`
- `bob.seed@example.com` / `SeedPassword1!`

Le script affiche les identifiants MongoDB créés. Il doit être exécuté avec `MONGODB_URI` configurée.

## Tests

Les tests d'API utilisent Jest, Supertest et MongoDB en mémoire :

```bash
npm test
```

La suite vérifie notamment Swagger, l'authentification, la création de tarifs, l'achat unique par email, le stock épuisé et l'association d'un tarif à son événement.

## Authentification

Toutes les routes sont protégées par JWT sauf :

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/events/:eventId/tickets/purchase`
- `/api-docs/`

Utiliser le token retourné par le login :

```http
Authorization: Bearer <token>
```

## Endpoints

### Authentification

- `POST /api/v1/auth/register` : créer un compte (`firstName`, `lastName`, `email`, `password`).
- `POST /api/v1/auth/login` : obtenir un JWT.
- `GET /api/v1/me` : consulter son profil.

### Groupes

- `POST /api/v1/groups` : créer un groupe.
- `GET /api/v1/groups` : lister les groupes visibles.
- `GET /api/v1/groups/:id` : consulter un groupe.
- `PATCH /api/v1/groups/:id` : modifier un groupe, administrateur uniquement.
- `DELETE /api/v1/groups/:id` : supprimer un groupe, administrateur uniquement.
- `POST /api/v1/groups/:id/join` : rejoindre un groupe public.
- `POST /api/v1/groups/:id/leave` : quitter un groupe.
- `POST /api/v1/groups/:id/members` : inviter un membre, administrateur uniquement (`userId`).
- `PATCH /api/v1/groups/:id/admins` : promouvoir/rétrograder un membre (`userId`, `action`).
- `POST /api/v1/groups/:groupId/events` : créer un événement de groupe avec tous les membres participants.

### Événements

- `POST /api/v1/events` : créer un événement.
- `GET /api/v1/events` : lister les événements visibles.
- `GET /api/v1/events/:id` : consulter un événement.
- `PATCH /api/v1/events/:id` : modifier un événement, organisateur uniquement.
- `DELETE /api/v1/events/:id` : supprimer un événement, organisateur uniquement.
- `POST /api/v1/events/:id/attend` : participer à un événement public.
- `POST /api/v1/events/:id/leave` : quitter un événement.
- `POST /api/v1/events/:eventId/polls` : créer un sondage, organisateur uniquement.
- `POST /api/v1/events/:eventId/ticket-tiers` : créer un tarif sur un événement public avec billetterie, organisateur uniquement.
- `GET /api/v1/events/:eventId/ticket-tiers` : lister les tarifs disponibles.
- `GET /api/v1/events/:eventId/album` : consulter l'album, participant uniquement.
- `POST /api/v1/events/:eventId/album/photos` : ajouter une photo, participant uniquement.
- `POST /api/v1/events/:eventId/tickets/purchase` : acheter un billet extérieur avec `ticketTierId` et `buyer`.

### Discussions

- `GET /api/v1/threads/:targetType/:targetId/messages` : lire le fil d'un groupe ou événement.
- `POST /api/v1/threads/:targetType/:targetId/messages` : publier un message.
- `POST /api/v1/threads/messages/:messageId/replies` : répondre à un message.

### Photos

- `GET /api/v1/photos/:photoId/comments` : lister les commentaires, participant uniquement.
- `POST /api/v1/photos/:photoId/comments` : commenter une photo, participant uniquement.
- `DELETE /api/v1/photos/:photoId` : supprimer une photo, auteur ou organisateur.

### Sondages

- `PATCH /api/v1/polls/:pollId/close` : fermer un sondage, organisateur uniquement.
- `POST /api/v1/polls/:pollId/vote` : répondre une fois à un sondage, participant uniquement.
- `GET /api/v1/polls/:pollId/results` : consulter les résultats, participant uniquement.

## Achat de billet

Exemple :

```json
{
  "ticketTierId": "64f000000000000000000001",
  "buyer": {
    "firstName": "Camille",
    "lastName": "Dupont",
    "fullAddress": "10 rue de Paris, 75001 Paris",
    "email": "camille@example.com"
  }
}
```

Un seul achat est autorisé par couple `eventId` et email. La réservation du stock est atomique.

## Structure

- `src/models` : schémas Mongoose.
- `src/services` : logique métier et autorisations.
- `src/controllers` : handlers HTTP.
- `src/routes` : routes Express.
- `scripts/seed.mjs` : données de démonstration.
- `tests` : tests API Jest/Supertest.
