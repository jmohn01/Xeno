import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BattlerAI from "../AI/BattlerAI";
import { XENO_ACTOR_TYPE } from "../constants";
import xeno_level from "../Scenes/xeno_level";
import { EffectData } from "./Attack/internal";
import { AcidEffect } from "./Effect/AcidEffect";
import { Effect } from "./Effect/Effect";
import { FireEffect } from "./Effect/FireEffec";
import { SlowEffect } from "./Effect/SlowEffect";

export default class BattleManager {

    private level: xeno_level;

    constructor(level: xeno_level) {
        this.level = level;
    }

    handlePointAtk(to: BattlerAI, dmg: number, effects: EffectData) {
        to.damage(dmg);
        BattleManager.addEffects(effects, to);
    }

    handleAOEAtk(from: Vec2, r: number, dmg: number, effects: EffectData, atkerType: XENO_ACTOR_TYPE) {
        const r2 = r * r;
        let targets: BattlerAI[];
        switch (atkerType) {
            case XENO_ACTOR_TYPE.ENEMY:
                targets = this.level.findFriendsInRange(from, r);
                break;
            case XENO_ACTOR_TYPE.FRIEND:
                targets = this.level.findEnemiesInRange(from, r);
                break;
        }
        targets.forEach((e) => {
            BattleManager.addEffects(effects, e);
            e.damage(dmg);
        })
    }

    private static addEffects(data: EffectData, target: BattlerAI) {
        if (data.fire) {
            console.log(target.owner.id);
            target.addEffect(new FireEffect(data.fire.duration, data.fire.ticks, data.fire.damage, target));
        }
        if (data.slow) {
            target.addEffect(new SlowEffect(data.slow.duration, data.slow.percent, target));
        }
        if (data.acid) {
            target.addEffect(new AcidEffect(data.acid.duration, data.acid.reduction, target));
        }
    }

}