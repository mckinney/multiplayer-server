
# Multiplayer Server

A bare bones server for connecting multiplayer games/apps via Sockets and redis.

## Features

- Connect to a socket.io service that uses redis
- Allow horizontal scaling with multiple worker nodes and a single controller node to distribute work
- Store and access game data in the redis database


## Getting Started

This project is deisgned to form the basis for a multiplayer game, handling some (but not all) of the deatils surrounding multiplayer communication/synchronization.

There are two classes available to use, the `worker` and the `controller` class.  Both handle connecting to redis, implementing socket.io, and communication between the controller and worker.  If you don't plan to scale horizontally, you may only need the worker class, but unless there are concerns about

### Controller Setup
```js
import { controller as server } from "mck-multiplayer";

const controller = new server({
	redis: { url: process.env.REDIS_URL },
});

const port = process.env.PORT || 3000;
controller.listen(port);

export default controller;
```

### Worker Setup

```js
import { worker as server } from "mck-multiplayer";

const worker = new server({
	redis: { url: process.env.REDIS_URL },
});

const port = process.env.PORT || 3000;
worker.listen(port);

export default worker;
```

### CORS

Because clients connect only to the worker, you will not need to add CORS arguments to the controller, unless your workers and controller are on separate domains.  Both the worker and controller extend the same base server class, so all of the socket.io and express options are available to both classes.

```js
import { worker as server } from "mck-multiplayer";

const cors = {
	origin:  process.env.CORS_ORIGIN,
	methods: ["GET", "POST"],
	credentials: true
};

const worker = new server({
	redis: { url: process.env.REDIS_URL },
	io: { cors },
});

const port = process.env.PORT || 3000;
worker.listen(port);

export default worker;

```

## Communicating

Communication is the key to the servers, both to the client and each other. In addition to listening to whatever events you may setup from the client, workers will listen for 2 events from the controller.

| Channel | Sent By | Received By |
|---|---|---|
| `workers:all`  | Controller  | All Workers |
| `workers:${workerId}` | Controller | Worker specified by $workerId |
| `controller` | Workers | Controller |
| `$GameId` | Workers | Clients |

## Extending the Servers

The multiplayer server uses [express](https://expressjs.com/) and [socket.io](https://socket.io/) for the underlying architecture. Options for instantiating the socket.io server can be passed to the constructor via the `io` property of the worker/controller class.

The express server is available to modify via `worker.app` or `controller.app`.  The socket.io instance is available at `worker.io` or `controller.io`.

By default, both servers will return `200` at the root URL. This behavior cannot be changed, but can be extended by adding additional routes to the express server. This may be useful if you would like to provide a dashboard for live game data.

## Testing

Install [Docker Compose](https://docs.docker.com/compose/install/), then:

```
npm install
npm test
```

This will run the test suite to ensure that everything is working.  If you have something else running on port `6379`, the tests will fail, because the redis server will be unreachable.
