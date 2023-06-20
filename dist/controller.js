"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _server = _interopRequireDefault(require("./server"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Controller = /*#__PURE__*/function (_Server) {
  (0, _inherits2["default"])(Controller, _Server);

  var _super = _createSuper(Controller);

  function Controller(connection) {
    var _this;

    (0, _classCallCheck2["default"])(this, Controller);
    _this = _super.call(this, connection);
    _this.workers = {};

    _this.syncWorkers();

    _this.sub.subscribe("controller");

    _this.on("workers:add", function (worker) {
      return _this.addWorker(worker);
    });

    _this.on("workers:remove", function (worker) {
      return _this.removeWorker(worker);
    });

    return _this;
  }

  (0, _createClass2["default"])(Controller, [{
    key: "syncWorkers",
    value: function () {
      var _syncWorkers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this2 = this;

        var workers;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.store.smembers("workers:active");

              case 2:
                workers = _context2.sent;
                workers.forEach( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(id) {
                    var workerExists;
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return _this2.to("workers:".concat(id), "health-check");

                          case 2:
                            workerExists = _context.sent;

                            if (workerExists) {
                              _this2.addWorker({
                                id: id
                              });
                            } else {
                              _this2.removeWorker({
                                id: id
                              });
                            }

                          case 4:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x) {
                    return _ref.apply(this, arguments);
                  };
                }());

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function syncWorkers() {
        return _syncWorkers.apply(this, arguments);
      }

      return syncWorkers;
    }()
  }, {
    key: "workerCount",
    get: function get() {
      return Object.values(this.workers).length;
    }
  }, {
    key: "addWorker",
    value: function addWorker(worker) {
      this.store.sadd("workers:active", worker.id);
      this.workers[worker.id] = worker;
    }
  }, {
    key: "removeWorker",
    value: function removeWorker(worker) {
      this.store.srem("workers:active", worker.id);
      delete this.workers[worker.id];
    }
  }]);
  return Controller;
}(_server["default"]);

var _default = Controller;
exports["default"] = _default;