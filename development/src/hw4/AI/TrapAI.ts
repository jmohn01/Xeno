import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Color from "../../Wolfie2D/Utils/Color";
import { XENO_ACTOR_TYPE } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import { SplashAnimation } from "../GameSystems/AttackAnimation/SplashAnimation";
import Upgradeable from "./Upgradable";

export default class TrapAI implements AI, Upgradeable {
    owner: AnimatedSprite
    atk: AOEAttack;
    atkEffect: EffectData

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.atkEffect = options.effectData;
        if (options.damage) {
            this.atk = new AOEAttack(options.damage, 100, 3000, new SplashAnimation(Color.BLUE), this.atkEffect, options.battleManager);
        } else {
            this.atk = new AOEAttack(0, 100, 3000, new SplashAnimation(Color.BLUE), this.atkEffect, options.battleManager);
        }
    }

    attack(): void {
        this.atk.attack(this, XENO_ACTOR_TYPE.FRIEND);
    }

    destroy(): void {
    }

    activate(options: Record<string, any>): void {
    }

    handleEvent(event: GameEvent): void {
        throw new Error("Method not implemented.");
    }

    update(deltaT: number): void {
    }

    upgrade(): void {
        throw new Error("Method not implemented.");
    }

}