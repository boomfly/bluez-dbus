
// process.env.DBUS_SYSTEM_BUS_ADDRESS = 'unix:path=/tmp/custom_dbus_name'
process.env.DBUS_UID = '1000'
process.env.DBUS_SYSTEM_BUS_ADDRESS = 'unix:socket=/tmp/custom_dbus_name'
// process.env.DBUS_SYSTEM_BUS_ADDRESS = 'tcp:host=192.168.8.107,port=55556'

const serviceName = process.env.BT_SERVICE_NAME || 'org.smart'
const servicePath = process.env.BT_SERVICE_PATH || '/org/smart'

const primaryServiceUUID = 'dcf49b3d-87c7-4990-8820-9603864ef64a'
const characteristicUUID = '707b9c2e-7281-411d-a909-d503b8f9b2c3'

// const dbus = require('dbus-next')
// const bus = dbus.systemBus({negotiateUnixFd: null})
// const Variant = dbus.Variant

// import {Adapter} from './bluez/adapter'
import {Bluez} from './bluez/bluez'
import {GattLocalCharacteristic, GattLocalObjectManager, GattLocalService} from './bluez/service'

// const {
//   Interface, property, method, signal, DBusError,
//   ACCESS_READ, ACCESS_WRITE, ACCESS_READWRITE
// } = dbus.interface

const serviceObject = new GattLocalObjectManager()

// getting an object introspects it on the bus and creates the interfaces
async function main() {
  // let obj = await bus.getProxyObject('org.bluez', '/org/bluez')

  console.log('Started...')

  // let adapter = new Adapter(bus, '/org/bluez/hci0')

  // console.log(await adapter.address())
  let adapters = await Bluez.adapters()

  // console.log('found adapters', adapters)

  let defaultAdapter = adapters[0]
  let gattManager = defaultAdapter.gattManager()

  // console.log('adapters', await adapters[0].gattManager(), servicePath)

  let bus = Bluez.getBus()
  
  // await bus.requestName(serviceName)

  // await bus.export(servicePath, serviceObject)

  // await Bluez.addService(
  //   new GattLocalService({
  //     uuid: primaryServiceUUID,
  //     primary: true
  //   })
  // )

  // listen to any messages that are sent to the bus

  if (await defaultAdapter.pairable()) {
    await defaultAdapter.pairable(false)
  }

  // bus.on('message', (msg) => {
  //   console.log('got a message: ', msg);
  // });

  defaultAdapter.setSerivces([
    new GattLocalService({
      uuid: primaryServiceUUID,
      primary: true,
      characteristics: [
        new GattLocalCharacteristic({
          uuid: characteristicUUID,
          flags: ['read', 'write', 'notify', 'indicate']
        })
      ]
    })
  ])
  await defaultAdapter.startAdvertising(serviceName)
  

  // let obj = await bus.getProxyObject('org.smart', '/org/smart/service0/char0')
  // let ad = obj.getInterface('org.bluez.LEAdvertisement1')
  // let adManager = obj.getInterface('org.bluez.LEAdvertisement1')
  // let props = obj.getInterface('org.freedesktop.DBus.Properties')

  // console.log('ad', await props.Get('org.bluez.LEAdvertisement1', 'ActiveInstances'))
  // console.log('ad', await props.GetAll('org.bluez.GattCharacteristic1'))

  // await defaultAdapter.gattManager().RegisterApplication(servicePath, {})

  // export the interface on the path
  // bus.export('/org/test/path', example);

  // let objectProxy = await bus.getProxyObject(serviceName, servicePath)
  // let ifaceProxy = objectProxy.getInterface('org.freedesktop.DBus.ObjectManager')
  // console.log('my service', await ifaceProxy.GetManagedObjects())

}

main()

// setInterval(() => {
//   console.log('interval')
// }, 10000)


// class LockInterface extends Interface {
//   @method({inSignature: 's', outSignature: 's'})
//   open() {
//     console.log('opened')
//   }
// }

// console.log('LockInterface', LockInterface)