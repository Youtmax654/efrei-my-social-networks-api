import bcrypt from "bcrypt";
import "dotenv/config";
import mongoose from "mongoose";
import Event from "../src/models/event.mjs";
import Group from "../src/models/group.mjs";
import TicketPurchase from "../src/models/ticket-purchase.mjs";
import TicketTier from "../src/models/ticket-tier.mjs";
import User from "../src/models/user.mjs";

const mongodbUri = process.env.MONGODB_URI;
if (!mongodbUri) {
  throw new Error("MONGODB_URI est obligatoire pour exécuter le seed");
}

await mongoose.connect(mongodbUri);

try {
  await Promise.all([
    TicketPurchase.deleteMany({}),
    TicketTier.deleteMany({}),
    Event.deleteMany({}),
    Group.deleteMany({}),
    User.deleteMany({}),
  ]);

  const password = await bcrypt.hash("SeedPassword1!", 10);
  const [alice, bob] = await User.create([
    { firstName: "Alice", lastName: "Martin", email: "alice.seed@example.com", password },
    { firstName: "Bob", lastName: "Durand", email: "bob.seed@example.com", password },
  ]);

  const group = await Group.create({
    name: "Groupe Seed",
    description: "Groupe de démonstration",
    type: "public",
    admins: [alice._id],
    members: [alice._id, bob._id],
  });

  const event = await Event.create({
    title: "Événement Seed",
    description: "Événement public de démonstration",
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 26 * 60 * 60 * 1000),
    location: "Paris",
    isPublic: true,
    organizers: [alice._id],
    participants: [alice._id, bob._id],
    groupId: group._id,
    ticketingEnabled: true,
  });

  const [standardTier, vipTier] = await TicketTier.create([
    { eventId: event._id, name: "Standard", price: 10, totalQuantity: 100 },
    { eventId: event._id, name: "VIP", price: 25, totalQuantity: 20 },
  ]);

  await TicketPurchase.create({
    ticketTierId: standardTier._id,
    eventId: event._id,
    buyer: {
      firstName: "Charlie",
      lastName: "Seed",
      fullAddress: "1 rue du Test, 75001 Paris",
      email: "charlie.seed@example.com",
    },
  });

  console.log(JSON.stringify({
    users: [alice.email, bob.email],
    groupId: group._id,
    eventId: event._id,
    ticketTierIds: [standardTier._id, vipTier._id],
  }, null, 2));
} finally {
  await mongoose.disconnect();
}
