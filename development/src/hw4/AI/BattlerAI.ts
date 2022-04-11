import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import { EffectData } from "../GameSystems/Attack/internal";
import { Effect } from "../GameSystems/Effect/Effect";

export default interface BattlerAI extends AI {
    owner: GameNode;

    health: number;

    speed: number;

    armor: number;

    effects: Array<Effect<any>>

    atkEffect: EffectData

    damage(damage: number): void;

    addEffect(effect: Effect<any>): void;
}