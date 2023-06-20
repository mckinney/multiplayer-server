import express from 'express';
import debug from "debug";
import commands from "redis-commands";
import events from "events";
import { createAdapter } from 'socket.io-redis';
import { createClient } from 'redis';
import { Server } from "socket.io";
import { promisify } from 'util';
import * as http from "http";

const log = debug("multiplayer:server");

class SocketServer {
	constructor(options = {}) {
		this.listening = false;

		// basic server setup
		this.app = express();
		this.httpServer = http.createServer(this.app);
		this.io = new Server(this.httpServer, {
			serveClient: false,
			...(options.io || {}),
		});

		if (options.redis) {
			this.connectRedis(options.redis);
		}
	}

	connectRedis(connection) {
		const client = createClient(connection);
		this.connectIoRedis(client);
		this.createPubSub(client);
		this.createStore(client);
	}

	connectIoRedis(client) {
		this.io.adapter(createAdapter({
			pubClient: client.duplicate(),
			subClient: client.duplicate(),
		}));
	}

	createPubSub(client) {
		this.pub = client.duplicate();
		this.sub = client.duplicate();
		// this.publish = this.pub.publish.bind(this.pub);
		// this.subscribe = this.sub.subscribe.bind(this.sub);

		const emitter = new events.EventEmitter();
		this.on = emitter.on.bind(emitter);
		this.once = emitter.once.bind(emitter);
		this.sub.on("message", (channel, message) => {
			const { event, payload } = JSON.parse(message);
			emitter.emit(event, payload);
		});
	}

	to(channel, event, payload) {
		const promisePub = promisify(this.pub.publish).bind(this.pub);
		return promisePub(channel, JSON.stringify({ event, payload }));
	}

	createStore(client) {
		this.store = {};
		this.storeClient = client;

		commands.list.forEach((command) => {
			this.store[command] = promisify(client[command]).bind(client);
		});

		this.store.multi = () => {
			const multi = client.multi();
			multi.exec = promisify(multi.exec).bind(multi);
			return multi;
		};
	}

	async listen(port) {
		const listen = promisify(this.httpServer.listen).bind(this.httpServer);
		this.port = port;

		await listen(this.port);
		log('Server listening at port %d', this.port);
		this.listening = true;

		this.app.get('/', (req, res) => {
			res.status(200).send();
		});
	}

	async shutdown() {
		const { pubClient, subClient } = this.io.of('/').adapter;

		// close redis connections first
		const ioPubQuit = promisify(pubClient.quit).bind(pubClient);
		const ioSubQuit = promisify(subClient.quit).bind(subClient);
		const pubQuit = promisify(this.pub.quit).bind(this.pub);
		const subQuit = promisify(this.sub.quit).bind(this.sub);
		const storeQuit = promisify(this.storeClient.quit).bind(this.storeClient);

		const ioClose = promisify(this.io.close).bind(this.io);

		await ioPubQuit();
		await ioSubQuit();
		await pubQuit();
		await subQuit();
		await storeQuit();
		await ioClose();
	}
}

export default SocketServer;
