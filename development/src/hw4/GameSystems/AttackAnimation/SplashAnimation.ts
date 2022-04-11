import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../../Wolfie2D/Nodes/Graphics/Line";
import Point from "../../../Wolfie2D/Nodes/Graphics/Point";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import { XENO_EVENTS } from "../../constants";
import AtkAnimation from "./AtkAnimation";

const circleDir = [
    Vec2.DOWN,
    Vec2.UP,
    Vec2.LEFT,
    Vec2.RIGHT,
    new Vec2(Math.sqrt(2) / 2, Math.sqrt(2) / 2),
    new Vec2(-Math.sqrt(2) / 2, Math.sqrt(2) / 2),
    new Vec2(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2),
    new Vec2(Math.sqrt(2) / 2, -Math.sqrt(2) / 2)
]

export class SplashAnimation extends AtkAnimation {


    private color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    doAnimation(from: Vec2, r: number, lines: Line[]): void {

        for (let i = 0; i < 8; i++) {
            lines[i].start = from;
            lines[i].end = from.clone().add(circleDir[i]);
            lines[i].tweens.play("fade");
        }

    }

    createRequiredAssets(scene: Scene): Line[] {
        let lines: Line[] = [];
        for (let i = 0; i < 8; i++) {
            let line = <Line>scene.add.graphic(GraphicType.LINE, "primary", { start: new Vec2(-1, 1), end: new Vec2(-1, -1) });
            line.color = this.color;
            line.tweens.add("fade", {
                startDelay: 0,
                duration: 300,
                effects: [
                    {
                        property: TweenableProperties.alpha,
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.OUT_SINE
                    }
                ],
                onEnd: XENO_EVENTS.UNLOAD_ASSET
            });
            lines.push(line);
        }

        return lines;
    }

    clone(): AtkAnimation {
        return new SplashAnimation(this.color);
    }

}