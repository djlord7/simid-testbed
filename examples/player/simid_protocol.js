class SimidProtocol {
  constructor() {
    this.listeners_ = {};
    this.sessionId_ = '';
    this.nextMessageId_ = 1;
    this.target_ = window.parent;
    this.resolutionListeners_ = {};

    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  reset() {
    this.listeners_ = {};
    this.sessionId_ = '';
    this.nextMessageId_ = 1;
    this.resolutionListeners_ = {};
  }

  sendMessage(messageType, messageArgs) {
    const messageId = this.nextMessageId_++;
    const nameSpacedMessage =
      messageType == ProtocolMessage.CREATE_SESSION
        ? messageType
        : 'SIMID:' + messageType;

    const message = {
      sessionId: this.sessionId_,
      messageId,
      type: nameSpacedMessage,
      timestamp: Date.now(),
      args: messageArgs,
    };

    if (EventsThatRequireResponse.includes(messageType)) {
      return new Promise((resolve, reject) => {
        this.addResolveRejectListener_(messageId, resolve, reject);
        this.target_.postMessage(JSON.stringify(message), '*');
      });
    }

    return new Promise((resolve) => {
      this.target_.postMessage(JSON.stringify(message), '*');
      resolve();
    });
  }

  addListener(messageType, callback) {
    if (!this.listeners_[messageType]) {
      this.listeners_[messageType] = [callback];
    } else {
      this.listeners_[messageType].push(callback);
    }
  }

  addResolveRejectListener_(messageId, resolve, reject) {
    const listener = (data) => {
      const type = data['type'];
      const args = data['args']['value'];
      if (type === 'resolve') resolve(args);
      else if (type === 'reject') reject(args);
    };
    this.resolutionListeners_[messageId] = listener.bind(this);
  }

  receiveMessage(event) {
    if (!event || !event.data) return;

    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.warn('Malformed postMessage received:', event.data);
      return;
    }

    const sessionId = data['sessionId'];
    const type = data['type'];

    const isCreatingSession = this.sessionId_ === '' && type === ProtocolMessage.CREATE_SESSION;
    const isSessionIdMatch = this.sessionId_ === sessionId;
    const validSessionId = isCreatingSession || isSessionIdMatch;

    if (!validSessionId || !type) return;

    if (Object.values(ProtocolMessage).includes(type)) {
      this.handleProtocolMessage_(data);
    } else if (type.startsWith('SIMID:')) {
      const specificType = type.substr(6);
      const listeners = this.listeners_[specificType];
      if (listeners) listeners.forEach((listener) => listener(data));
    }
  }

  handleProtocolMessage_(data) {
    const type = data['type'];
    switch (type) {
      case ProtocolMessage.CREATE_SESSION:
        this.sessionId_ = data['sessionId'];
        this.resolve(data);
        const listeners = this.listeners_[type];
        if (listeners) listeners.forEach((listener) => listener(data));
        break;
      case ProtocolMessage.RESOLVE:
      case ProtocolMessage.REJECT:
        const args = data['args'];
        const correlatingId = args['messageId'];
        const resolutionFunction = this.resolutionListeners_[correlatingId];
        if (resolutionFunction) {
          resolutionFunction(data);
          delete this.resolutionListeners_[correlatingId];
        }
        break;
    }
  }

  resolve(incomingMessage, outgoingArgs) {
    const messageId = this.nextMessageId_++;
    const message = {
      sessionId: this.sessionId_,
      messageId,
      type: ProtocolMessage.RESOLVE,
      timestamp: Date.now(),
      args: {
        messageId: incomingMessage['messageId'],
        value: outgoingArgs,
      },
    };
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  reject(incomingMessage, outgoingArgs) {
    const messageId = this.nextMessageId_++;
    const message = {
      sessionId: this.sessionId_,
      messageId,
      type: ProtocolMessage.REJECT,
      timestamp: Date.now(),
      args: {
        messageId: incomingMessage['messageId'],
        value: outgoingArgs,
      },
    };
    this.target_.postMessage(JSON.stringify(message), '*');
  }

  createSession() {
    this.generateSessionId_();
    return this.sendMessage(ProtocolMessage.CREATE_SESSION).then(
      () => console.log('Session created.'),
      () => console.warn('Session creation rejected.')
    );
  }

  generateSessionId_() {
    const random16Uint8s = new Uint8Array(16);
    window.crypto.getRandomValues(random16Uint8s);
    const random32Uint4s = Array.from(Array(32).keys()).map(index => {
      const isEven = index % 2 == 0;
      const byte = random16Uint8s[Math.floor(index / 2)];
      return isEven ? (byte >> 4) : (byte & 15);
    });

    random32Uint4s[12] = 4;
    random32Uint4s[16] = 0b1000 | (random32Uint4s[16] & 0b0011);

    const hexDigits = random32Uint4s.map(v => v.toString(16));
    this.sessionId_ = [
      hexDigits.slice(0, 8).join(''),
      hexDigits.slice(8, 12).join(''),
      hexDigits.slice(12, 16).join(''),
      hexDigits.slice(16, 20).join(''),
      hexDigits.slice(20).join(''),
    ].join('-');
  }

  setMessageTarget(target) {
    this.target_ = target;
  }
}

const ProtocolMessage = {
  CREATE_SESSION: 'createSession',
  RESOLVE: 'resolve',
  REJECT: 'reject',
};

const EventsThatRequireResponse = [
  'Creative:getMediaState',
  'Creative:requestVideoLocation',
  'Creative:ready',
  'Creative:clickThru',
  'Creative:requestSkip',
  'Creative:requestStop',
  'Creative:requestPause',
  'Creative:requestPlay',
  'Creative:requestFullScreen',
  'Creative:requestExitFullScreen',
  'Creative:requestVolume',
  'Creative:requestResize',
  'Creative:requestChangeAdDuration',
  'Creative:reportTracking',
  'Player:init',
  'Player:startCreative',
  'Player:adSkipped',
  'Player:adStopped',
  'Player:fatalError',
  'createSession',
];
