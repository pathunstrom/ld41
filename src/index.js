import "pixi.js"

let App = PIXI.Application
let loader = PIXI.loader
let resources = PIXI.loader.resources
let Sprite = PIXI.Sprite

class Game {
    constructor(appSettings) {
        this.app = new App(appSettings)
        this.textures = ["img/wizard.png"]
        this.wizard = undefined
        document.body.appendChild(this.app.view)
        loader.add(this.textures).load(this.setup.bind(this))
    }

    setup() {
        this.wizard = new Wizard(this.app.stage, resources)
        this.app.ticker.add(this.advance.bind(this))
    }

    advance(td) {
    }
}

class Wizard {
    constructor(stage, resources) {
        this.sprite = new Sprite(resources["img/wizard.png"].texture)
        this.sprite.anchor.set(0.5, 0.5)
        this.sprite.position.set(300, 200)
        stage.addChild(this.sprite)
    }
}

let settings = {
    width: 600,
    height: 400,
    backgroundColor: 0x1c70ca,
    resolution: window.devicePixelRatio,
}

let wizardFlight = new Game(settings)

