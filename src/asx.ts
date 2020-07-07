type jQuery = any;

function $fadeOut(jQuery: jQuery, ms: number): Promise<jQuery> {
    return new Promise(resolve => jQuery.fade(ms, 0, resolve));
}


function $fadeIn(jQuery: jQuery, ms: number): Promise<jQuery> {
    return new Promise(resolve => jQuery.fade(ms, 1, resolve));
}


async function $fadeInMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]> {
    let promises = [];
    for (let jQ of jQueries)
        promises.push($fadeIn(jQ, ms));

    return await Promise.all(promises);
}


async function $fadeOutMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]> {
    let promises = [];
    for (let jQ of jQueries)
        promises.push($fadeOut(jQ, ms));

    return await Promise.all(promises);
}

// function concurrent<T>(...promises: Promise<T>[]): Promise<T[]>
// function concurrent(...promises: Promise<any>[]): Promise<any[]>
// async function concurrent(...promises) {
//     return await Promise.all(promises);
// }

// export default { concurrent }

