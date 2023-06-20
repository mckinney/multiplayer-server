"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _express = _interopRequireDefault(require("express"));

var _debug = _interopRequireDefault(require("debug"));

var _redisCommands = _interopRequireDefault(require("redis-commands"));

var _events = _interopRequireDefault(require("events"));

var _socket = require("socket.io-redis");

var _redis = require("redis");

var _socket2 = require("socket.io");

var _util = require("util");

var http = _interopRequireWildcard(require("http"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var log = (0, _debug["default"])("http");

var SocketServer = /*#__PURE__*/function () {
  function SocketServer() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, SocketServer);
    this.listening = false; // basic server setup

    this.app = (0, _express["default"])();
    this.httpServer = http.createServer(this.app);
    this.io = new _socket2.Server(this.httpServer, _objectSpread({
      serveClient: false
    }, options.io || {}));

    if (options.redis) {
      this.connectRedis(options.redis);
    }
  }

  (0, _createClass2["default"])(SocketServer, [{
    key: "connectRedis",
    value: function connectRedis(connection) {
      try {
        var client = (0, _redis.createClient)(connection);
        this.connectIoRedis(client);
        this.createPubSub(client);
        this.createStore(client);
      } catch (error) {
        throw error;
      }
    }
  }, {
    key: "connectIoRedis",
    value: function connectIoRedis(client) {
      this.io.adapter((0, _socket.createAdapter)({
        pubClient: client.duplicate(),
        subClient: client.duplicate()
      }));
    }
  }, {
    key: "createPubSub",
    value: function createPubSub(client) {
      this.pub = client.duplicate();
      this.sub = client.duplicate(); // this.publish = this.pub.publish.bind(this.pub);
      // this.subscribe = this.sub.subscribe.bind(this.sub);

      var emitter = new _events["default"].EventEmitter();
      this.on = emitter.on.bind(emitter);
      this.once = emitter.once.bind(emitter);
      this.sub.on("message", function (channel, message) {
        var _JSON$parse = JSON.parse(message),
            event = _JSON$parse.event,
            payload = _JSON$parse.payload;

        emitter.emit(event, payload);
      });
    }
  }, {
    key: "to",
    value: function to(channel, event, payload) {
      var promisePub = (0, _util.promisify)(this.pub.publish).bind(this.pub);
      return promisePub(channel, JSON.stringify({
        event: event,
        payload: payload
      }));
    }
  }, {
    key: "createStore",
    value: function createStore(client) {
      var _this = this;

      this.store = {};
      this._store = client;

      _redisCommands["default"].list.forEach(function (command) {
        _this.store[command] = (0, _util.promisify)(client[command]).bind(client);
      });

      this.store.multi = function () {
        var multi = client.multi();
        multi.exec = (0, _util.promisify)(multi.exec).bind(multi);
        return multi;
      };
    }
  }, {
    key: "listen",
    value: function () {
      var _listen = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(port) {
        var listen;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                listen = (0, _util.promisify)(this.httpServer.listen).bind(this.httpServer);
                this.port = port;
                _context.next = 4;
                return listen(this.port);

              case 4:
                log('Server listening at port %d', this.port);
                this.listening = true;
                this.app.get('/', function (req, res) {
                  res.status(200).send();
                });

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function listen(_x) {
        return _listen.apply(this, arguments);
      }

      return listen;
    }()
  }, {
    key: "shutdown",
    value: function () {
      var _shutdown = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this$io$of$adapter, pubClient, subClient, ioPubQuit, ioSubQuit, pubQuit, subQuit, storeQuit, ioClose;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$io$of$adapter = this.io.of('/').adapter, pubClient = _this$io$of$adapter.pubClient, subClient = _this$io$of$adapter.subClient; // close redis connections first

                ioPubQuit = (0, _util.promisify)(pubClient.quit).bind(pubClient);
                ioSubQuit = (0, _util.promisify)(subClient.quit).bind(subClient);
                pubQuit = (0, _util.promisify)(this.pub.quit).bind(this.pub);
                subQuit = (0, _util.promisify)(this.sub.quit).bind(this.sub);
                storeQuit = (0, _util.promisify)(this._store.quit).bind(this._store);
                ioClose = (0, _util.promisify)(this.io.close).bind(this.io);
                _context2.next = 9;
                return ioPubQuit();

              case 9:
                _context2.next = 11;
                return ioSubQuit();

              case 11:
                _context2.next = 13;
                return pubQuit();

              case 13:
                _context2.next = 15;
                return subQuit();

              case 15:
                _context2.next = 17;
                return storeQuit();

              case 17:
                _context2.next = 19;
                return ioClose();

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function shutdown() {
        return _shutdown.apply(this, arguments);
      }

      return shutdown;
    }()
  }]);
  return SocketServer;
}();

var _default = SocketServer;
exports["default"] = _default;