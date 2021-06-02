"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
class PianoComponent extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoComponent';
        this.input = undefined;
        this.output = new tone_1.Volume({ context: this.context });
        this._enabled = false;
        this.volume = this.output.volume;
        this._loaded = false;
        this.volume.value = options.volume;
        this._enabled = options.enabled;
        this.samples = options.samples;
    }
    get loaded() {
        return this._loaded;
    }
    async load() {
        if (this._enabled) {
            await this._internalLoad();
            this._loaded = true;
        }
        else {
            return Promise.resolve();
        }
    }
}
exports.PianoComponent = PianoComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQWdFO0FBZ0JoRSxNQUFzQixjQUFlLFNBQVEsb0JBQWE7SUF5QnRELFlBQVksT0FBOEI7UUFDdEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBekJWLFNBQUksR0FBRyxnQkFBZ0IsQ0FBQztRQUN4QixVQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ2xCLFdBQU0sR0FBRyxJQUFJLGFBQU0sQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUs1QyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBSzNCLFdBQU0sR0FBeUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFLbkQsWUFBTyxHQUFZLEtBQUssQ0FBQztRQVU3QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRW5DLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUVoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUE7SUFDbEMsQ0FBQztJQVVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUN2QixDQUFDO0lBS0QsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtTQUN0QjthQUFNO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7U0FDM0I7SUFDTCxDQUFDO0NBQ0o7QUExREQsd0NBMERDIiwic291cmNlc0NvbnRlbnQiOlsiLy9AdHMtbm9jaGVja1xuaW1wb3J0IHtDb250ZXh0LCBQYXJhbSwgVG9uZUF1ZGlvTm9kZSwgVW5pdCwgVm9sdW1lfSBmcm9tICd0b25lJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpYW5vQ29tcG9uZW50T3B0aW9ucyB7XG4gICAgY29udGV4dDogQ29udGV4dFxuICAgIHZvbHVtZTogVW5pdC5EZWNpYmVsc1xuICAgIGVuYWJsZWQ6IGJvb2xlYW5cbiAgICBzYW1wbGVzOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcmxzTWFwIHtcbiAgICBbbm90ZTogc3RyaW5nXTogc3RyaW5nXG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgdGhlIG90aGVyIGNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBpYW5vQ29tcG9uZW50IGV4dGVuZHMgVG9uZUF1ZGlvTm9kZSB7XG4gICAgcmVhZG9ubHkgbmFtZSA9ICdQaWFub0NvbXBvbmVudCc7XG4gICAgcmVhZG9ubHkgaW5wdXQgPSB1bmRlZmluZWQ7XG4gICAgcmVhZG9ubHkgb3V0cHV0ID0gbmV3IFZvbHVtZSh7Y29udGV4dDogdGhpcy5jb250ZXh0fSk7XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgY29tcG9uZW50IGlzIGVuYWJsZWQgb3Igbm90XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9lbmFibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdm9sdW1lIG91dHB1dCBvZiB0aGUgY29tcG9uZW50XG4gICAgICovXG4gICAgcmVhZG9ubHkgdm9sdW1lOiBQYXJhbTxVbml0LkRlY2liZWxzPiA9IHRoaXMub3V0cHV0LnZvbHVtZTtcblxuICAgIC8qKlxuICAgICAqIEJvb2xlYW4gaW5kaWNhdGlvbiBvZiBpZiB0aGUgY29tcG9uZW50IGlzIGxvYWRlZCBvciBub3RcbiAgICAgKi9cbiAgICBwcml2YXRlIF9sb2FkZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBkaXJlY3RvcnkgdG8gbG9hZCB0aGUgU2FsYW1hbmRlciBzYW1wbGVzIG91dCBvZlxuICAgICAqL1xuICAgIHJlYWRvbmx5IHNhbXBsZXM6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBpYW5vQ29tcG9uZW50T3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcblxuICAgICAgICB0aGlzLnZvbHVtZS52YWx1ZSA9IG9wdGlvbnMudm9sdW1lO1xuXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSBvcHRpb25zLmVuYWJsZWQ7XG5cbiAgICAgICAgdGhpcy5zYW1wbGVzID0gb3B0aW9ucy5zYW1wbGVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgY29tcG9uZW50IGludGVybmFsbHlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgX2ludGVybmFsTG9hZCgpOiBQcm9taXNlPHZvaWQ+XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgc2FtcGxlcyBhcmUgbG9hZGVkIG9yIG5vdFxuICAgICAqL1xuICAgIGdldCBsb2FkZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkZWRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBzYW1wbGVzXG4gICAgICovXG4gICAgYXN5bmMgbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMuX2VuYWJsZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2ludGVybmFsTG9hZCgpO1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVkID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=