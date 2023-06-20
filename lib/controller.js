import Server from "./server";

class Controller extends Server {
	constructor(connection) {
		super(connection);
		this.workers = {};

		this.syncWorkers();
		this.sub.subscribe("controller");
		this.on("workers:add", (worker) => this.addWorker(worker));
		this.on("workers:remove", (worker) => this.removeWorker(worker));
	}

	async syncWorkers() {
		const workers = await this.store.smembers("workers:active");
		workers.forEach(async (id) => {
			const workerExists = await this.to(`workers:${id}`, "health-check");

			if (workerExists) {
				this.addWorker({ id });
			} else {
				this.removeWorker({ id });
			}
		});
	}

	get workerCount() {
		return Object.values(this.workers).length;
	}

	addWorker(worker) {
		this.store.sadd("workers:active", worker.id);
		this.workers[worker.id] = worker;
	}

	removeWorker(worker) {
		this.store.srem("workers:active", worker.id);
		delete this.workers[worker.id];
	}
}

export default Controller;
