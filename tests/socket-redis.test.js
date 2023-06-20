import { availablePort, startServer, shutDownServer } from "./utils";

describe("The redis socket connection ", () => {
	let A, B; // hoisted to be available in all test calls

	beforeAll(async (done) => {
		const portA = await availablePort();
		const portB = await availablePort();

		let [ server, socket, client ] = await startServer(portA);
		A = { server, socket, client };
		([ server, socket, client ] = await startServer(portB));
		B = { server, socket, client };
		done();
	});

	afterAll(() => {
		shutDownServer(A.server);
		shutDownServer(B.server);
	});

	test("should work with local flag", (done) => {
		const event = "server.local";

		A.client.once(event, (arg) => {
			expect(arg).toBe("local");
			done();
		});
		A.server.io.local.emit(event, "local");
	});

	test("should work from Server A to Client B", (done) => {
		const event = "server.A-B";

		B.client.once(event, (arg) => {
			expect(arg).toBe("redis");
			done();
		});

		A.server.io.emit(event, "redis");
	});

	test("should work from Client A to Client B", (done) => {
		const event = "server.A-B";

		B.client.once(event, (arg) => {
			expect(arg).toBe("redis");
			done();
		});

		A.socket.on(event, (arg) => A.socket.broadcast.emit(event, arg));
		A.client.emit(event, "redis");
	});

	test("should work from local client Socket to server Socket", (done) => {
		const event = "client.A-B";

		A.socket.once(event, (arg) => {
			expect(arg).toBe("redis");
			done();
		});
		A.client.emit(event, "redis");
	});

	test("should work from local server Socket to client Socket", (done) => {
		const event = "client.A-B";

		A.client.once(event, (arg) => {
			expect(arg).toBe("redis");
			done();
		});
		A.socket.emit(event, "redis");
	});
});