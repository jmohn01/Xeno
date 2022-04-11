import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE } from "../../constants";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import BattleManager from "../BattleManager";
import { AcidEffect } from "../Effect/AcidEffect";
import { Effect } from "../Effect/Effect";
import { FireEffect } from "../Effect/FireEffec";
import { SlowEffect } from "../Effect/SlowEffect";
import { EffectData } from "./internal";


export default class PointAttack {

    battleManager: BattleManager

    assets: Array<any>;

    damage: number;

    cooldownTimer: Timer;

    effects: EffectData

    atkAnimation: AtkAnimation;

    constructor(damage: number, cooldown: number, atkAnimation: AtkAnimation, effects: EffectData) {
        this.effects = effects;
        this.damage = damage;
        this.cooldownTimer = new Timer(cooldown);
        this.atkAnimation = atkAnimation;
    }

    attack(from: BattlerAI, to: BattlerAI): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }
        this.assets = this.atkAnimation.createRequiredAssets(from.owner.getScene());
        this.atkAnimation.doAnimation(from.owner.position, to.owner.position, this.assets[0]);

        this.battleManager.handlePointAtk(to, this.damage, this.effects); 

        this.cooldownTimer.start(); 
    }

}