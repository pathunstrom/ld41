function easeQuadratic (time, start, end, duration) {
    time /= duration/2;
    if (time < 1) {
        return end/2*time*time + start;
    }
    time--
    return -end / 2 * (time * (time - 2) - 1) + start;
}

export {easeQuadratic}
