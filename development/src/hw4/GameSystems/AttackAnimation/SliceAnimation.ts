import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import AtkAnimation from "./AtkAnimation";

export class SliceAnimation extends AtkAnimation {


    private color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    doAnimation(from: Vec2, direction: Vec2, sliceSprite: AnimatedSprite, rotation: number): void {

        // sliceSprite.rotation = rotation;

        sliceSprite.position = from.clone().add(new Vec2(16, 16));

        sliceSprite.animation.play("SLICE");
        sliceSprite.animation.queue("NORMAL", true);

    }

    createRequiredAssets(scene: Scene): [AnimatedSprite] {
        let slice = scene.add.animatedSprite("slice", "primary");
        slice.animation.play("NORMAL", true);
        return [slice];
    }

    clone(): AtkAnimation {
        return new SliceAnimation(this.color);
    }

}