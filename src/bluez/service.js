import dbus from 'dbus-next'
let {
  Interface, property, method, signal, DBusError,
  ACCESS_READ, ACCESS_WRITE, ACCESS_READWRITE
} = dbus.interface

let {Variant} = dbus

let _serviceIndex = 0

export class GattLocalService extends Interface {
  constructor(service) {
    super('org.bluez.GattService1')
    const {path, uuid, primary, device, includes, handle, characteristics} = service
    this._path = path || `service${_serviceIndex++}`
    this._uuid = uuid
    this._primary = primary
    this._device = device
    this._includes = includes
    this._handle = handle

    this._characteristicIndex = 0
    this._characteristics = (characteristics || []).map((c) => {
      c.service = this._path
      c.path = `char${this._characteristicIndex++}`
      return c
    })
  }
  
  @property({signature: 's', access: ACCESS_READ})
  get UUID() {
    return this._uuid
  }

  @property({signature: 'b', access: ACCESS_READ})
  get Primary() {
    return this._primary
  }

  @property({signature: 's', access: ACCESS_READ})
  get Device() {
    return this._device
  }

  @property({signature: 'ao', access: ACCESS_READ})
  get Includes() {
    return this.includes
  }

  @property({signature: 'q', access: ACCESS_READWRITE})
  get Handle() {
    return this._handle
  }

  set Handle(value) {
    this._handle = value
    Interface.emitPropertiesChanged(this, {
      Handle: value
    });
  }

  get path() { return this._path }

  set path(value) { this._path = value }

  get characteristics() {
    return this._characteristics
  }

  toObject() {
    return {
      UUID: new Variant('s', this._uuid),
      Primary: new Variant('b', this._primary),
      Device: new Variant('s', this._device || ''),
      Includes: new Variant('ao', this._includes || []),
      Handle: new Variant('q', this._handle || 0)
    }
  }
}

export class GattLocalCharacteristic extends Interface {
  constructor(characteristic) {
    super('org.bluez.GattCharacteristic1')
    const {uuid, service, value, writeAcuired, notifyAcuired, notifying, flags, handle, mtu, descriptors} = characteristic
    this._path = 'char0'
    this._uuid = uuid || ''
    this._service = service || ''
    this._value = value || Buffer.from('')
    this._writeAcquired = writeAcuired || false
    this._notifyAcquired = notifyAcuired || false
    this._notifying = notifying || false
    this._flags = flags || []
    this._handle = handle || 0
    this._mtu = mtu || 21
    this._descriptors = descriptors
  }

  @method({inSignature: 'a{sv}', outSignature: 'ay'})
  ReadValue(options) {
    console.log('GattLocalCharacteristic::ReadValue', options)
    return Buffer.from(this._value)
  }

  @method({inSignature: 'aya{sv}', outSignature: ''})
  WriteValue(value, options) {
    console.log('GattLocalCharacteristic::WriteValue', this._path, value, options)
    this._value = value

    this.PropertiesChanged({
      Value: new Variant('ay', value)
    })
  }

  @method({inSignature: '', outSignature: ''})
  StartNotify() {
    console.log('GattLocalCharacteristic::StartNotify')
    this._notifying = true
    return null
  }

  @method({inSignature: '', outSignature: ''})
  StopNotify() {
    console.log('GattLocalCharacteristic::StopNotify')
    this._notifying = false
    return null
  }

  @property({signature: 's', access: ACCESS_READ})
  get UUID() {
    return this._uuid
  }

  @property({signature: 'o', access: ACCESS_READ})
  get Service() {
    // if (typeof(this._service) == 'string') {
    //   return this._service
    // }
    // return this._service.path()
    console.log('Char::Service', this._service)
    return '/org/smart/' + this._service
  }

  @property({signature: 'ay', access: ACCESS_READ})
  get Value() {
    return this._value
  }

  @property({signature: 'b', access: ACCESS_READ})
  get WriteAcquired() {
    return this._writeAcquired
  }

  @property({signature: 'b', access: ACCESS_READ})
  get NotifyAcquired() {
    return this._notifyAcquired
  }

  @property({signature: 'b', access: ACCESS_READ})
  get Notifying() {
    return this._notifying
  }
  
  @property({signature: 'as', access: ACCESS_READ})
  get Flags() {
    return this._flags
  }

