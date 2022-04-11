import Emitter from "../../../Wolfie2D/Events/Emitter";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import { effectsData } from "./internal";

export default class AOEAttack {

    assets: Array<any>;

    damage: number;

    r: number;

    effects: effectsData; 

    private cooldownTimer: Timer;

    private emitter: Emitter;

    private atkAnimation: AtkAnimation;

    constructor(damage: number, r: number, cooldown: number, atkAnimation: AtkAnimation, effects: effectsData) {
        this.damage = damage;
        this.r = r;
        this.cooldownTimer = new Timer(cooldown);
        this.emitter = new Emitter();
        this.atkAnimation = atkAnimation; 
    }

    attack(from: BattlerAI): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }

        
    }

}