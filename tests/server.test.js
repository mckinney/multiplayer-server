import request from "supertest";
import { availablePort, startServer, shutDownServer } from "./utils";

describe("The app server ", () => {
	let server, socket, client; // hoisted to be available in all test calls

	beforeAll(async (done) => {
		const port = await availablePort();
		([ server, socket, client ] = await startServer(port, {
			connectTimeout: 10000,
		}));
		done();
	});

	afterAll(() => {
		shutDownServer(server);
	});

	test('return ok at /', (done) => {
		request(server.app)
		.get('/')
		.expect(200, done);
	});

	test('should pass args to the io engine properly', (done) => {
		expect(server.io.connectTimeout()).toBe(10000);
		done();
	});
});