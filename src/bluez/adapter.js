import {GattLocalObjectManager} from './service'
import {Advertisement} from './advertisement'
import dbus from 'dbus-next'
const {Variant} = dbus

export class Adapter {
  constructor(objectProxy) {
    this._interface = 'org.bluez.Adapter1'
    this._objectProxy = objectProxy
    this._interfaceProxy = this._objectProxy.getInterface(this._interface)
    this._propertiesProxy = this._objectProxy.getInterface('org.freedesktop.DBus.Properties')
    this._gattManagerProxy = this._objectProxy.getInterface('org.bluez.GattManager1')
    this._advertisingManagerProxy = this._objectProxy.getInterface('org.bluez.LEAdvertisingManager1')

    this._advertising = false
    this._advertisingServiceName = null
    this._advertisingServicePath = null
    this._advertisingServices = []

    this._discovering = false
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
    if (this._advertising) {
      throw new Error('errors.already_advertising')
    }

    this._advertisingServiceName = name
    this._advertisingServicePath = '/' + name.replace(/\./g, '/')

    let bus = this._objectProxy.bus
  

    await bus.requestName(this._advertisingServiceName)

    this._rootObject = new GattLocalObjectManager(this._advertisingServicePath)
    this._rootObject.setServices(this._services)

    let serviceUuids = this._services.map((service) => service.UUID)

    let advertisementObject = new Advertisement({
      path: this._advertisingServicePath,
      type: 'peripheral',
      serviceUuids: serviceUuids,
      localName: 'Hello World',
      manufaturerData: {
        // [new Variant('q', 0x0059)]: new Variant('ay', Buffer.from([1, 1, 1]))
        0x0059: new Variant('ay', Buffer.from([1, 1, 1]))
      }
      // manufaturerData: [
      //   0x0059,
      //   new Variant('ay', Buffer.from([1, 1, 1]))
      // ]
      // manufaturerData: new Variant('a{qv}', {
      //   0x059: new Variant('ay', Buffer.from([1, 1, 1]))
      // })
    })

    let enabledProperties = [
      'Type', 'ServiceUUIDs', 'ManufacturerData', 'LocalName']
    let $properties = {}
    for (let propName of enabledProperties) {
      $properties[propName] = Advertisement.prototype.$properties[propName]
    }

    Advertisement.prototype.$properties = $properties

    // console.log('adapter', Advertisement.prototype.$properties)

    await bus.export(this._advertisingServicePath, this._rootObject)
    for (let service of this._services) {
      let servicePath = this._advertisingServicePath + '/' + service.path
      await bus.export(servicePath, service)
      for (let characteristic of service.characteristics) {
        let characteristicPath = servicePath + '/' + characteristic.path
        await bus.export(characteristicPath, characteristic)
        console.log('adapter::startAdvertising', characteristicPath)
      }
    }
    // console.log('adapter::startAdvertising export advertising')
    await bus.export(this._advertisingServicePath, advertisementObject)

    // let obj = await bus.getProxyObject('org.smart', '/org/smart/service0/char0')
    // let ad = obj.getInterface('org.bluez.GattCharacteristic1')
    // // let adManager = obj.getInterface('org.bluez.LEAdvertisement1')
    // let props = obj.getInterface('org.freedesktop.DBus.Properties')
    // console.log('adapter::startAdvertising', ad)
    // console.log('adapter::startAdvertising', await props.Get('org.bluez.GattCharacteristic1', 'UUID'))
    // try {
    //   console.log('adapter::startAdvertising', await props.GetAll('org.bluez.GattCharacteristic1'))
    // } catch (e) {
    //   console.error(e)
    // }


    await this._gattManagerProxy.RegisterApplication(this._advertisingServicePath, {})

    try {
      // console.log('adapter::startAdvertising', await this._propertiesProxy.GetAll('org.bluez.LEAdvertisingManager1'))
      // let props = await this._propertiesProxy.GetAll('org.bluez.LEAdvertisingManager1')
      // if (props.ActiveInstances.value > 0) {
      //   await this._advertisingManagerProxy.UnregisterAdvertisement(this._advertisingServicePath)
      // }
      await this._advertisingManagerProxy.RegisterAdvertisement(this._advertisingServicePath, {})

    } catch (e) {
      console.error(e)
    }
  }

  async stopAdvertising() {

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