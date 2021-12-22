import dbus from 'dbus-next'
import {Adapter} from './adapter'
import {GattLocalObjectManager} from './service'
import {Advertisement} from './advertisement'

const serviceName = process.env.BT_SERVICE_NAME || 'org.smart'
const servicePath = process.env.BT_SERVICE_PATH || '/org/smart'

const serviceObjectManager = new GattLocalObjectManager(servicePath)

let _bus = null
// const {Variant} = dbus

function getBus() {
  if (!_bus) {
    _bus = dbus.systemBus()
  }
  return _bus
}

export class Bluez {
  // constructor(bus) {
  //   this._bus = bus

  //   // this._proxy = await bus.getProxyObject('org.bluez', '/org/bluez')
  //   this._instance = new Instance('org.bluez', '/org/bluez', 'org.bluez.AgentManager1')
  // }
  static service = 'org.bluez'
  static object = '/org/bluez'

  static Variant = dbus.Variant

  static getBus() {
    return getBus()
  }

  static async adapters() {
    let bus = getBus()

    // console.log('bluez', Bluez.service, Bluez.object)

    if (!this._proxyObject) {
      this._proxyObject = await bus.getProxyObject(Bluez.service, Bluez.object)
    }

    let nodes = []
    for (let adapterObject of this._proxyObject.nodes) {
      nodes.push({
        object: adapterObject,
        objectProxyPromise: bus.getProxyObject(Bluez.service, adapterObject)
      })
    }
    let nodesResults = await Promise.all(
      nodes.map(
        (n) => n.objectProxyPromise
      )
    )
    nodesResults.forEach(
      (n, i) => nodes[i].objectProxy = n
    )
    // console.log('nodesResult', nodes)
    let adapters = []
    for (let nodeResult of nodes) {
      adapters.push(
        new Adapter(nodeResult.objectProxy)
      )
    }
    return adapters
  }

  static async addService(service) {
    let bus = getBus()
    await bus.requestName(serviceName)
    serviceObjectManager.addService(service)
    await bus.export(servicePath, serviceObjectManager)
    await bus.export(servicePath + '/' + service.path, service)

    let advertisementObject = new Advertisement({
      path: servicePath,
      type: 'peripheral',
      serviceUuids: [service.UUID]
    })
    await bus.export(servicePath, advertisementObject)
  }
}