import ImageHelper from './ImageHelper';

export function preloadImages(images) {
    if (!images) {
        return Promise.resolve({});
    }

    const keys = _.keys(images);
    const urls = _.values(images);

    return ImageHelper.loadImages(urls).then((imageObjects) => (
        _.zipObject(keys, imageObjects)
    ));
}

export default function preloadGameAssets(requiredAssets) {
    const { images, sounds } = requiredAssets;

    return Promise.all([
        preloadImages(images),
        // preloadSounds(sounds),
    ]).then(assets => (
        _.omitBy(_.zipObject(['images', 'sounds', 'keys'], assets), _.isUndefined)
    ));
}
