import Emitter from "../../../Wolfie2D/Events/Emitter";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_ATKER_TYPE } from "../../constants";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import BattleManager from "../BattleManager";
import { effectsData } from "./internal";

export default class AOEAttack {

    battleManager: BattleManager
    
    assets: Array<any>;

    damage: number;

    r: number;

    effects: effectsData; 

    private cooldownTimer: Timer;

    private atkAnimation: AtkAnimation;

    constructor(damage: number, r: number, cooldown: number, atkAnimation: AtkAnimation, effects: effectsData) {
        this.damage = damage;
        this.r = r;
        this.cooldownTimer = new Timer(cooldown);
        this.atkAnimation = atkAnimation; 
    }

    attack(from: BattlerAI, atkerType: XENO_ATKER_TYPE): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }

        if (!this.assets) {
            this.assets = this.atkAnimation.createRequiredAssets(from.owner.getScene()); 
        }

        this.atkAnimation.doAnimation(from.owner.position, this.r, this.assets);

        this.battleManager.handleAOEAtk(from.owner.position, this.r, this.damage, this.effects, atkerType); 

        this.cooldownTimer.start(); 


    }

}