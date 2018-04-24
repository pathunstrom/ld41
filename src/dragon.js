import "pixi.js"
import {calculateImpulse} from "./physics.js"

let resources = PIXI.loader.resources
let Sprite = PIXI.Sprite
let Max16 = Math.pow(2, 16) - 1

function generateID() {
    return Math.floor(Math.random() * Max16)
}

let maxValue = 45
function randomSpawnTime() {
    return Math.floor((Math.random() * maxValue) +
                      (Math.random() * maxValue) +
                      (Math.random() * maxValue)) +
                       maxValue
}

function makeCollider(object) {
    let sprite = object.sprite
    return {
        position: sprite.position,
        radius: Math.sqrt(
            Math.pow(sprite.width / 2, 2) + Math.pow(sprite.height / 2, 2)
        )
    }
}

class DragonManager {
    constructor (stage, player) {
        this.stage = stage
        this.wizard = player
        this.count = 0
        this.nextSpawn = randomSpawnTime()
        this.active = {
            small: new Set(),
        }
        this.inactive = {
            small: [],
        }
    }

    update (td, controller) {
        for (let setName of Object.keys(this.active)) {
            let dragonSet = this.active[setName]
            for (let dragon of dragonSet) {
                dragon.update(td, controller)
                if (dragon.sprite.position.x < -50) {

                }
            }
        }
        this.collisions()
        this.spawn(td)
    }

    spawn (td) {
        this.count += td

        if (this.count > this.nextSpawn) {
            let spawnCount = Math.floor(Math.random() * 3) + 1
            for (;spawnCount > 0;spawnCount--) {
                let newDragon
                if (this.inactive.small.length > 0) {
                    newDragon = this.inactive.small.pop()
                } else {
                    newDragon = new Dragon(this.stage)
                }
                newDragon.sprite.x = 650
                newDragon.sprite.y = Math.floor(Math.random() * 300) + 50
                newDragon.sprite.visible = true
                this.active.small.add(newDragon)
            }
            this.count -= this.nextSpawn
        }
        this.nextSpawn = randomSpawnTime()
    }

    collisions() {
        let wizardCollider = makeCollider(this.wizard)
        for (let dragon in this.active.small) {
            let dragonCollider = makeCollider(dragon)
            let xRange = dragonCollider.position.x - wizardCollider.position.x
            let yRange = dragonCollider.position.y - wizardCollider.position.y
            let distance = Math.sqrt(Math.pow(xRange, 2) + Math.pow(yRange, 2))
            if (distance < dragonCollider.radius + wizardCollider.radius) {
                this.wizard.hit()
                this.deactivateDragon(dragon)
            }
        }
    }

    deactivateDragon(dragon) {
        this.active[dragon.size].delete(dragon)
        this.inactive[dragon.size].push(dragon)
        dragon.sprite.visible = false
    }
}

class Dragon {
    constructor (stage) {
        if (this.texture === undefined) {
            this.texture = resources["img/dragon-sm.png"].texture
        }
        this.id = generateID()
        this.sprite = new Sprite(this.texture)
        this.sprite.anchor.set(0.5, 0.5)
        this.sprite.scale.set(1.5)
        this.sprite.position.set(550, 200)
        this.vx = -15
        stage.addChild(this.sprite)
    }

    update (td, controller) {
        this.sprite.position.x += calculateImpulse(this.vx, td)
    }
}

export default DragonManager