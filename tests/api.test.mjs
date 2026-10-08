import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import Event from "../src/models/event.mjs";
import TicketPurchase from "../src/models/ticket-purchase.mjs";
import TicketTier from "../src/models/ticket-tier.mjs";
import Server from "../src/server.mjs";

let mongoServer;
let app;
let token;
let eventId;
let tierId;

const user = {
  firstName: "Organizer",
  lastName: "Test",
  email: "organizer.test@example.com",
  password: "Password1!",
};

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const server = new Server();
  server.middleware();
  server.routes();
  app = server.app;

  await request(app).post("/api/v1/auth/register").send(user).expect(201);
  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: user.email,
    password: user.password,
  }).expect(200);
  token = loginResponse.body.token;

  const eventResponse = await request(app)
    .post("/api/v1/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test event",
      description: "Event for API tests",
      startDate: "2030-01-01T10:00:00.000Z",
      endDate: "2030-01-01T12:00:00.000Z",
      location: "Paris",
      isPublic: true,
      ticketingEnabled: true,
    })
    .expect(201);
  eventId = eventResponse.body._id;

  const tierResponse = await request(app)
    .post(`/api/v1/events/${eventId}/ticket-tiers`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Test tier", price: 12.5, totalQuantity: 1 })
    .expect(201);
  tierId = tierResponse.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("exposes Swagger UI without authentication", async () => {
  await request(app).get("/api-docs/").expect(200);
});

test("rejects a duplicate external purchase for the same event email", async () => {
  await request(app)
    .post(`/api/v1/events/${eventId}/tickets/purchase`)
    .send({
      ticketTierId: tierId,
      buyer: { firstName: "External", lastName: "Buyer", fullAddress: "Paris", email: "buyer@example.com" },
    })
    .expect(201);

  await request(app)
    .post(`/api/v1/events/${eventId}/tickets/purchase`)
    .send({
      ticketTierId: tierId,
      buyer: { firstName: "External", lastName: "Buyer", fullAddress: "Paris", email: "BUYER@example.com" },
    })
    .expect(409);
});

test("does not sell a ticket after the tier is exhausted", async () => {
  await request(app)
    .post(`/api/v1/events/${eventId}/tickets/purchase`)
    .send({
      ticketTierId: tierId,
      buyer: { firstName: "Second", lastName: "Buyer", fullAddress: "Paris", email: "second@example.com" },
    })
    .expect(409);

  const tier = await TicketTier.findById(tierId).lean();
  expect(tier.soldQuantity).toBe(tier.totalQuantity);
  expect(await TicketPurchase.countDocuments({ eventId })).toBe(1);
});

test("does not sell from a different event tier", async () => {
  const otherEvent = await Event.create({
    title: "Other event",
    description: "Other event",
    startDate: new Date("2030-02-01T10:00:00.000Z"),
    endDate: new Date("2030-02-01T12:00:00.000Z"),
    location: "Lyon",
    isPublic: true,
    ticketingEnabled: true,
    organizers: [],
    participants: [],
  });

  await request(app)
    .post(`/api/v1/events/${otherEvent._id}/tickets/purchase`)
    .send({
      ticketTierId: tierId,
      buyer: { firstName: "Invalid", lastName: "Tier", fullAddress: "Lyon", email: "invalid@example.com" },
    })
    .expect(404);
});
