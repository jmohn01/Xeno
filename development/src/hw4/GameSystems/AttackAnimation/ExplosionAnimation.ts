import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import BattlerAI from "../../AI/BattlerAI";
import AtkAnimation from "./AtkAnimation";
import { BulletAnimation } from "./BulletAnimation";
import { SplashAnimation } from "./SplashAnimation";

export class ExplosionAnimation extends AtkAnimation {
    private splash: SplashAnimation;
    private bullet: BulletAnimation;
    private launchPos: Vec2;
    private explosionRange: number; 

    constructor(color: Color, launchPos: Vec2, explosionRange: number) {
        super();
        this.launchPos = launchPos;
        this.explosionRange = explosionRange;
        this.splash = new SplashAnimation(color);
        this.bullet = new BulletAnimation(color);
    }

    doAnimation(from: Vec2, assets: any[]): void {
        this.bullet.doAnimation(this.launchPos, from, assets[0]);
        assets.shift();
        this.splash.doAnimation(from, this.explosionRange, assets);
    }

    createRequiredAssets(scene: Scene): any[] {
        return [...this.bullet.createRequiredAssets(scene, 1), ...this.splash.createRequiredAssets(scene)];
    }
    
}