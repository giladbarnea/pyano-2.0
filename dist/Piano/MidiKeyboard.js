Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WebMidi = require('webmidi');
class MidiKeyboard extends events_1.EventEmitter {
    constructor() {
        super();
        this.connectedDevices = new Map();
        this.msgs = [];
        console.group(`MidiKeyboard.constructor()`);
        this.ready = new Promise((done, error) => {
            WebMidi.enable((e) => {
                if (e) {
                    error(e);
                }
                WebMidi.addListener('connected', (event) => {
                    console.log(`%cWebMidi connected (name: ${event.port.name}, type: ${event.port.type})`, 'color: #0F9D58', event);
                    if (event.port.type === 'input') {
                        this._addListeners(event.port);
                    }
                });
                WebMidi.addListener('disconnected', (event) => {
                    console.log(`%cWebMidi disconnected (name: ${event.port.name}, type: ${event.port.type})`, 'color: #DB4437', event);
                    this._removeListeners(event.port);
                });
                done();
            });
        });
        console.groupEnd();
    }
    _addListeners(device) {
        if (!this.connectedDevices.has(device.id)) {
            this.connectedDevices.set(device.id, device);
            console.log(`connected device id: ${device.id}`);
            device.addListener('noteon', 'all', (event) => {
                const msg = {
                    time: event.timestamp / 1000,
                    note: event.note.number,
                    kind: 'on',
                    velocity: event.rawVelocity
                };
                this.msgs.push(msg);
                console.log('%cnoteon', 'color: #0F9D58', msg);
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity);
            });
            device.addListener('noteoff', 'all', (event) => {
                const msg = {
                    time: event.timestamp / 1000,
                    note: event.note.number,
                    kind: 'off',
                };
                console.log('%cnoteoff', 'color: #DB4437', msg);
                this.msgs.push(msg);
                this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity);
            });
            device.addListener('controlchange', 'all', (event) => {
                if (event.controller.name === 'holdpedal') {
                    this.emit(event.value ? 'pedalDown' : 'pedalUp');
                }
            });
        }
    }
    _removeListeners(event) {
        if (this.connectedDevices.has(event.id)) {
            const device = this.connectedDevices.get(event.id);
            this.connectedDevices.delete(event.id);
            device.removeListener('noteon');
            device.removeListener('noteoff');
            device.removeListener('controlchange');
        }
    }
}
exports.MidiKeyboard = MidiKeyboard;
//# sourceMappingURL=MidiKeyboard.js.map