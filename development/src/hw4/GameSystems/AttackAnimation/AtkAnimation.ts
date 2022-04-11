import Scene from "../../../Wolfie2D/Scene/Scene";

export default abstract class AtkAnimation {

    abstract doAnimation(...args: any): void;

    abstract createRequiredAssets(scene: Scene): Array<any>;

}