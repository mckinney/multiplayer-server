import { availablePort, startWorker, startController, shutDownServer } from "./utils";

describe("The controller ", () => {
	let controller, worker, worker2; // hoisted to be available in all test calls

	beforeAll(async (done) => {
		const controllerPort = await availablePort();
		const worker1Port = await availablePort();
		const worker2Port = await availablePort();

		controller = await startController(controllerPort);

		controller.sub.on("ready", async () => {
			worker = await startWorker(worker1Port);
			worker2 = await startWorker(worker2Port);
		});

		controller.on("workers:add", () => {
			if (controller.workerCount === 2) {
				done();
			}
		});

	});

	afterAll(() => {
		controller.store.flushdb();
		shutDownServer(controller);
		shutDownServer(worker);
		shutDownServer(worker2);
	});

	test("should count workers properly", () => {
		expect(controller.workerCount).toBe(2);
	});

	test("should receive signals from workers", (done) => {
		const eventName = "controller-event";

		new Promise((resolve) => {
			controller.on(eventName, (data) => {
				expect(data).toBe("data");
				resolve();
				done();
			});
		});

		worker.to("controller", eventName, "data");
	});

	test("should send signals to workers", () => {
		const event = "workerEvent";

		const workerPromise1 = new Promise((resolve) => {
			worker.once(event, resolve);
		});

		const workerPromise2 = new Promise((resolve) => {
			worker2.once(event, resolve);
		});

		controller.to("workers:all", event, "data");
		expect(workerPromise1).resolves.toBe("data");
		expect(workerPromise2).resolves.toBe("data");
	});

	test("should send signals to individual workers", (done) => {
		const eventName = "single-event";

		worker2.on(eventName, () => {
			fail('it should not send signals to worker 2');
		});

		new Promise((resolve) => {
			worker.once(eventName, (data) => {
				expect(data).toBe("data");
				resolve();
				done();
			});
		});

		controller.to(`workers:${worker.id}`, eventName, "data");
	});

	test("should verify number of message recievers", async (done) => {
		const receptionCount = await controller.to("workers:all", "reply-event", "data");
		expect(receptionCount).toBe(2);
		done();
	});

});