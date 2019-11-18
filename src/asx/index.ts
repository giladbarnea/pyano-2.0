function $fadeOut(jQuery: jQuery, ms: number): Promise<jQuery> {
    return new Promise(resolve => jQuery.fade(ms, 0, resolve));
}


function $fadeIn(jQuery: jQuery, ms: number): Promise<jQuery> {
    return new Promise(resolve => jQuery.fade(ms, 1, resolve));
}


async function $fadeInMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]> {
    let promises = [];
    for ( let jQ of jQueries )
        promises.push($fadeIn(jQ, ms));
    
    return await Promise.all(promises);
}


async function $fadeOutMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]> {
    let promises = [];
    for ( let jQ of jQueries )
        promises.push($fadeOut(jQ, ms));
    
    return await Promise.all(promises);
}


async function concurrent<T>(...promises: Promise<T | void>[] | T[] | void[]) {
    return await Promise.all(promises);
}

export default { $fadeIn, $fadeInMany, $fadeOut, $fadeOutMany, concurrent }

