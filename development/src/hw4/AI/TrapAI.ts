import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Color from "../../Wolfie2D/Utils/Color";
import { XENO_ACTOR_TYPE } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import { SplashAnimation } from "../GameSystems/AttackAnimation/SplashAnimation";
import xeno_level from "../Scenes/xeno_level";
import { Grade } from "../type";
import Upgradeable from "./Upgradable";

export default class TrapAI implements AI, Upgradeable {
    owner: AnimatedSprite
    atk: AOEAttack;
    grade: Grade;
    level: xeno_level;
    range: number; 

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { color, damage, range, cooldown, atkEffect, level, battleManager } = options;
        this.level = level;
        this.atk = new AOEAttack(damage, range, cooldown, new SplashAnimation(color), atkEffect, battleManager);
    }

    attack(): void {
        const targets = this.level.findEnemiesInRange(this.owner.position, this.range); 
        if (targets)
            this.atk.attack(this.owner.position, targets, this.owner.getScene());
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