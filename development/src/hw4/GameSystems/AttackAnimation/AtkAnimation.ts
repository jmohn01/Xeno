import Scene from "../../../Wolfie2D/Scene/Scene";

export default abstract class AtkAnimation {

    private scence: Scene;

    abstract doAnimation(...args: any): void;

    abstract createRequiredAssets(): Array<any>;

    abstract clone(): AtkAnimation;
}