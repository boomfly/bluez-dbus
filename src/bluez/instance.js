import { EventEmitter } from 'events'

class Instance extends EventEmitter {
  constructor(bus, service, object, interface, options) {
    super()

    this._bus = bus
    this._service = service
    this._object = object
    this._interface = interface
    this._options = options
    this._ready = false
    this._pending = {
      submitting: false,
      requests: []
    }

    this._objectProxy = null
  }

  getAll() {

  }

  get(name) {

  }

  set(name, value) {

  }

  async _init() {
    this._objectProxy = await this._bus.getProxyObject(this._service, this._object)
    this._interfaceProxy = await this._objectProxy.getInterface(this._interface)
  }

  async _check() {
    if (this._pending.submitting) {
      let request = {}
      let promise = new Promise(
        (resolve, reject) => Object.assign(request, {resolve, reject, promise})
      )
    }

    if (!this._ready) {
      try {
        await this._init()
      } catch (e) {
        this._failedPending(e)
        throw e
      }
      this._ready = true
      this._successPending()
    }

    return true
  }

  _successPending() {
    this._pending.requests.map((request) => request.resolve())
    this._pending.requests = []
    this._pending.submitting = false
  }

  _failedPending(e) {
    this._pending.requests.map((request) => request.reject(e))
    this._pending.requests = []
    this._pending.submitting = false
  }

}