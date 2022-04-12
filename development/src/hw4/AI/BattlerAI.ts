import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { Effect } from "../GameSystems/Effect/Effect";

export default interface BattlerAI extends AI {

    owner: GameNode;

    health: number;

    speed: number;

    armor: number;

    effects: Array<Effect<any>>

    atkEffect: EffectData

    atk: PointAttack | AOEAttack

    damage(damage: number): void;

    addEffect(effect: Effect<any>): void;
}