const { desktopCapturer } = require('electron');
(async () => {
    const suffix = 'webm'
    const mimeType = `video/${suffix}`;
    const recordedChunks = [];

    async function writeVideoFile(e) {
        const vidpath = path.join(SESSION_PATH_ABS, `${path.basename(SESSION_PATH_ABS)}.${suffix}`)
        elog.debug(`writeVideoFile() | writing to "${vidpath}"`)
        const blob = new Blob(recordedChunks, {
            type: mimeType
        });

        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFile(vidpath, buffer, () => elog.log('video saved successfully!'));

    }

    const windows = await desktopCapturer.getSources({ types: ['window'] });
    for (const { id, name, display_id } of windows) {
        elog.debug(`desktopCapturer.getSources() window:`, { id, name, display_id });
        let shouldCapture = (
            // source.name.includes('Developer Tools') ||
            // source.name.includes('DevTools') ||
            name == 'Pyano'
            // name.includes('מכבי')
        );

        if (shouldCapture) {
            // https://www.electronjs.org/docs/api/desktop-capturer
            const constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: id,
                        // minWidth: 1280,
                        // maxWidth: 1280,
                        // minHeight: 720,
                        // maxHeight: 720
                    }
                }
            };
            // @ts-ignore
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints)
            elog.debug('created stream:', stream);

            // handleStream(stream);
            // const mimeType = 'video/webm; codecs=vp24';

            let mediaRecorder = new MediaRecorder(stream, {
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 2500000,
                mimeType
            })
            elog.debug('created mediaRecorder:', mediaRecorder);


            mediaRecorder.ondataavailable = function (e) {
                elog.debug('video data available, pushing to recordedChunks');
                recordedChunks.push(e.data);
            };
            mediaRecorder.onstop = writeVideoFile;
            mediaRecorder.start();
            elog.variables["record_start_ts"] = util.now(1);
            elog.debug('mediaRecorder.start()', mediaRecorder);

            return
        }
    }

})()
export {}