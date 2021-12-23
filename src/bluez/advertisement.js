import dbus from 'dbus-next'
let {
  Interface, property, method, signal, DBusError,
  ACCESS_READ, ACCESS_WRITE, ACCESS_READWRITE
} = dbus.interface

let {Variant} = dbus

export class Advertisement extends Interface {
  constructor(advertisement) {
    super('org.bluez.LEAdvertisement1')
    const {
      path,
      type,
      serviceUuids,
      manufaturerData = {},
      solicitUuids = [],
      serviceData = {},
      data = {},
      discoverable = true,
      discoverableTimeout = 0,
      includes = [],
      localName = '',
      appearance = 0,
      duration = 2,
      timeout = 2,
      secondaryChannel = '1M',
      minInterval = 200,
      maxInterval = 200,
      txPower = -70,

    } = advertisement
    
    this._path = path
    this._type = type
    this._serviceUuids = serviceUuids
    this._manufaturerData = manufaturerData
    this._solicitUuids = solicitUuids
    this._serviceData = serviceData
    this._data = data
    this._discoverable = discoverable
    this._discoverableTimeout = discoverableTimeout
    this._includes = includes
    this._localName = localName
    this._appearance = appearance
    this._duration = duration
    this._timeout = timeout
    this._secondaryChannel = secondaryChannel
    this._minInterval = minInterval
    this._maxInterval = maxInterval
    this._txPower = txPower
    for (let propertyName in advertisement) {
      this[propertyName] = advertisement[propertyName]
    }
  }

  @method({inSignature: '', outSignature: ''})
  Release() {
    console.info('Advertisement:', this._path, 'was released')
  }

  @property({signature: 's'})
  get Type() {
    return this._type
  }
  
  @property({signature: 'as'})
  get ServiceUUIDs() {
    return this._serviceUuids
  }

  // @property({signature: 'a{nay}'})
  @property({signature: 'a{qv}'})
  get ManufacturerData() {
    return this._manufaturerData
  }

  @property({signature: 'as'})
  get SolicidUUIDs() {
    return this._solicitUuids
  }

  @property({signature: 'a{qay}'})
  get ServiceData() {
    return this._serviceData
  }

  @property({signature: 'a{qay}'})
  get Data() {
    return this._data
  }

  @property({signature: 'b'})
  get Discoverable() {
    return this._discoverable
  }

  @property({signature: 'q'})
  get DiscoverableTimeout() {
    return this._discoverableTimeout
  }

  @property({signature: 'as'})
  get Includes() {
    return this._includes
  }

  @property({signature: 's'})
  get LocalName() {
    return this._localName
  }

  @property({signature: 'q'})
  get Appearance() {
    return this._appearance
  }

  @property({signature: 'q'})
  get Duration() {
    return this._duration
  }

  @property({signature: 'q'})
  get Timeout() {
    return this._timeout
  }

  @property({signature: 's'})
  get SecondaryChannel() {
    return this._secondaryChannel
  }

  @property({signature: 'u'})
  get MinInterval() {
    return this._minInterval
  }

  @property({signature: 'u'})
  get MaxInterval() {
    return this._maxInterval
  }

  @property({signature: 'n'})
  get TxPower() {
    return this._txPower
  }
}