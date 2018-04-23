let scale = 5  // 10 pixels = 1 meter
let gravity = 5

function calculateImpulse(meters, td) {
    return meters * scale * td / 60
}

export {scale, gravity, calculateImpulse}
