import "pixi.js"

let Sprite = PIXI.Sprite

let scale = 10  // 10 pixels = 1 meter
let gravity = 18  // 9.8 meters per second

function calculateImpulse(meters, td) {
    return meters * scale * td / 1000
}

class StateManager {
    constructor () {
        this._idleState = undefined
        this._impulseState = undefined
        this._startDiveState = undefined
    }

    get idleState() {
        if (this._idleState === undefined) {
            this._idleState = new IdleState()
        }
        return this._idleState
    }

    get impulseState() {
        if (this._impulseState === undefined) {
            this._impulseState = new Impulse()
        }
        return this._impulseState
    }

    get startDiveState() {
        if (this._startDiveState === undefined) {
            this._startDiveState = new EnterDive()
        }

        return this._startDiveState
    }

    get diveState() {
        if (this._diveState === undefined) {
            this._diveState = new IdleState()
        }

        return this._diveState
    }
}

let stateManager = new StateManager()

class Wizard {
    constructor(stage, resources) {
        this.sprite = new Sprite(resources["img/wizard.png"].texture)
        this.sprite.anchor.set(0.5, 0.5)
        this.sprite.position.set(150, 200)
        this.sprite.scale.set(0.5, 0.5)
        this.vy = 0
        this.state = stateManager.idleState
        stage.addChild(this.sprite)
    }

    update(td, controller) {
        this.state.update(this, td, controller)

        let limiter = this.sprite.height / 2

        if (this.sprite.position.y < (400 - limiter)) {
            this.vy += calculateImpulse(gravity, td)
        } else {
            this.vy = 0
        }

        if (this.vy > this.state.terminalVelocity) {
            this.vy = this.state.terminalVelocity
        }

        this.sprite.position.y += calculateImpulse(this.vy, td)
        if (this.sprite.position.y < limiter) {this.sprite.position.y = limiter}
    }

    changeState(state) {
        this.state.onExit(this)
        this.state = state
        this.state.onEnter(this)
    }
}

class State {
    constructor () {
        this.terminalVelocity = 100
    }

    onEnter (agent) {

    }

    onExit (agent) {

    }

    update (agent, td, controller) {

    }
}

class IdleState extends State {
    update(wizard, td, controller) {
        if (controller.flap.isDown && !controller.flap.isHeld) {
            wizard.changeState(stateManager.impulseState)
        } else if (controller.dive.isDown) {
            wizard.changeState(stateManager.startDiveState)
        }
    }
}

class Impulse extends State {

    constructor () {
        super()
        this.waitTimeStart = 3
        this.waitTime = this.waitTimeStart
    }

    onEnter (wizard) {
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

class EnterDive extends State {

    constructor () {
        super()
        this.rotation = 0
        this.maxRotation = Math.PI / 3
        this.rotationPerSecond = Math.PI * 2
        this.terminalVelocity = 200
        this.extraAcceleration = 72
    }

    onExit (agent) {
        this.rotation = 0
    }

    update(agent, td, controller) {
        this.rotation += this.rotationPerSecond * td / 1000

        if (this.rotation >= this.maxRotation) {
            this.rotation = this.maxRotation
            let nextState
            if (controller.dive.isHeld) {
                nextState = stateManager.diveState
            } else {
                nextState = stateManager.endDiveState
            }
            agent.changeState(nextState)
        }

        agent.sprite.rotation = this.rotation
        if (agent.vy < 0) {agent.vy = agent.vy * 0.95}
        agent.vy += calculateImpulse(this.extraAcceleration, td)
    }
}

export default Wizard
