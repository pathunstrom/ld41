import "pixi.js"

let Sprite = PIXI.Sprite

let scale = 10  // 10 pixels = 1 meter
let gravity = 18 * scale  // 9.8 meters per second

function calculate_impulse(meters, td) {
    return meters * scale * td / 1000
}

class StateManager {
    constructor () {
        this._idleState = undefined
        this._impuleState = undefined
        this._startDiveState = undefined
    }

    get idleState() {
        if (this._idleState === undefined) {
            this._idleState = new IdleState()
        }
        return this._idleState
    }

    get impulseState() {
        if (this._impuleState === undefined) {
            this._impuleState = new ImpulseState()
        }
        return this._impuleState
    }

    get startDiveState() {
        if (this._startDiveState === undefined) {
            this._startDiveState = new IdleState()
        }

        return this._startDiveState
    }
}

let stateManager = new StateManager()

class Wizard {
    constructor(stage, resources) {
        this.sprite = new Sprite(resources["img/wizard.png"].texture)
        this.sprite.anchor.set(0.5, 0.5)
        this.sprite.position.set(300, 200)
        this.sprite.scale.set(0.5, 0.5)
        this.vy = 0
        this.state = stateManager.idleState
        stage.addChild(this.sprite)
    }

    update(td, controller) {
        this.state.update(this, td, controller)
        console.log(`Wizard vy: ${this.vy}`)
        let limiter = this.sprite.height / 2

        if (this.sprite.position.y < (400 - limiter)) {
            this.vy += calculate_impulse(gravity, td)
        } else {
            this.vy = 0
        }
        this.sprite.position.y += calculate_impulse(this.vy, td)
        if (this.sprite.position.y < limiter) {this.sprite.position.y = limiter}
    }

    changeState(state) {
        this.state = state
        this.state.onEnter(this)
    }
}


class IdleState {
    onEnter () {

    }

    update(wizard, td, controller) {
        if (controller.flap.isDown && !controller.flap.isHeld) {
            wizard.changeState(stateManager.impulseState)
        }
    }
}

class ImpulseState {

    constructor () {
        this.waitTimeStart = 3
        this.waitTime = this.waitTimeStart
    }

    onEnter (wizard) {
        console.log("Entering ImpulseState")
        wizard.vy = -100
        this.waitTime = this.waitTimeStart
    }

    update(wizard, td, controller) {
        this.waitTime -= td
        if (this.waitTime <= 0) {
            wizard.changeState(stateManager.idleState)
        }

        if (controller.dive.isDown) {
            wizard.changeState(stateManager.startDiveState)
        }
    }
}

export default Wizard
