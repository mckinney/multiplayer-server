import { server as SocketServer, worker, controller } from "../lib";
import socketClient from "socket.io-client";
import getPort from "get-port";

const availablePort = async function availablePort() {
	return await getPort({port: getPort.makeRange(3000, 3900)});
}

const startServer = async function startServer(port, io = {}) {
	const server = new SocketServer({
		redis: { host: "localhost", port: 6379 },
		io
	});
	await server.listen(port);
	const client = new socketClient(`http://localhost:${port}`);

	const socket = new Promise((resolve) => {
		server.io.on("connection", resolve);
	});

	const connection = new Promise((resolve) => {
		client.on("connect", () => resolve(client));
	});

	return Promise.all([server, socket, connection]);
};

const shutDownServer = function shutDownServer(server) {
	server.shutdown();
};

const startWorker = async function startWorker(port) {
	const server = new worker({
		redis: { host: "localhost", port: 6379 },
	});
	await server.listen(port);

	return server;
};

const startController = async function startController(port) {
	const server = new controller({
		redis: { host: "localhost", port: 6379 },
	});

	await server.listen(port);
	return server;
};


export { availablePort };
export { startWorker };
export { startController };
export { startServer };
export { shutDownServer };