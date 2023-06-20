import { availablePort, startWorker, startController, shutDownServer } from "./utils";

describe("The worker ", () => {
	let controller, worker; // hoisted to be available in all test calls

	beforeAll(async (done) => {
		const controllerPort = await availablePort();
		const workerPort = await availablePort();

		controller = await startController(controllerPort);
		worker = await startWorker(workerPort);
		worker.sub.on("ready", done);
	});

	afterAll(() => {
		controller.store.flushdb();
		shutDownServer(controller);
		shutDownServer(worker);
	});

	test("should receive signals to all workers", (done) => {
		const eventName = "worker-event";

		new Promise((resolve) => {
			worker.on(eventName, (data) => {
				expect(data).toBe("data");
				resolve();
				done();
			});
		});

		controller.to("workers:all", eventName, "data");
	});

	test("should receive signals to itself specifically", (done) => {
		const eventName = "worker-event";

		new Promise((resolve) => {
			worker.on(eventName, (data) => {
				expect(data).toBe("data");
				resolve();
				done();
			});
		});

		controller.to(`workers:${worker.id}`, eventName, "data");
	});
});