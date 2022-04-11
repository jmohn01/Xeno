import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import AtkAnimation from "./AtkAnimation";

export class SpliceAnimation extends AtkAnimation {


    private color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    doAnimation(from: Vec2, rotation: number, direction: Vec2, sliceSprite: AnimatedSprite): void {

        sliceSprite.rotation = rotation;

        sliceSprite.position = from.clone().add(direction.scaled(16));

        sliceSprite.animation.play("SLICE");
        sliceSprite.animation.queue("NORMAL", true);

    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let slice = scene.add.animatedSprite("slice", "primary");
        slice.animation.play("NORMAL", true);

        return [slice];
    }

    clone(): AtkAnimation {
        return new SpliceAnimation(this.color);
    }

}