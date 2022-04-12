import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import BattlerAI from "../AI/BattlerAI";
import { XENO_ATKER_TYPE } from "../constants";
import { EffectData } from "./Attack/internal";
import { AcidEffect } from "./Effect/AcidEffect";
import { Effect } from "./Effect/Effect";
import { FireEffect } from "./Effect/FireEffec";
import { SlowEffect } from "./Effect/SlowEffect";

export default class BattleManager {

    turrets: Array<AnimatedSprite>
    walls: Array<AnimatedSprite>
    enemies: Array<AnimatedSprite>

    handlePointAtk(to: BattlerAI, dmg: number, effects: EffectData) {
        to.damage(dmg);
        BattleManager.addEffects(effects, to);
    }

    handleAOEAtk(from: Vec2, r: number, dmg: number, effects: EffectData, atkerType: XENO_ATKER_TYPE) {
        const r2 = r * r;
        switch (atkerType) {
            case XENO_ATKER_TYPE.ENEMY:
                this.turrets
                    .filter((t) => from.distanceSqTo(t.position) <= r2)
                    .forEach((t) => {
                        const target = t.ai as BattlerAI;
                        target.damage(dmg);
                        BattleManager.addEffects(effects, target);
                    })
                this.walls
                    .filter((w) => from.distanceSqTo(w.position) <= r2)
                    .forEach((w) => {
                        const target = w.ai as BattlerAI;
                        target.damage(dmg);
                        BattleManager.addEffects(effects, target);
                    })
                break;
            case XENO_ATKER_TYPE.FRIEND:
                this.enemies
                    .filter((e) => from.distanceSqTo(e.position) <= r2)
                    .forEach((e) => {
                        const target = e.ai as BattlerAI;
                        target.damage(dmg);
                        BattleManager.addEffects(effects, target);
                    })
        }
    }

    private static addEffects(data: EffectData, target: BattlerAI) {
        if (data.fire) {
            target.addEffect(new FireEffect(data.fire.duration, data.fire.ticks, target));
        }
        if (data.slow) {
            target.addEffect(new SlowEffect(data.slow.duration, data.slow.percent, target));
        }
        if (data.acid) {
            target.addEffect(new AcidEffect(data.acid.duration, data.acid.reduction, target));
        }
    }

}