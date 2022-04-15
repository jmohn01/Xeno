import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { WALL_TYPE, XENO_EVENTS } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";
import Upgradeable from "./Upgradable";

export enum NEIGHBOR {
    LEFT,
    RIGHT,
    TOP,
    BOT
}


export default class WallAI implements BattlerAI, Upgradeable {
    level: xeno_level;
    speed: number;
    armor: number;
    effects: Effect<any>[];
    atkEffect: EffectData;
    atk: PointAttack | AOEAttack;



    owner: AnimatedSprite;
    health: number;
    neighboringWall: Array<AnimatedSprite> = new Array(4);
    neighborNum: number;
    type: WALL_TYPE
    shape: string
    emitter: Emitter = new Emitter();
    receiver: Receiver = new Receiver();


    damage(damage: number): void {
        if (this.health <= 0) {
            return;
        }

        this.health -= damage;

        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent(XENO_EVENTS.WALL_DIED, { owner: this.owner });
        }

    }


    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { health, armor, type, level, leftTile, rightTile, botTile, topTile } = options;
        this.health = health;
        this.armor = armor;
        this.type = type;
        this.level = level; 
        this.neighboringWall[NEIGHBOR.LEFT] = leftTile;
        this.neighboringWall[NEIGHBOR.RIGHT] = rightTile;
        this.neighboringWall[NEIGHBOR.TOP] = topTile;
        this.neighboringWall[NEIGHBOR.BOT] = botTile;
        this.neighborNum = this.neighboringWall.filter((e) => !!e).length;
        this.updateShape();
        this.receiver.subscribe([
            XENO_EVENTS.EFFECT_END
        ])
    }

    addNeighbor(w: AnimatedSprite, dir: NEIGHBOR) {
        this.neighboringWall[dir] = w;
        this.neighborNum++;
        this.updateShape();
    }

    delNeighbor(dir: NEIGHBOR) {
        this.neighboringWall[dir] = null;
        this.neighborNum--;
        this.updateShape();
    }

    updateShape(): void {
        const newShape = WallAI.getWallShape(
            this.neighboringWall[NEIGHBOR.LEFT],
            this.neighboringWall[NEIGHBOR.RIGHT],
            this.neighboringWall[NEIGHBOR.BOT],
            this.neighboringWall[NEIGHBOR.TOP],
            this.neighborNum
        );
        this.shape = newShape;
        this.owner.animation.play(`${this.type}_${newShape}`, true);
    }

    upgrade(): void {
        let newType: WALL_TYPE;
        switch (this.type) {
            case WALL_TYPE.DIRT:
                newType = WALL_TYPE.WOOD;
                break;
            case WALL_TYPE.WOOD:
                newType = WALL_TYPE.STONE;
                break;
            case WALL_TYPE.STONE:
                newType = WALL_TYPE.FIBER;
                break;
            case WALL_TYPE.FIBER:
                this.emitter.fireEvent(XENO_EVENTS.ERROR, { message: 'This cannot be upgraded' })
                return;
        }
        const { health, armor } = this.level.getWallData(newType);
        this.health = health;
        this.armor = armor;
        this.type = newType;
        this.owner.animation.play(`${this.type}_${this.shape}`, true);
    }


    destroy(): void {
        throw new Error("Method not implemented.");
    }

    activate(options: Record<string, any>): void {
        throw new Error("Method not implemented.");
    }

    handleEvent(event: GameEvent): void {
        switch (event.type) {
            case XENO_EVENTS.EFFECT_END:
                if (event.data.get("owner") === this) {
                    this.removeEffect(event.data.get("id"));
                }
                break;
        }
    }

    update(deltaT: number): void {

    }

    addEffect(effect: Effect<any>): void {
        throw new Error("Method not implemented.");
    }

    removeEffect(id: number): void {
        this.effects = this.effects.filter((e) => e.id !== id);
    }

    static getWallShape(
        left: AnimatedSprite,
        right: AnimatedSprite,
        bot: AnimatedSprite,
        top: AnimatedSprite,
        num: number
    ): string {
        if (num === 4) {
            return 'CROSSROAD'
        }

        if (num === 3) {
            if (!left)
                return 'RTRI';
            if (!right)
                return 'LTRI';
            if (!top)
                return 'BTRI';
            if (!bot)
                return 'TTRI'
        }

        if (num === 2) {
            if (!left && !right)
                return 'VERTICAL'
            if (!top && !bot)
                return 'HORIZONTAL'
            if (!left && !top)
                return 'RBTURN'
            if (!left && !bot)
                return 'RTTURN'
            if (!right && !top)
                return 'LBTURN'
            if (!right && !bot)
                return 'LTTURN'
        }

        if (num === 1) {
            if (left || right)
                return 'HORIZONTAL'
            if (top || bot)
                return 'VERTICAL'
        }

        return 'HORIZONTAL'
    }

}