import { EventEmitter } from 'events'
import type { Input, InputEventNoteoff, InputEventNoteon, WebMidiEventConnected } from "webmidi";
// import { WebMidi } from "webmidi";
import type { IMsg, Kind } from "python";
import type IWebMidi from 'webmidi'
import { InteractiveIn, Stages } from 'pages/Running/iinteractive';
import { Level } from "level";
// webmidi = webmidi as WebMidi;

const WebMidi: typeof IWebMidi = require('webmidi');

export class MidiKeyboard extends EventEmitter implements Omit<InteractiveIn, keyof Stages> {

    readonly msgs: IMsg[] = [];
    // private ready: Promise<void>;
    private connectedDevices: Map<string, Input> = new Map();

    /**`noteOnHandler` and `noteOffHandler` push to `this.msgs` only when `recording` is true */
    private recording: boolean = false;

    constructor() {
        super();
    }

    toString() {
        return `MidiKeyboard(messages: ${this.msgs.length}, recording: ${this.recording})`
    }

    init(): Promise<void> {
        console.title(`${this}.init()`);
        // this.ready = new Promise<void>((resolve, reject) => {
        const ready = new Promise<void>((resolve, reject) => {

            WebMidi.enable(error => {
                if (error) {
                    error.when = "WebMidi.enable(error => {...})"
                    util.onError(error)
                    return
                }
                WebMidi.addListener('connected', (event: WebMidiEventConnected) => {
                    if (event.port.type === 'input') {
                        this._addListeners(event.port)
                    } else {
                        console.warn(`WebMidi detected ${event.port.type} but did NOT connect because it's not input (name: ${event.port.name})\nid: ${event.port.id}`, event);
                    }
                });
                WebMidi.addListener('disconnected', (event) => {
                    console.important(`WebMidi DISCONNECTED ${event.port.type} (name: ${event.port.name})\nid: ${event.port.id}`, event);
                    this._removeListeners(event.port)
                });
                resolve()
            })
        });
        return ready;
    }

    record(level: Level) {
        console.title(`${this}.record(level: ${level})`);
        if (this.recording) {
            warn(`${this}.record(level: ${level}) | this.recording was already true!`)
        }
        if (util.bool(this.msgs)) {
            warn(`${this}.record(level: ${level}) | this.msgs was already popuplated!`)
        }
        this.recording = true;
    }

    stopRecord() {
        console.title(`${this}.stopRecord()`);
        if (!this.recording) {
            warn(`${this}.stopRecord() | this.recording was already false!`)
        }
        if (!util.bool(this.msgs)) {
            warn(`${this}.stopRecord() | this.msgs is empty!`)
        }
        this.recording = false;
    }

    private _addListeners(device: Input): void {
        const _sig = `device: ${device.name} (${device.type})`
        if (this.connectedDevices.has(device.id)) {
            warn(`MidiKeyboard._addListeners(${_sig}) | device already connected; skipping it.\nid: ${device.id}`)
            return;
        }
        console.good(`MidiKeyboard._addListeners(${_sig}) | CONNECTING\nid: ${device.id}`);
        this.connectedDevices.set(device.id, device);
        device.addListener('noteon', 'all', (event: InputEventNoteon) => this.noteOnHandler(event));
        device.addListener('noteoff', 'all', (event: InputEventNoteoff) => this.noteOffHandler(event));
        device.addListener('controlchange', 'all', (event) => {
            debug(`${_sig} | controlchange: ${pf(event)}`);
            if (event.controller.name === 'holdpedal') {
                this.emit(event.value ? 'pedalDown' : 'pedalUp')
            }
        })

    }

    private _removeListeners(event: { id: any }): void {
        if (this.connectedDevices.has(event.id)) {
            const device = this.connectedDevices.get(event.id);
            this.connectedDevices.delete(event.id);
            device.removeListener('noteon');
            device.removeListener('noteoff');
            device.removeListener('controlchange')

        }
    }

    private noteOnHandler(event: InputEventNoteon) {

        const msg = {
            time: event.timestamp / 1000,
            note: event.note.number,
            kind: 'on' as Kind,
            velocity: event.rawVelocity
        };
        debug(`${this}.noteOnHandler(event) |  ↓ noteon: ${pf(msg)}`);
        if (this.recording) {
            this.msgs.push(msg);
        }
        this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity)
    }

    private noteOffHandler(event: InputEventNoteoff) {
        const msg = {
            time: event.timestamp / 1000,
            note: event.note.number,
            kind: 'off' as Kind,
        };
        debug(`${this}.noteOffHandler(event) | ↑ noteoff: ${pf(msg)}`);
        if(this.recording) {
            this.msgs.push(msg);
        }
        this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity)
    }


}
