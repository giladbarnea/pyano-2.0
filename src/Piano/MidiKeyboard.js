"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const webmidi_1 = require("webmidi");
class MidiKeyboard extends events_1.EventEmitter {
    constructor() {
        super();
        this.connectedDevices = new Map();
        this.ready = new Promise((done, error) => {
            webmidi_1.default.enable((e) => {
                if (e) {
                    error(e);
                }
                webmidi_1.default.addListener('connected', (event) => {
                    if (event.port.type === 'input') {
                        this._addListeners(event.port);
                    }
                });
                webmidi_1.default.addListener('disconnected', (event) => {
                    this._removeListeners(event.port);
                });
                done();
            });
        });
    }
    _addListeners(device) {
        if (!this.connectedDevices.has(device.id)) {
            this.connectedDevices.set(device.id, device);
            device.addListener('noteon', 'all', (event) => {
                this.emit('keyDown', `${event.note.name}${event.note.octave}`, event.velocity);
            });
            device.addListener('noteoff', 'all', (event) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlkaUtleWJvYXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWlkaUtleWJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXFDO0FBQ3JDLHFDQUF3QztBQUV4QyxNQUFhLFlBQWEsU0FBUSxxQkFBWTtJQU03QztRQUNDLEtBQUssRUFBRSxDQUFBO1FBTEEscUJBQWdCLEdBQXVCLElBQUksR0FBRyxFQUFFLENBQUE7UUFPdkQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN4QyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNwQixJQUFJLENBQUMsRUFBRTtvQkFDTixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ1I7Z0JBQ0QsaUJBQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQzFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO3dCQUNoQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtxQkFDOUI7Z0JBQ0YsQ0FBQyxDQUFDLENBQUE7Z0JBQ0YsaUJBQU8sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQzdDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFBO2dCQUNGLElBQUksRUFBRSxDQUFBO1lBQ1AsQ0FBQyxDQUFDLENBQUE7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVILENBQUM7SUFFTyxhQUFhLENBQUMsTUFBYTtRQUVsQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRTVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUM3QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQy9FLENBQUMsQ0FBQyxDQUFBO1lBQ0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDN0UsQ0FBQyxDQUFDLENBQUE7WUFFRixNQUFNLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7b0JBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtpQkFDaEQ7WUFDRixDQUFDLENBQUMsQ0FBQTtTQUNGO0lBRUYsQ0FBQztJQUVPLGdCQUFnQixDQUFDLEtBQWtCO1FBQzFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDbEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDdEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUMvQixNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUE7U0FFdEM7SUFDRixDQUFDO0NBQ0Q7QUEzREQsb0NBMkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IFdlYk1pZGksIHsgSW5wdXQgfSBmcm9tICd3ZWJtaWRpJ1xuXG5leHBvcnQgY2xhc3MgTWlkaUtleWJvYXJkIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuXHRwcml2YXRlIGNvbm5lY3RlZERldmljZXM6IE1hcDxzdHJpbmcsIElucHV0PiA9IG5ldyBNYXAoKVxuXG5cdHJlYWRvbmx5IHJlYWR5OiBQcm9taXNlPHVua25vd24+XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKVxuXG5cdFx0dGhpcy5yZWFkeSA9IG5ldyBQcm9taXNlKChkb25lLCBlcnJvcikgPT4ge1xuXHRcdFx0V2ViTWlkaS5lbmFibGUoKGUpID0+IHtcblx0XHRcdFx0aWYgKGUpIHtcblx0XHRcdFx0XHRlcnJvcihlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdFdlYk1pZGkuYWRkTGlzdGVuZXIoJ2Nvbm5lY3RlZCcsIChldmVudCkgPT4ge1xuXHRcdFx0XHRcdGlmIChldmVudC5wb3J0LnR5cGUgPT09ICdpbnB1dCcpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2FkZExpc3RlbmVycyhldmVudC5wb3J0KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0V2ViTWlkaS5hZGRMaXN0ZW5lcignZGlzY29ubmVjdGVkJywgKGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fcmVtb3ZlTGlzdGVuZXJzKGV2ZW50LnBvcnQpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdGRvbmUoKVxuXHRcdFx0fSlcblx0XHR9KVxuXG5cdH1cblxuXHRwcml2YXRlIF9hZGRMaXN0ZW5lcnMoZGV2aWNlOiBJbnB1dCk6IHZvaWQge1xuXG5cdFx0aWYgKCF0aGlzLmNvbm5lY3RlZERldmljZXMuaGFzKGRldmljZS5pZCkpIHtcblx0XHRcdHRoaXMuY29ubmVjdGVkRGV2aWNlcy5zZXQoZGV2aWNlLmlkLCBkZXZpY2UpXG5cblx0XHRcdGRldmljZS5hZGRMaXN0ZW5lcignbm90ZW9uJywgJ2FsbCcsIChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmVtaXQoJ2tleURvd24nLCBgJHtldmVudC5ub3RlLm5hbWV9JHtldmVudC5ub3RlLm9jdGF2ZX1gLCBldmVudC52ZWxvY2l0eSlcblx0XHRcdH0pXG5cdFx0XHRkZXZpY2UuYWRkTGlzdGVuZXIoJ25vdGVvZmYnLCAnYWxsJywgKGV2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZW1pdCgna2V5VXAnLCBgJHtldmVudC5ub3RlLm5hbWV9JHtldmVudC5ub3RlLm9jdGF2ZX1gLCBldmVudC52ZWxvY2l0eSlcblx0XHRcdH0pXG5cblx0XHRcdGRldmljZS5hZGRMaXN0ZW5lcignY29udHJvbGNoYW5nZScsICdhbGwnLCAoZXZlbnQpID0+IHtcblx0XHRcdFx0aWYgKGV2ZW50LmNvbnRyb2xsZXIubmFtZSA9PT0gJ2hvbGRwZWRhbCcpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQudmFsdWUgPyAncGVkYWxEb3duJyA6ICdwZWRhbFVwJylcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cblx0fVxuXG5cdHByaXZhdGUgX3JlbW92ZUxpc3RlbmVycyhldmVudDogeyBpZDogYW55IH0pOiB2b2lkIHtcblx0XHRpZiAodGhpcy5jb25uZWN0ZWREZXZpY2VzLmhhcyhldmVudC5pZCkpIHtcblx0XHRcdGNvbnN0IGRldmljZSA9IHRoaXMuY29ubmVjdGVkRGV2aWNlcy5nZXQoZXZlbnQuaWQpXG5cdFx0XHR0aGlzLmNvbm5lY3RlZERldmljZXMuZGVsZXRlKGV2ZW50LmlkKVxuXHRcdFx0ZGV2aWNlLnJlbW92ZUxpc3RlbmVyKCdub3Rlb24nKVxuXHRcdFx0ZGV2aWNlLnJlbW92ZUxpc3RlbmVyKCdub3Rlb2ZmJylcblx0XHRcdGRldmljZS5yZW1vdmVMaXN0ZW5lcignY29udHJvbGNoYW5nZScpXG5cblx0XHR9XG5cdH1cbn1cbiJdfQ==