  @property({signature: 'q', access: ACCESS_READWRITE})
  get Handle() {
    return this._handle
  }

  set Handle(value) {
    this._handle = value
    Interface.emitPropertiesChanged(this, {
      Handle: value
    });
  }

  @property({signature: 'q', access: ACCESS_READ})
  get MTU() {
    return this._mtu
  }

  @signal({signature: 'a{sv}'})
  PropertiesChanged(properties) {
    return properties
  }

  set service(service) { this._service = service }

  get path() { return this._path }
  set path(path) { this._path = path }

  get descriptors() {
    return this._descriptors
  }

  toObject() {
    return {
      UUID: new Variant('s', this._uuid),
      Service: new Variant('o', '/org/smart/' + this._service),
      Value: new Variant('ay', this._value || Buffer.from('')),
      WriteAcuired: new Variant('b', this._writeAcquired || false),
      NotifyAcuired: new Variant('b', this._notifyAcquired || false),
      Notifying: new Variant('b', this._notifying || false),
      Flags: new Variant('as', this._flags || []),
      Handle: new Variant('q', this._handle || 0),
      MTU: new Variant('q', this._mtu || 0)
    }
  }
}

export class GattLocalDescriptor extends Interface {
  constructor(descriptor) {
    super('org.bluez.GattDescriptor1')
    const {uuid, characteristic, value, flags, handle} = descriptor
    this._path = 'desc0'
    this._uuid = uuid
    this._characteristic = characteristic
    this._value = value
    this._flags = flags
    this._handle = handle
  }

  @property({signature: 's', access: ACCESS_READ})
  get UUID() {
    return this._uuid
  }

  @property({signature: 's', access: ACCESS_READ})
  get Characteristic() {
    return this._characteristic
  }

  @property({signature: 'ay', access: ACCESS_READ})
  get Value() {
    return this._value
  }

  @property({signature: 'as', access: ACCESS_READ})
  get Flags() {
    return this._flags
  }

  @property({signature: 'q', access: ACCESS_READWRITE})
  get Handle() {
    return this._handle
  }

  set Handle(value) {
    this._handle = value
    Interface.emitPropertiesChanged(this, {
      Handle: value
    });
  }

  set characteristic(characteristic) { this._characteristic = characteristic }

  get path() { return this._path }
  set path(path) { this._path = path }
}

export class GattLocalObjectManager extends Interface {
  constructor(path) {
    super('org.freedesktop.DBus.ObjectManager')
    this._path = path
    this._services = []
  }

  addService(service) {
    this._services.push(service)
  }

  setServices(services) {
    this._services = services || []
  }

  @method({outSignature: 'a{oa{sa{sv}}}'})
  GetManagedObjects() {
    // let servicePath = '/org/smart/service1'
    // let characteristicPath = servicePath + '/' + 'char0'
    // return {
    //   [servicePath]: {
    //     'org.bluez.GattService1': {
    //       'UUID': new Variant('s', 'dcf49b3d-87c7-4990-8820-9603864ef64a'),
    //       'Primary': new Variant('b', true)
    //     }
    //   },
    //   [characteristicPath]: {
    //     'org.bluez.GattCharacteristic1': {
    //       'UUID': new Variant('s', '707b9c2e-7281-411d-a909-d503b8f9b2c3'),
    //       'Service': new Variant('s', servicePath),
    //       'Flags': new Variant('as', ['read']),
    //       'Notifying': new Variant('b', false)
    //     },
    //     'org.bluez.GattDescriptor1': {
    //         'UUID': new Variant('s', '00002901-0000-1000-8000-00805f9b34fb'),
    //         'Characteristic': new Variant('s', characteristicPath),
    //         'Flags': new Variant('as', ['read']),
    //     }
    //   }
    // }

    let response = {}
    for (let service of this._services) {
      let servicePath = this._path + '/' + service.path
      response[servicePath] = {
        'org.bluez.GattService1': service.toObject()
      }
      for (let characteristic of service.characteristics) {
        let characteristicPath = servicePath + '/' + characteristic.path
        response[characteristicPath] = {
          'org.bluez.GattCharacteristic1': characteristic.toObject()
        }
      }
    }
    console.log('GattLocalObjectManager::GetManagedObjects', response)
    return response
  }
}