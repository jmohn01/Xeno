import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BattlerAI from "./BattlerAI";
import Upgradeable from "./Upgradable";

export default class TurretAI implements BattlerAI, Upgradeable {

    owner: AnimatedSprite;

    health: number;

    target: AnimatedSprite = null;

    emitter: Emitter = new Emitter();

    damage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent("turretDied", {wall: this.owner}); 
        }
    }

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner; 
        this.health = 20;
        this.owner.animation.playIfNotAlready('IDLE', true);
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
    activate(options: Record<string, any>): void {
        throw new Error("Method not implemented.");
    }
    handleEvent(event: GameEvent): void {
        
    }
    update(deltaT: number): void {
        if (this.target != null) {
            const lookDir = this.owner.position.dirTo(this.target.position);
            this.owner.rotation = Vec2.UP.angleToCCW(lookDir);
        }
    }
    upgrade(): void {
        throw new Error("Method not implemented.");
    }

}