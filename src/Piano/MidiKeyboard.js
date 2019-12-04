"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WebMidi = require('webmidi');
class MidiKeyboard extends events_1.EventEmitter {
    constructor() {
        super();
        this.connectedDevices = new Map();
        console.group(`MidiKeyboard.constructor()`);
        this.ready = new Promise((done, error) => {
            WebMidi.enable((e) => {
                if (e) {
                    error(e);
                }
                WebMidi.addListener('connected', (event) => {
                    console.log(`%cWebMidi connected ${event.port.name} (${event.port.type})`, 'color: #1db954', event);
                    if (event.port.type === 'input') {
                        this._addListeners(event.port);
                    }
                });
                WebMidi.addListener('disconnected', (event) => {
                    console.log(`%cWebMidi disconnected ${event.port.name} (${event.port.type})`, 'color: #1db954', event);
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
            device.addListener('noteon', 'all', (event) => {
                console.log('%cnoteon', 'color: #1db954');
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity);
            });
            device.addListener('noteoff', 'all', (event) => {
                console.log('%cnoteoff', 'color: #1db954');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlkaUtleWJvYXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWlkaUtleWJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXFDO0FBSXJDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVuQyxNQUFhLFlBQWEsU0FBUSxxQkFBWTtJQU0xQztRQUNJLEtBQUssRUFBRSxDQUFDO1FBTEoscUJBQWdCLEdBQXVCLElBQUksR0FBRyxFQUFFLENBQUM7UUFNckQsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDckMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNqQixJQUFLLENBQUMsRUFBRztvQkFDTCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ1g7Z0JBQ0QsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtvQkFFdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDcEcsSUFBSyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUc7d0JBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO3FCQUNqQztnQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDSCxPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN2RyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLEVBQUUsQ0FBQTtZQUNWLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFdkIsQ0FBQztJQUVPLGFBQWEsQ0FBQyxNQUFhO1FBRy9CLElBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRztZQUN6QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDbEYsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNoRixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUNqRCxJQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRztvQkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFBO2lCQUNuRDtZQUNMLENBQUMsQ0FBQyxDQUFBO1NBQ0w7SUFFTCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsS0FBa0I7UUFDdkMsSUFBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRztZQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQTtTQUV6QztJQUNMLENBQUM7Q0FDSjtBQW5FRCxvQ0FtRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gXCJ3ZWJtaWRpXCI7XG4vLyBpbXBvcnQgVFdlYk1pZGkgZnJvbSAnd2VibWlkaSdcblxuY29uc3QgV2ViTWlkaSA9IHJlcXVpcmUoJ3dlYm1pZGknKTtcblxuZXhwb3J0IGNsYXNzIE1pZGlLZXlib2FyZCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgXG4gICAgcHJpdmF0ZSBjb25uZWN0ZWREZXZpY2VzOiBNYXA8c3RyaW5nLCBJbnB1dD4gPSBuZXcgTWFwKCk7XG4gICAgXG4gICAgcmVhZG9ubHkgcmVhZHk6IFByb21pc2U8dW5rbm93bj47XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXAoYE1pZGlLZXlib2FyZC5jb25zdHJ1Y3RvcigpYCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlYWR5ID0gbmV3IFByb21pc2UoKGRvbmUsIGVycm9yKSA9PiB7XG4gICAgICAgICAgICBXZWJNaWRpLmVuYWJsZSgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggZSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgV2ViTWlkaS5hZGRMaXN0ZW5lcignY29ubmVjdGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJWNXZWJNaWRpIGNvbm5lY3RlZCAke2V2ZW50LnBvcnQubmFtZX0gKCR7ZXZlbnQucG9ydC50eXBlfSlgLCAnY29sb3I6ICMxZGI5NTQnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICggZXZlbnQucG9ydC50eXBlID09PSAnaW5wdXQnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkTGlzdGVuZXJzKGV2ZW50LnBvcnQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBXZWJNaWRpLmFkZExpc3RlbmVyKCdkaXNjb25uZWN0ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCVjV2ViTWlkaSBkaXNjb25uZWN0ZWQgJHtldmVudC5wb3J0Lm5hbWV9ICgke2V2ZW50LnBvcnQudHlwZX0pYCwgJ2NvbG9yOiAjMWRiOTU0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnMoZXZlbnQucG9ydClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkb25lKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIF9hZGRMaXN0ZW5lcnMoZGV2aWNlOiBJbnB1dCk6IHZvaWQge1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmICggIXRoaXMuY29ubmVjdGVkRGV2aWNlcy5oYXMoZGV2aWNlLmlkKSApIHtcbiAgICAgICAgICAgIHRoaXMuY29ubmVjdGVkRGV2aWNlcy5zZXQoZGV2aWNlLmlkLCBkZXZpY2UpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZXZpY2UuYWRkTGlzdGVuZXIoJ25vdGVvbicsICdhbGwnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnJWNub3Rlb24nLCAnY29sb3I6ICMxZGI5NTQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2tleURvd24nLCBgJHtldmVudC5ub3RlLm5hbWV9JHtldmVudC5ub3RlLm9jdGF2ZX1gLCBldmVudC52ZWxvY2l0eSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGV2aWNlLmFkZExpc3RlbmVyKCdub3Rlb2ZmJywgJ2FsbCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCclY25vdGVvZmYnLCAnY29sb3I6ICMxZGI5NTQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2tleVVwJywgYCR7ZXZlbnQubm90ZS5uYW1lfSR7ZXZlbnQubm90ZS5vY3RhdmV9YCwgZXZlbnQudmVsb2NpdHkpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGV2aWNlLmFkZExpc3RlbmVyKCdjb250cm9sY2hhbmdlJywgJ2FsbCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggZXZlbnQuY29udHJvbGxlci5uYW1lID09PSAnaG9sZHBlZGFsJyApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KGV2ZW50LnZhbHVlID8gJ3BlZGFsRG93bicgOiAncGVkYWxVcCcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBfcmVtb3ZlTGlzdGVuZXJzKGV2ZW50OiB7IGlkOiBhbnkgfSk6IHZvaWQge1xuICAgICAgICBpZiAoIHRoaXMuY29ubmVjdGVkRGV2aWNlcy5oYXMoZXZlbnQuaWQpICkge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlID0gdGhpcy5jb25uZWN0ZWREZXZpY2VzLmdldChldmVudC5pZCk7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3RlZERldmljZXMuZGVsZXRlKGV2ZW50LmlkKTtcbiAgICAgICAgICAgIGRldmljZS5yZW1vdmVMaXN0ZW5lcignbm90ZW9uJyk7XG4gICAgICAgICAgICBkZXZpY2UucmVtb3ZlTGlzdGVuZXIoJ25vdGVvZmYnKTtcbiAgICAgICAgICAgIGRldmljZS5yZW1vdmVMaXN0ZW5lcignY29udHJvbGNoYW5nZScpXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==