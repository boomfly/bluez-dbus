import {Fetcher} from './fetcher'

export class Adapter {
  constructor(bus, adapter) {
    this._bus = bus
    this._adapter = adapter
    this._service = 'org.bluez'
    this._interface = 'org.bluez.Adapter1'

    this._objectProxy = new Fetcher(this._bus.getProxyObject(this._service, this._adapter))
  }

  async address() {
    let p = await this._getProperties()
    // return (await p.Get(this._interface, 'Address')).value
    // console.log((await this._objectProxy.get()).nodes)
    // console.log((await this._objectProxy.get()))
    return (await p.GetAll(this._interface))
  }

  async startDiscovery() {
    let i = await this._getInterface()
    i.StartDiscovery()
  }
  
  stopDiscovery() {

  }

  removeDevice(device) {

  }

  setDiscoveryFilter(filter) {

  }

  getDiscoveryFilters() {

  }

  async _getInterface() {
    let object = await this._objectProxy.get()
    return object.getInterface(this._interface)
  }

  async _getProperties() {
    let object = await this._objectProxy.get()
    return object.getInterface('org.freedesktop.DBus.Properties')
  }
}