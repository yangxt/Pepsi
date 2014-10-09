define(function() {
var EventEmitter = function() {

};

EventEmitter.prototype.on = function (name, fn) {
  if (!this._events) {
    this._events = {};
  }
  if (!this._events[name]) {
    this._events[name] = fn;
  } else if (this._events[name] instanceof Array) {
    this._events[name].push(fn);
  } else {
    this._events[name] = [this._events[name], fn];
  }

  return this;
};

EventEmitter.prototype.trigger = function (name) {
  if (!this._events) {
    return false;
  }

  var handler = this._events[name];

  if (!handler) {
    return false;
  }

  var args = Array.prototype.slice.call(arguments, 1);
  if ('function' == typeof handler) {
    handler.apply(this, args);
  } else if (handler instanceof Array) {
    var listeners = handler.slice();

    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
  } else {
    return false;
  }

  return true;
};

return EventEmitter;
});
