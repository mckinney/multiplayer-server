import { expect } from "@jest/globals";
import { availablePort, startServer, shutDownServer } from "./utils";

describe("The redis store ", () => {
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

	afterAll(async () => {
		A.server.store.flushdb();
		shutDownServer(A.server);
		shutDownServer(B.server);
	});

	test("should work with setting data", async (done) => {
		const reply = await A.server.store.set("test", "value");
		expect(reply).toBe("OK");
		done();
	});

	test("should work with getting data", async (done) => {
		await A.server.store.set("test", "new value");
		const reply = await A.server.store.get("test");
		expect(reply).toBe("new value");
		done();
	});

	test("should work with getting data across servers", async (done) => {
		await A.server.store.set("test", "cross value");
		const reply = await B.server.store.get("test");
		expect(reply).toBe("cross value");
		done();
	});

	test("should allow transactions", async (done) => {
		const transaction = A.server.store.multi();
		transaction.set("A", 1);
		transaction.set("B", 2);
		transaction.set("C", 3);
		const replies = await transaction.exec();
		expect(replies).not.toContain(0);
		expect(replies.length).toBe(3);
		done();
	});
});

process
  .on('SIGTERM', () => {})
  .on('SIGINT', () => {})
  .on('uncaughtException', (error) => {
	  console.log('uncaught exception', error);
  });