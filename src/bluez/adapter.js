import {GattLocalObjectManager} from './service'
import {Advertisement} from './advertisement'
import dbus from 'dbus-next'
import {EventEmitter} from 'events'
import { ConsoleMessage } from 'puppeteer-core'
const {Variant} = dbus

export class Adapter extends EventEmitter {
  static interface = 'org.bluez.Adapter1'

  static async from(objectProxy) {
    if (objectProxy instanceof Promise) {
      objectProxy = await objectProxy
    }
    const propertiesProxy = objectProxy.getInterface('org.freedesktop.DBus.Properties')
    const properties = await propertiesProxy.GetAll(Adapter.interface)

    const adapter = new Adapter(objectProxy, properties)
    return adapter
  }

  constructor(objectProxy, properties) {
    super()
    this._interface = Adapter.interface
    this._objectProxy = objectProxy
    this._interfaceProxy = this._objectProxy.getInterface(this._interface)
    this._propertiesProxy = this._objectProxy.getInterface('org.freedesktop.DBus.Properties')
    this._gattManagerProxy = this._objectProxy.getInterface('org.bluez.GattManager1')
    this._advertisingManagerProxy = this._objectProxy.getInterface('org.bluez.LEAdvertisingManager1')

    this._bus = this._objectProxy.bus
    this._properties = properties

    this._advertising = false
    this._advertisingServiceName = null
    this._advertisingServicePath = null
    this._advertisingServices = []

    this._discovering = false

    this._propertiesProxy.on('PropertiesChanged', (iface, changed, invalidated) => {
      for (let prop of Object.keys(changed)) {
        // console.log(`property changed: ${prop}`, changed[prop])
        this._properties[prop] = changed[prop]
      }
      this.emit('PropertiesChanged', {iface, changed, invalidated})
    })
  }

  async address() {
    // return (await p.Get(this._interface, 'Address')).value
    // console.log((await this._objectProxy.get()).nodes)
    // console.log((await this._objectProxy.get()))
    return (await this._propertiesProxy.GetAll(this._interface))
  }

  async properties() {
    // return (await p.Get(this._interface, 'Address')).value
    // console.log((await this._objectProxy.get()).nodes)
    // console.log((await this._objectProxy.get()))
    return (await this._propertiesProxy.GetAll(this._interface))
  }

  gattManager() {
    return this._objectProxy.getInterface('org.bluez.GattManager1')
  }

  advertisingManager() {
    return this._objectProxy.getInterface('org.bluez.LEAdvertisingManager1')
  }

  async addServices(services) {

  }

  setSerivces(services) {
    this._services = services
  }

  async startAdvertising(name = 'org.example') {
    // console.log('adapter::startAdvertising', )
    if (this._advertising) {
      throw new Error('errors.already_advertising')
    }

    this._advertisingServiceName = name
    this._advertisingServicePath = '/' + name.replace(/\./g, '/')
  
    await this._bus.requestName(this._advertisingServiceName)

    this._rootObject = new GattLocalObjectManager(this._advertisingServicePath)
    this._rootObject.setServices(this._services)

    let serviceUuids = this._services.map((service) => service.UUID)

    class ClonedAdvertisementClass extends Advertisement {}

    // let address = this._properties.Address.value.replace(/:/g, '')
    let address = this._properties.Address.value.split(':')
    // let addressBytes = address.map((b) => parseInt(b))

    let manufaturerData = Buffer.from(address.reverse().join(''), 'hex')
    // let manufaturerData = Buffer.from([1])

    console.log('adapter::startAdvertising', address, manufaturerData)

    this._advertisementObject = new ClonedAdvertisementClass({
      path: this._advertisingServicePath,
      type: 'peripheral',
      serviceUuids: serviceUuids,
      localName: 'Hello World',
      manufaturerData: {
        // [new Variant('q', 0x0059)]: new Variant('ay', Buffer.from([1, 1, 1]))
        0x0059: new Variant('ay', manufaturerData)
      }
    })

    // console.log('adapter::startAdvertising', this._advertisementObject.constructor.prototype.$properties)

    let enabledProperties = [
      'Type', 'ServiceUUIDs', 'ManufacturerData', 'LocalName']
    let $properties = {}
    for (let propName of enabledProperties) {
      $properties[propName] = ClonedAdvertisementClass.prototype.$properties[propName]
    }

    ClonedAdvertisementClass.prototype.$properties = $properties

    // console.log('adapter', Advertisement.prototype.$properties)

    await this._bus.export(this._advertisingServicePath, this._rootObject)
    for (let service of this._services) {
      let servicePath = this._advertisingServicePath + '/' + service.path
      await this._bus.export(servicePath, service)
      for (let characteristic of service.characteristics) {
        let characteristicPath = servicePath + '/' + characteristic.path
        await this._bus.export(characteristicPath, characteristic)
        // console.log('adapter::startAdvertising', characteristicPath)
      }
    }
    
    await this._bus.export(this._advertisingServicePath, this._advertisementObject)

    await this._gattManagerProxy.RegisterApplication(this._advertisingServicePath, {})
    await this._advertisingManagerProxy.RegisterAdvertisement(this._advertisingServicePath, {})
  }
  
  async stopAdvertising() {
    await this._advertisingManagerProxy.UnregisterAdvertisement(this._advertisingServicePath)
    await this._gattManagerProxy.UnregisterApplication(this._advertisingServicePath)
    await this._bus.unexport(this._advertisingServicePath, this._advertisementObject)
    await this._bus.export(this._advertisingServicePath, this._rootObject)
  }

  async startDiscovery() {
    await this._interfaceProxy.StartDiscovery()
  }
  
  async stopDiscovery() {
    await this._interfaceProxy.stopDiscovery()
  }

  removeDevice(device) {

  }

  setDiscoveryFilter(filter) {

  }

  getDiscoveryFilters() {

  }

  async pairable(value) {
    if (value !== undefined) {
      await this._propertiesProxy.Set('org.bluez.Adapter1', 'Pairable', new Variant('b', value))
      return
    }
    return (await this._propertiesProxy.Get('org.bluez.Adapter1', 'Pairable')).value
  }

}