import { EventEmitter } from 'events'
import type { Input, InputEventNoteoff, InputEventNoteon } from "webmidi";
// import { WebMidi } from "webmidi";
import type { IMsg, Kind } from "../MyPyShell";
// import * as webmidi from 'webmidi'
// webmidi = webmidi as WebMidi;

const WebMidi = require('webmidi');

export class MidiKeyboard extends EventEmitter {

    readonly ready: Promise<unknown>;
    readonly msgs: IMsg[] = [];
    private connectedDevices: Map<string, Input> = new Map();

    constructor() {
        super();
        console.title(`MidiKeyboard.constructor()`);

        this.ready = new Promise<void>((done, error) => {

            WebMidi.enable((e) => {
                if (e) {
                    error(e)
                }
                WebMidi.addListener('connected', (event) => {

                    console.log(`WebMidi connected ${event.port.type} (name: ${event.port.name})`, event);
                    if (event.port.type === 'input') {
                        this._addListeners(event.port)
                    }
                });
                WebMidi.addListener('disconnected', (event) => {
                    console.log(`WebMidi disconnected ${event.port.type} (name: ${event.port.name})`, event);
                    this._removeListeners(event.port)
                });
                done()
            })
        });

    }

    private _addListeners(device: Input): void {
        if (!this.connectedDevices.has(device.id)) {
            this.connectedDevices.set(device.id, device);
            console.log(`connected device id: ${device.id}`);
            device.addListener('noteon', 'all', (event: InputEventNoteon) => {

                const msg = {
                    time: event.timestamp / 1000,
                    note: event.note.number,
                    kind: 'on' as Kind,
                    velocity: event.rawVelocity
                };
                this.msgs.push(msg);
                console.debug('noteon', msg);
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity)
            });
            device.addListener('noteoff', 'all', (event: InputEventNoteoff) => {
                const msg = {
                    time: event.timestamp / 1000,
                    note: event.note.number,
                    kind: 'off' as Kind,
                };
                console.debug('noteoff', msg);
                this.msgs.push(msg);
                this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity)
            });

            device.addListener('controlchange', 'all', (event) => {
                if (event.controller.name === 'holdpedal') {
                    this.emit(event.value ? 'pedalDown' : 'pedalUp')
                }
            })
        }

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
