// Set environment variables BEFORE importing anything
process.env.JWT_SECRET = "testsecret";
process.env.DATABASE_URL = "mongodb://tickets-mongo-srv:27017/tickets";
process.env.NATS_URL = "http://nats-srv:4222"
process.env.NATS_CLUSTER_ID = "ticketing"
process.env.NATS_CLIENT_ID = "tickets-depl-añslkda-asñdlkj"

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

declare global {
	var setCookie: () => string[];
}

// Mock the connectDB function before importing server
jest.mock("../config/db", () => ({
	connectDB: jest.fn(),
}));

// Own Custom Implementation by Mocking the resend function
jest.mock("../config/resend");

let mongo: MongoMemoryServer;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();

	await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks(); // Resets mock implementations in between tests so that they are not polluted

	if (mongoose.connection.db) {
		const collections = await mongoose.connection.db.collections();

		for (let collection of collections) {
			await collection.deleteMany({});
		}
	}
});

afterAll(async () => {
	if (mongo) {
		await mongo.stop();
	}

	await mongoose.connection.close();
});

//* Declare auth Helper Function | Not adapted to current app
global.setCookie = () => {
	// 1. Build a JWT payload. { id, email }
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: "test@test.com",
	};

	// 2. Create the JWT
	const token = jwt.sign(payload, process.env.JWT_SECRET);

	// 3. Build session object { jwt: MY_JWT }
	const session = { jwt: token };

	// 4. Turn that session into JSON
	const sessionJSON = JSON.stringify(session);

	// 5. Take JSON and encode it as base64
	const base64 = Buffer.from(sessionJSON).toString("base64");

	// 6. return a string thats the cookie with the encoded data
	return [`session=${base64}`];
};