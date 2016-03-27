const hash = {};
const cache = [];

const add = url => {
    if (!hash[url]) {
        hash[url] = new Image();
        hash[url].src = url;

        cache.push(hash[url]);
    }
    return hash[url];
};

const get = url => add(url);

const stuff = (urls) => {
    if (urls.length > 0) {
        urls.map(add);
    }
};

export const ImageCache = {
    add,
    stuff,
    get,
    hash,
    cache,
};

const ImageHelper = {
    loadImage(url) {
        const image = ImageCache.get(url);

        return new Promise((resolve, reject) => {
            const handleSuccess = () => {
                resolve(image);
            };
            const handleError = () => {
                console.error('IMAGE FAIL', image);
                reject(image);
            };

            if (image.naturalWidth && image.naturalHeight && image.complete) {
                // image is loaded, go ahead and change the state
                handleSuccess();
            } else {
                image.addEventListener('load', handleSuccess, false);
                image.addEventListener('error', handleError, false);
            }
        });
    },

    loadImages(urls) {
        const promises = urls.map(this.loadImage.bind(this));
        return Promise.all(promises);
    },

    // preload without caring about the result
    stuffImages(urls) {
        ImageCache.stuff(urls);
    },
};

export default ImageHelper;
