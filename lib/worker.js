import { nanoid } from 'nanoid';
import Server from './server';

class Worker extends Server {
	constructor(connection) {
		super(connection);
		this.id = nanoid();

		this.to("controller", "workers:add", { id: this.id });
		this.store.sadd("workers:active", this.id);
		this.sub.subscribe("workers:all");
		this.sub.subscribe(`workers:${this.id}`);
	}

	shutdown() {
		this.to("controller", "workers:remove", { id: this.id });
		this.store.srem("workers:active", this.id);
		super.shutdown();
	}
}

export default Worker;
