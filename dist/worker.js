"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _nanoid = require("nanoid");

var _server = _interopRequireDefault(require("./server"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var Worker = /*#__PURE__*/function (_Server) {
  (0, _inherits2["default"])(Worker, _Server);

  var _super = _createSuper(Worker);

  function Worker(connection) {
    var _this;

    (0, _classCallCheck2["default"])(this, Worker);
    _this = _super.call(this, connection);
    _this.id = (0, _nanoid.nanoid)();

    _this.to("controller", "workers:add", {
      id: _this.id
    });

    _this.store.sadd("workers:active", _this.id);

    _this.sub.subscribe("workers:all");

    _this.sub.subscribe("workers:".concat(_this.id));

    return _this;
  }

  (0, _createClass2["default"])(Worker, [{
    key: "shutdown",
    value: function shutdown() {
      this.to("controller", "workers:remove", {
        id: this.id
      });
      this.store.srem("workers:active", this.id);
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(Worker.prototype), "shutdown", this).call(this);
    }
  }]);
  return Worker;
}(_server["default"]);

var _default = Worker;
exports["default"] = _default;