import { EventEmitter } from 'events'

export class Fetcher {
  constructor(promise) {
    this._promise = promise
    this._value = null
    this._ready = false
    this._pending = {
      submitting: false,
      requests: []
    }
  }

  async get() {
    if (this._pending.submitting) {
      let request = {}
      let promise = new Promise(
        (resolve, reject) => Object.assign(request, {resolve, reject, promise})
      )
      this._pending.requests.push(request)
      await promise
    }
    
    if (!this._ready) {
      try {
        this._value = await this._promise
        this._pending.requests.map((request) => request.resolve())
      } catch (e) {
        // this._failedPending(e)
        this._pending.requests.map((request) => request.reject(e))
        throw e
      } finally {
        this._ready = true
        this._pending.requests = []
        this._pending.submitting = false
      }
      // this._successPending()
    }

    return this._value
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