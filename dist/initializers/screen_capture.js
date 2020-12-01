Object.defineProperty(exports, "__esModule", { value: true });
if (NOSCREENCAPTURE) {
    console.warn('NOSCREENCAPTURE, not capturing');
}
else {
    const { desktopCapturer } = require('electron');
    (async () => {
        console.group(`screen_capture.ts`);
        const suffix = 'webm';
        const mimeType = `video/${suffix}`;
        const recordedChunks = [];
        async function writeVideoFile(ev) {
            const vidpath = path.join(SESSION_PATH_ABS, `${path.basename(SESSION_PATH_ABS)}.${suffix}`);
            console.debug(`writeVideoFile() | writing to "${vidpath}"`);
            const blob = new Blob(recordedChunks, {
                type: mimeType
            });
            const buffer = Buffer.from(await blob.arrayBuffer());
            fs.writeFile(vidpath, buffer, () => {
                console.log(`writeVideoFile() | screen capture saved successfully to "${vidpath}"`);
                MEDIA_RECORDER.stopped = true;
            });
        }
        const windows = await desktopCapturer.getSources({ types: ['window'] });
        for (const { id, name, display_id } of windows) {
            console.debug(`desktopCapturer.getSources() window:`, pftm({ id, name, display_id }));
            let shouldCapture = (
            // source.name.includes('Developer Tools') ||
            // source.name.includes('DevTools') ||
            name == 'Pyano'
            // name.includes('מכבי')
            );
            if (!shouldCapture) {
                continue;
            }
            // https://www.electronjs.org/docs/api/desktop-capturer
            const constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                    }
                }
            };
            // @ts-ignore
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.debug('created stream:', pft(stream));
            // handleStream(stream);
            // const mimeType = 'video/webm; codecs=vp24';
            MEDIA_RECORDER = new MediaRecorder(stream, {
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 2500000,
                mimeType
            });
            console.debug('created MEDIA_RECORDER:', pft(MEDIA_RECORDER));
            MEDIA_RECORDER.ondataavailable = function (e) {
                console.debug('video data available, pushing to recordedChunks');
                recordedChunks.push(e.data);
            };
            MEDIA_RECORDER.onstop = writeVideoFile;
            MEDIA_RECORDER.start();
            RECORD_START_TS = util.now(2);
            console.debug('MEDIA_RECORDER.start(); MEDIA_RECORDER:', pft(MEDIA_RECORDER));
            console.groupEnd();
            return;
        }
    })();
}