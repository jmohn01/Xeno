import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import { Effect } from "../GameSystems/Effect/Effect";

export default interface BattlerAI extends AI {
    owner: GameNode;

    health: number;

    speed: number;

    armor: number;

    effectArray: Array<Effect>

    damage: (damage: number) => void;

    addEffect: (effect: Effect) => void;
}