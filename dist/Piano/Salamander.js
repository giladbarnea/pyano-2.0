Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
exports.githubURL = 'https://tambien.github.io/Piano/Salamander/';
function getReleasesUrl(midi) {
    return `rel${midi - 20}.[mp3|ogg]`;
}
exports.getReleasesUrl = getReleasesUrl;
function getHarmonicsUrl(midi) {
    return `harmS${Util_1.midiToNote(midi).replace('#', 's')}.[mp3|ogg]`;
}
exports.getHarmonicsUrl = getHarmonicsUrl;
function getNotesUrl(midi, vel) {
    return `${Util_1.midiToNote(midi).replace('#', 's')}v${vel}.[mp3|ogg]`;
}
exports.getNotesUrl = getNotesUrl;
exports.velocitiesMap = {
    1: [8],
    2: [6, 12],
    3: [1, 7, 15],
    4: [1, 5, 10, 15],
    5: [1, 4, 8, 12, 16],
    6: [1, 3, 7, 10, 13, 16],
    7: [1, 3, 6, 9, 11, 13, 16],
    8: [1, 3, 5, 7, 9, 11, 13, 16],
    9: [1, 3, 5, 7, 9, 11, 13, 15, 16],
    10: [1, 2, 3, 5, 7, 9, 11, 13, 15, 16],
    11: [1, 2, 3, 5, 7, 9, 11, 13, 14, 15, 16],
    12: [1, 2, 3, 4, 5, 7, 9, 11, 13, 14, 15, 16],
    13: [1, 2, 3, 4, 5, 7, 9, 11, 12, 13, 14, 15, 16],
    14: [1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 15, 16],
    15: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16],
    16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
};
exports.allNotes = [
    21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54,
    57, 60, 63, 66, 69, 72, 75, 78, 81, 84,
    87, 90, 93, 96, 99, 102, 105, 108
];
function getNotesInRange(min, max) {
    return exports.allNotes.filter(note => min <= note && note <= max);
}
exports.getNotesInRange = getNotesInRange;
const harmonics = [21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87];
function getHarmonicsInRange(min, max) {
    return harmonics.filter(note => min <= note && note <= max);
}
exports.getHarmonicsInRange = getHarmonicsInRange;
function inHarmonicsRange(note) {
    return harmonics[0] <= note && note <= harmonics[harmonics.length - 1];
}
exports.inHarmonicsRange = inHarmonicsRange;
//# sourceMappingURL=Salamander.js.map