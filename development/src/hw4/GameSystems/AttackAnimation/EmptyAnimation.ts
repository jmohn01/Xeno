import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import AtkAnimation from "./AtkAnimation";
import { BulletAnimation } from "./BulletAnimation";
import { SplashAnimation } from "./SplashAnimation";

export class EmptyAnimation extends AtkAnimation {
    constructor() {
        super();
    }

    doAnimation(from: Vec2, assets: any[]): void {
    }

    createRequiredAssets(scene: Scene): any[] {
        return undefined; 
    }
    
}