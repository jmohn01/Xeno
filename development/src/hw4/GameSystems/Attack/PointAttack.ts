import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE } from "../../constants";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import { BulletAnimation } from "../AttackAnimation/BulletAnimation";
import { SliceAnimation } from "../AttackAnimation/SliceAnimation";
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

    soundKey: string;

    emitter: Emitter = new Emitter();

    constructor(damage: number, cooldown: number, atkAnimation: AtkAnimation, effects: EffectData, battleManager: BattleManager, soundKey?: string) {
        this.effects = effects;
        this.damage = damage;
        this.cooldownTimer = new Timer(cooldown);
        this.atkAnimation = atkAnimation;
        this.battleManager = battleManager;
        this.soundKey = soundKey; 
    }

    isPaused() {
        return this.cooldownTimer.isPaused(); 
    }

    pauseCD() {
        this.cooldownTimer.pause(); 
    }

    resumeCD() {
        this.cooldownTimer.resume();
    }

    attack(from: BattlerAI, to: BattlerAI): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }
        this.assets = this.atkAnimation.createRequiredAssets(from.owner.getScene(), 1);

        if (this.atkAnimation instanceof BulletAnimation) {
            this.atkAnimation.doAnimation(from.owner.position, to.owner.position, this.assets[0]);
        } else if (this.atkAnimation instanceof SliceAnimation) {
            this.atkAnimation.doAnimation(from.owner.position, from.owner.position.dirTo(to.owner.position), this.assets[0], from.owner.rotation);
        }

        this.battleManager.handlePointAtk(to, this.damage, this.effects); 

        if (this.soundKey) {
            this.emitter.fireEvent(GameEventType.PLAY_SFX, {key: this.soundKey, loop: false, holdReference: false });
        }

        this.cooldownTimer.start(); 
    }

}