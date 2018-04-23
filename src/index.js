import "pixi.js"
import Wizard from "./wizard.js"
import Dragon from "./dragon.js"

let App = PIXI.Application
let loader = PIXI.loader
let resources = PIXI.loader.resources
let Sprite = PIXI.Sprite

let upArrow = 38
let downArrow = 40
let rightArrow = 39

class Game {
    constructor(appSettings) {
        this.app = new App(appSettings)
        this.textures = [
            "img/wizard.png",
            "img/flap.png",
            "img/dragon-sm.png",
        ]
        this.wizard = undefined
        this.dragon = undefined
        this.controller = new Controller(upArrow, downArrow, rightArrow)
        document.body.appendChild(this.app.view)
        loader.add(this.textures).load(this.setup.bind(this))
    }

    setup() {
        this.wizard = new Wizard(this.app.stage)
        this.dragon = new Dragon(this.app.stage)
        this.app.ticker.add(this.advance.bind(this))
    }

    advance(td) {
        this.wizard.update(td, this.controller)
        this.dragon.update(td, this.controller)
        this.controller.update(td)
    }
}


class Controller {
    constructor(flapKey, diveKey, shootKey) {
        this.flapControl = new Key(flapKey)
        this.diveControl = new Key(diveKey)
        this.shootControl = new Key(shootKey)
    }

    get flap() {
        return this.flapControl
    }

    get dive() {
        return this.diveControl
    }

    get shoot() {
        return this.shootControl
    }

    update(td) {
        this.flapControl.update(td)
        this.diveControl.update(td)
        this.shootControl.update(td)
    }
}

class Key {
    constructor(keyCode) {
        this.code = keyCode
        this.isDown = false
        this.isHeld = false
        this.wait = 0
        window.addEventListener("keydown", this.downHandler.bind(this))
        window.addEventListener("keyup", this.upHandler.bind(this))
    }

    upHandler(event) {
        if (event.keyCode === this.code) {
            this.isDown = false
            this.isHeld = false
        }
    }

    downHandler(event) {
        if (event.keyCode === this.code) {
            this.isDown = true
        }
    }

    update(td) {
        if (!this.isHeld && this.isDown) {
            if (this.wait) {
                this.wait = 0
                this.isHeld = true
            } else {
                this.wait += 1
            }
        }
    }
}

let settings = {
    width: 600,
    height: 400,
    backgroundColor: 0x1c70ca,
    resolution: window.devicePixelRatio,
    antialias: true,
}

let wizardFlight = new Game(settings)

