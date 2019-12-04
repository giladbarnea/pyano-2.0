import { EventEmitter } from 'events'
import { Input } from "webmidi";
// import WebMidi, { Input } from 'webmidi'
const WebMidi = require('webmidi');

export class MidiKeyboard extends EventEmitter {
    
    private connectedDevices: Map<string, Input> = new Map();
    
    readonly ready: Promise<unknown>;
    
    constructor() {
        super();
        console.group(`MidiKeyboard.constructor()`);
        
        this.ready = new Promise((done, error) => {
            WebMidi.enable((e) => {
                if ( e ) {
                    error(e)
                }
                WebMidi.addListener('connected', (event) => {
                    console.log('WebMidi connected', event);
                    if ( event.port.type === 'input' ) {
                        this._addListeners(event.port)
                    }
                });
                WebMidi.addListener('WebMidi disconnected', (event) => {
                    console.log('disconnected');
                    this._removeListeners(event.port)
                });
                done()
            })
        });
        console.groupEnd();
        
    }
    
    private _addListeners(device: Input): void {
        
        console.group(`_addListeners(device)`, device);
        console.log("this.connectedDevices", this.connectedDevices);
        if ( !this.connectedDevices.has(device.id) ) {
            this.connectedDevices.set(device.id, device);
            
            device.addListener('noteon', 'all', (event) => {
                console.log('%cnoteon', 'color: #1db954');
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity)
            });
            device.addListener('noteoff', 'all', (event) => {
                console.log('%cnoteoff', 'color: #1db954');
                this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity)
            });
            
            device.addListener('controlchange', 'all', (event) => {
                if ( event.controller.name === 'holdpedal' ) {
                    this.emit(event.value ? 'pedalDown' : 'pedalUp')
                }
            })
        }
        console.groupEnd();
        
    }
    
    private _removeListeners(event: { id: any }): void {
        if ( this.connectedDevices.has(event.id) ) {
            const device = this.connectedDevices.get(event.id);
            this.connectedDevices.delete(event.id);
            device.removeListener('noteon');
            device.removeListener('noteoff');
            device.removeListener('controlchange')
            
        }
    }
}
