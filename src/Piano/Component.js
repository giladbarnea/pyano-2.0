"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
/**
 * Base class for the other components
 */
class PianoComponent extends tone_1.ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = 'PianoComponent';
        this.input = undefined;
        this.output = new tone_1.Volume({ context: this.context });
        /**
         * If the component is enabled or not
         */
        this._enabled = false;
        /**
         * The volume output of the component
         */
        this.volume = this.output.volume;
        /**
         * Boolean indication of if the component is loaded or not
         */
        this._loaded = false;
        this.volume.value = options.volume;
        this._enabled = options.enabled;
        this.samples = options.samples;
    }
    /**
     * If the samples are loaded or not
     */
    get loaded() {
        return this._loaded;
    }
    /**
     * Load the samples
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFrRTtBQWFsRTs7R0FFRztBQUNILE1BQXNCLGNBQWUsU0FBUSxvQkFBYTtJQXlCekQsWUFBWSxPQUE4QjtRQUN6QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUF6Qk4sU0FBSSxHQUFHLGdCQUFnQixDQUFBO1FBQ3ZCLFVBQUssR0FBRyxTQUFTLENBQUE7UUFDakIsV0FBTSxHQUFHLElBQUksYUFBTSxDQUFDLEVBQUMsT0FBTyxFQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBRXZEOztXQUVHO1FBQ08sYUFBUSxHQUFZLEtBQUssQ0FBQTtRQUVuQzs7V0FFRztRQUNNLFdBQU0sR0FBeUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUE7UUFFMUQ7O1dBRUc7UUFDSyxZQUFPLEdBQVksS0FBSyxDQUFBO1FBVS9CLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUE7UUFFbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO1FBRS9CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtJQUMvQixDQUFDO0lBT0Q7O09BRUc7SUFDSCxJQUFJLE1BQU07UUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLElBQUk7UUFDVCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbEIsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7WUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7U0FDbkI7YUFBTTtZQUNOLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO1NBQ3hCO0lBQ0YsQ0FBQztDQUNEO0FBMURELHdDQTBEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnRleHQsIFBhcmFtLCBUb25lQXVkaW9Ob2RlLCBVbml0LCBWb2x1bWUgfSBmcm9tICd0b25lJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFBpYW5vQ29tcG9uZW50T3B0aW9ucyB7XG5cdGNvbnRleHQ6IENvbnRleHRcblx0dm9sdW1lOiBVbml0LkRlY2liZWxzXG5cdGVuYWJsZWQ6IGJvb2xlYW5cblx0c2FtcGxlczogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXJsc01hcCB7XG5cdFtub3RlOiBzdHJpbmddOiBzdHJpbmdcbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciB0aGUgb3RoZXIgY29tcG9uZW50c1xuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGlhbm9Db21wb25lbnQgZXh0ZW5kcyBUb25lQXVkaW9Ob2RlIHtcblx0cmVhZG9ubHkgbmFtZSA9ICdQaWFub0NvbXBvbmVudCdcblx0cmVhZG9ubHkgaW5wdXQgPSB1bmRlZmluZWRcblx0cmVhZG9ubHkgb3V0cHV0ID0gbmV3IFZvbHVtZSh7Y29udGV4dCA6IHRoaXMuY29udGV4dCB9KVxuXG5cdC8qKlxuXHQgKiBJZiB0aGUgY29tcG9uZW50IGlzIGVuYWJsZWQgb3Igbm90XG5cdCAqL1xuXHRwcm90ZWN0ZWQgX2VuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZVxuXG5cdC8qKlxuXHQgKiBUaGUgdm9sdW1lIG91dHB1dCBvZiB0aGUgY29tcG9uZW50XG5cdCAqL1xuXHRyZWFkb25seSB2b2x1bWU6IFBhcmFtPFVuaXQuRGVjaWJlbHM+ID0gdGhpcy5vdXRwdXQudm9sdW1lXG5cblx0LyoqXG5cdCAqIEJvb2xlYW4gaW5kaWNhdGlvbiBvZiBpZiB0aGUgY29tcG9uZW50IGlzIGxvYWRlZCBvciBub3Rcblx0ICovXG5cdHByaXZhdGUgX2xvYWRlZDogYm9vbGVhbiA9IGZhbHNlXG5cblx0LyoqXG5cdCAqIFRoZSBkaXJlY3RvcnkgdG8gbG9hZCB0aGUgU2FsYW1hbmRlciBzYW1wbGVzIG91dCBvZlxuXHQgKi9cblx0cmVhZG9ubHkgc2FtcGxlczogc3RyaW5nXG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogUGlhbm9Db21wb25lbnRPcHRpb25zKSB7XG5cdFx0c3VwZXIob3B0aW9ucylcblxuXHRcdHRoaXMudm9sdW1lLnZhbHVlID0gb3B0aW9ucy52b2x1bWVcblxuXHRcdHRoaXMuX2VuYWJsZWQgPSBvcHRpb25zLmVuYWJsZWRcblxuXHRcdHRoaXMuc2FtcGxlcyA9IG9wdGlvbnMuc2FtcGxlc1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWQgdGhlIGNvbXBvbmVudCBpbnRlcm5hbGx5XG5cdCAqL1xuXHRwcm90ZWN0ZWQgYWJzdHJhY3QgX2ludGVybmFsTG9hZCgpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIElmIHRoZSBzYW1wbGVzIGFyZSBsb2FkZWQgb3Igbm90XG5cdCAqL1xuXHRnZXQgbG9hZGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9sb2FkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkIHRoZSBzYW1wbGVzXG5cdCAqL1xuXHRhc3luYyBsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICh0aGlzLl9lbmFibGVkKSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9pbnRlcm5hbExvYWQoKVxuXHRcdFx0dGhpcy5fbG9hZGVkID0gdHJ1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblx0XHR9XG5cdH1cbn1cbiJdfQ==