import { EventEmitter } from 'events'
import { Input, InputEventNoteoff, InputEventNoteon, WebMidi } from "webmidi";
import { IMsg, Kind } from "../MyPyShell";
// import * as webmidi from 'webmidi'
// webmidi = webmidi as WebMidi;

const WebMidi = require('webmidi');

export class MidiKeyboard extends EventEmitter {
    
    private connectedDevices: Map<string, Input> = new Map();
    readonly ready: Promise<unknown>;
    readonly notes: IMsg[] = [];
    
    constructor() {
        super();
        console.group(`MidiKeyboard.constructor()`);
        
        this.ready = new Promise((done, error) => {
            
            WebMidi.enable((e) => {
                if ( e ) {
                    error(e)
                }
                WebMidi.addListener('connected', (event) => {
                    
                    console.log(`%cWebMidi connected (name: ${event.port.name}, type: ${event.port.type})`, 'color: #0F9D58', event);
                    if ( event.port.type === 'input' ) {
                        this._addListeners(event.port)
                    }
                });
                WebMidi.addListener('disconnected', (event) => {
                    console.log(`%cWebMidi disconnected (name: ${event.port.name}, type: ${event.port.type})`, 'color: #DB4437', event);
                    this._removeListeners(event.port)
                });
                done()
            })
        });
        console.groupEnd();
        
    }
    
    private _addListeners(device: Input): void {
        
        
        if ( !this.connectedDevices.has(device.id) ) {
            this.connectedDevices.set(device.id, device);
            console.log(`connected device id: ${device.id}`);
            device.addListener('noteon', 'all', (event: InputEventNoteon) => {
                
                const note = {
                    time : event.timestamp / 1000,
                    note : event.note.number,
                    kind : 'on' as Kind,
                    velocity : event.rawVelocity
                };
                this.notes.push(note);
                console.log('%cnoteon', 'color: #0F9D58', note);
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity)
            });
            device.addListener('noteoff', 'all', (event: InputEventNoteoff) => {
                const note = {
                    time : event.timestamp / 1000,
                    note : event.note.number,
                    kind : 'off' as Kind,
                };
                console.log('%cnoteoff', 'color: #DB4437', note);
                this.notes.push(note);
                this.emit('keyUp', `${event.note.name}${event.note.octave}`, event.velocity)
            });
            
            device.addListener('controlchange', 'all', (event) => {
                if ( event.controller.name === 'holdpedal' ) {
                    this.emit(event.value ? 'pedalDown' : 'pedalUp')
                }
            })
        }
        
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
