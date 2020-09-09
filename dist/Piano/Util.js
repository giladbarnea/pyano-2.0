Object.defineProperty(exports, "__esModule", { value: true });
const tone_1 = require("tone");
function noteToMidi(note) {
    return tone_1.Frequency(note).toMidi();
}
exports.noteToMidi = noteToMidi;
function midiToNote(midi) {
    const frequency = tone_1.Frequency(midi, 'midi');
    const ret = frequency.toNote();
    return ret;
}
exports.midiToNote = midiToNote;
function midiToFrequencyRatio(midi) {
    const mod = midi % 3;
    if (mod === 1) {
        return [midi - 1, tone_1.intervalToFrequencyRatio(1)];
    }
    else if (mod === 2) {
        return [midi + 1, tone_1.intervalToFrequencyRatio(-1)];
    }
    else {
        return [midi, 1];
    }
}
function createSource(buffer) {
    return new tone_1.ToneBufferSource(buffer);
}
function randomBetween(low, high) {
    return Math.random() * (high - low) + low;
}
exports.randomBetween = randomBetween;
//# sourceMappingURL=Util.js.map