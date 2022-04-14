import Scene from "../../../Wolfie2D/Scene/Scene";
import BattlerAI from "../../AI/BattlerAI";

export default abstract class AtkAnimation {

    abstract doAnimation(...args: any): void;

    abstract createRequiredAssets(scene: Scene, count: number): Array<any>;

}