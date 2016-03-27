export function distance(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;

    return Math.sqrt(dx * dx + dy * dy);
}

export function degreesToRads(degrees) {
    return degrees / 180 * Math.PI;
}

export function radsToDegrees(radians) {
    return radians * 180 / Math.PI;
}

export function isArray(object) {
    return Object.prototype.toString.call(object) === '[object Array]';
}

export function isNumber(object) {
    return typeof object === 'number';
}

export function random(min, max) {
    if (isArray(min)) {
        return min[~~(Math.random() * min.length)];
    }

    if (!isNumber(max)) {
        max = min || 1, min = 0;
    }

    return min + Math.random() * (max - min);
}

export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

export function lerp(norm, min, max) {
    return (max - min) * norm + min;
}

export function map(value, sourceMin, sourceMax, destMin, destMax) {
    return lerp(normalize(value, sourceMin, sourceMax), destMin, destMax);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}

export function getOffset(el) {
    const rect = el.getBoundingClientRect();

    return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft,
    };
}
