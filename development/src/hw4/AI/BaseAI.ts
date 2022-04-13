import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { XENO_EVENTS } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { AcidEffect } from "../GameSystems/Effect/AcidEffect";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";

export default class BaseAI implements BattlerAI {
    level: xeno_level;
    owner: AnimatedSprite;
    health: number;
    speed: number;
    armor: number;
    effects: Effect<any>[] = [];
    atkEffect: EffectData;
    atk: PointAttack | AOEAttack;
    emmitter: Emitter = new Emitter();


    damage(damage: number): void {
        this.health -= (damage - this.armor);
        if (this.health <= 0) {
            this.emmitter.fireEvent(XENO_EVENTS.GAME_OVER, { won: false });
        }
    }

    addEffect(effect: Effect<any>): void {
        if (!(effect instanceof AcidEffect)) return;
        for (let i = 0; i < this.effects.length; i++) {
            const curr = this.effects[i];
            if (curr.equal(effect)) {
                curr.refreshEffect();
                return;
            }
        }
        this.effects.push(effect);
        effect.applyEffect();
    }

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.health = options.health;
        this.armor = options.armor;
        
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
        
    }

    removeEffect(id: number): void {
        throw new Error("Method not implemented.");
    }

}