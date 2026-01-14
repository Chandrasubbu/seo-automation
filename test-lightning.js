
try {
    let parts = [process.platform, process.arch];
    if (process.platform === 'linux') {
        const { MUSL, familySync } = require('detect-libc');
        const family = familySync();
        console.log('Libc family:', family);
        if (family === MUSL) {
            parts.push('musl');
        } else if (process.arch === 'arm') {
            parts.push('gnueabihf');
        } else {
            parts.push('gnu');
        }
    } else if (process.platform === 'win32') {
        parts.push('msvc');
    }

    const pkgName = `lightningcss-${parts.join('-')}`;
    console.log('Attempting to require:', pkgName);
    require(pkgName);
    console.log('Success!');

} catch (e) {
    console.error('Failed:');
    console.error(e);
}
