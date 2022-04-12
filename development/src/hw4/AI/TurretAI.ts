import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Color from "../../Wolfie2D/Utils/Color";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { BulletAnimation } from "../GameSystems/AttackAnimation/BulletAnimation";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";
import Upgradeable from "./Upgradable";

export default class TurretAI implements BattlerAI, Upgradeable {
    level: xeno_level;

    armor: number;

    range: number = 300;

    speed: number;

    owner: AnimatedSprite;

    health: number;

    target: BattlerAI;

    effects: Effect<any>[];

    atkEffect: EffectData;

    emitter: Emitter = new Emitter();

    atk: PointAttack;

    damage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent("turretDied", { owner: this.owner });
        }
    }

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.health = 20;
        this.owner.animation.playIfNotAlready('IDLE', true);
        this.atk = new PointAttack(10, 1000, new BulletAnimation(Color.YELLOW), {}, options.battleManager);
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
        this.target = (this.owner.getScene() as xeno_level).findEnemyInRange(this.owner.position, this.range);
        if (this.target) {
            const lookDir = this.owner.position.dirTo(this.target.owner.position);
            this.atk.attack(this, this.target);
            this.owner.rotation = Vec2.UP.angleToCCW(lookDir);
        }
    }

    upgrade(): void {
        throw new Error("Method not implemented.");
    }

    addEffect(effect: Effect<any>): void {
        for (let i = 0; i < this.effects.length; i++) {
            const curr = this.effects[i];
            if (curr.type === effect.type && curr.isActive() && curr.equal(effect)) {
                curr.refreshEffect();
                return;
            }
        }
        this.effects.push(effect);
        effect.applyEffect();
    }

    removeEffect(id: number): void {
        this.effects = this.effects.filter((e) => e.id !== id);
    }

}