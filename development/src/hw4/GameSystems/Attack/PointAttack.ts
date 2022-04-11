import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECTS } from "../../constants";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import { AcidEffect } from "../Effect/AcidEffect";
import { Effect } from "../Effect/Effect";
import { FireEffect } from "../Effect/FireEffec";
import { SlowEffect } from "../Effect/SlowEffect";
import { effectsData } from "./internal";


export default class PointAttack {
    
    assets: Array<any>;
    
    damage: number; 
    
    cooldownTimer: Timer;
    
    effects: effectsData
    
    emitter: Emitter;

    atkAnimation: AtkAnimation;

    constructor(damage: number, cooldown: number, atkAnimation: AtkAnimation, effects: XENO_EFFECTS) {
        this.damage = damage;
        this.cooldownTimer = new Timer(cooldown);
        this.emitter = new Emitter(); 
        this.atkAnimation = atkAnimation;
    }

    attack(from: BattlerAI, to: BattlerAI, direction: Vec2): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }

        this.assets = this.atkAnimation.createRequiredAssets();

        this.atkAnimation.doAnimation(from.owner.position, to.owner.position, this.assets[0]);

        to.damage(this.damage);

        if (this.effects.fire) {
            to.addEffect(new FireEffect(this.effects.fire.duration, this.effects.fire.ticks, to)); 
        }

        if (this.effects.slow) {
            to.addEffect(new SlowEffect(this.effects.slow.duration, this.effects.slow.percent, to));
        }

        if (this.effects.acid) {
            to.addEffect(new AcidEffect(this.effects.acid.duration, this.effects.acid.reduction, to));
        }  
    }
  
}