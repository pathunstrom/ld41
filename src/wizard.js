import "pixi.js"
import {easeQuadratic} from "./easing"

let Sprite = PIXI.Sprite

let scale = 5  // 10 pixels = 1 meter
let gravity = 5

let diveVelocity = 200
let diveAcceleration = 72

function calculateImpulse(meters, td) {
    return meters * scale * td / 60
}

class StateManager {

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
            this._diveState = new Dive()
        }

        return this._diveState
    }

    get endDiveState() {
        if (this._endDiveState === undefined) {
            this._endDiveState = new EndDive()
        }

        return this._endDiveState
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
        this.nextState = null
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

        this.flushState()
    }

    changeState(state) {
        this.nextState = state
    }

    flushState () {
        if (this.nextState !== null) {
            this.state.onExit(this)
            this.state = this.nextState
            this.state.onEnter(this)
            this.nextState = null
        }

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

    onEnter (agent) {
        agent.sprite.rotation = 0
    }
}

class Impulse extends State {

    constructor () {
        super()
        this.waitTimeStart = 65
        this.waitTime = this.waitTimeStart
    }

    onEnter (wizard) {
        wizard.vy = -28
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
        this.terminalVelocity = diveVelocity
        this.extraAcceleration = diveAcceleration
    }

    onEnter (agent) {
        this.rotation = 0
    }

    update(agent, td, controller) {
        this.rotation += this.rotationPerSecond * td / 60

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

class Dive extends State {
    constructor () {
        super()
        this.terminalVelocity = diveVelocity
        this.extraAcceleration = diveAcceleration
    }

    update (agent, td, controller) {
        agent.vy += calculateImpulse(this.extraAcceleration, td)

        if (!controller.dive.isHeld) {
            agent.changeState(stateManager.endDiveState)
        }
    }
}

class EndDive extends State {
    constructor () {
        super()
        this.runTime = 25
        this.startRotation = Math.PI / 3
        this.endRotation = -.1
        this.differenceRotation = this.startRotation - this.endRotation
        this.startLift = 200
        this.differenceLift = 210
        this.endLift = -10
    }

    onEnter (agent) {
        this.startRotation = agent.sprite.rotation
        this.differenceRotation = this.startRotation - this.endRotation
        this.startLift = agent.vy
        this.differenceLift = this.startLift - this.endLift
        this.runningTime = 0
    }

    update (agent, td, controller) {
        this.runningTime += td

        let rotationDifference = easeQuadratic(this.runningTime, 0, this.differenceRotation, this.runTime)
        let liftDifference = easeQuadratic(this.runningTime, 0, this.differenceLift, this.runTime)
        agent.vy = this.startLift - liftDifference
        agent.sprite.rotation = this.startRotation - rotationDifference
        if (this.runningTime >= this.runTime) {
            agent.changeState(stateManager.idleState)
        }
    }
}

export default Wizard
