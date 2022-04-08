import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";

const COLOR_SALMON = new Color(250, 128, 114);

export default class SplashScreen extends Scene {
    private splashScreen: Layer;

    loadScene(): void {
        this.load.image("logo", "xeno_assets/images/logo.png");
    }

    unloadScene(): void {
        this.resourceManager.unloadAllResources(); 
    }

    startScene(): void {
        this.splashScreen = this.addUILayer("splashScreen");

        // Add logo
        const center = this.viewport.getCenter();

        const logo = this.add.sprite("logo", "splashScreen");
        
        const startText = "Press Leftclick To Start"
        const startLine = <Label>this.add.uiElement(UIElementType.LABEL, "splashScreen", { position: new Vec2(center.x, center.y + 400), text: startText });
        // Salmon 
        startLine.textColor = COLOR_SALMON;
        startLine.fontSize = 64;
        
        logo.position.copy(center);
    }

    updateScene(deltaT: number): void {
        if (Input.isMouseJustPressed(0)) {
            this.sceneManager.changeToScene(MainMenu, {}); 
        }
    }
}