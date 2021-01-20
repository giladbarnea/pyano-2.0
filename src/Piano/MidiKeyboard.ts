import { EventEmitter } from 'events'
import type { Input, InputEventNoteoff, InputEventNoteon, WebMidiEventConnected } from "webmidi";
// import { WebMidi } from "webmidi";
import type { IMsg, Kind } from "python";
import type IWebMidi from 'webmidi'
import { InteractiveIn, Stages } from 'pages/interactivebhe';
import { Level } from "level";
// webmidi = webmidi as WebMidi;

const WebMidi: typeof IWebMidi = require('webmidi');

export class MidiKeyboard extends EventEmitter implements Omit<InteractiveIn, keyof Stages> {

    readonly msgs: IMsg[] = [];
    // private ready: Promise<void>;
    private connectedDevices: Map<string, Input> = new Map();

    constructor() {
        super();
    }

    init(): Promise<void> {
        console.title(`MidiKeyboard.init()`);
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

    async record(level: Level) {
        console.title(`MidiKeyboard.record(level: ${level})`);


    }

    private _addListeners(device: Input): void {
        const _sig = `device: ${device.name} (${device.type})`
        if (this.connectedDevices.has(device.id)) {
            warn(`MidiKeyboard._addListeners(${_sig}) | device already connected; skipping it.\nid: ${device.id}`)
            return;
        }
        console.good(`MidiKeyboard._addListeners(${_sig}) | CONNECTING\nid: ${device.id}`);
        this.connectedDevices.set(device.id, device);
        device.addListener('noteon', 'all', (event: InputEventNoteon) => {

            const msg = {
                time: event.timestamp / 1000,
                note: event.note.number,
                kind: 'on' as Kind,
                velocity: event.rawVelocity
            };
            this.msgs.push(msg);
            debug(`${_sig} | noteon: ${util.inspect.inspect(msg, { compact: true })}`);
            this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity)
        });
        device.addListener('noteoff', 'all', (event: InputEventNoteoff) => {
            const msg = {
                time: event.timestamp / 1000,
                note: event.note.number,
                kind: 'off' as Kind,
            };
            debug(`${_sig} | noteoff: ${util.inspect.inspect(msg, { compact: true })}`);
            this.msgs.push(msg);
            this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity)
        });
        device.addListener('controlchange', 'all', (event) => {
            debug(`${_sig} | controlchange: ${util.inspect.inspect(event, { compact: true })}`);
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
}
