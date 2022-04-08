import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import hw4_scene from "./hw4_scene";
import { CANVAS_SIZE } from "../constants";
import UIElement from "../../Wolfie2D/Nodes/UIElement";

const PADDING = 100;
const PassiveGrey = new Color(196, 196, 196);
const ActiveGrey = new Color(229, 229, 229);

export default class MainMenu extends Scene {
    // Layers, for multiple main menu screens
    private main: Layer;
    private chapter: Layer;
    private control: Layer;
    private help: Layer; 
    loadScene() {
        this.load.image("background", "xeno_assets/images/background.png")
        this.load.image("leftclick", "xeno_assets/images/light/Mouse_Left_key_Light.png")
        this.load.image("ESC", "xeno_assets/images/light/Esc_Key_Light.png")
        this.load.image("semicolon", "xeno_assets/images/light/Semicolon_Key_Light.png")
        this.load.image("quote", "xeno_assets/images/light/Quote_Key_Light.png")
    }

    startScene() {
        const center = this.viewport.getCenter();

        // The main menu
        this.main = this.addUILayer("main");
        this.control = this.addUILayer("control");
        this.help = this.addUILayer("help");
        this.chapter = this.addUILayer("chapter");

        this.control.setHidden(true);
        this.help.setHidden(true);
        this.chapter.setHidden(true);

        this.receiver.subscribe('main');
        this.receiver.subscribe('control');
        this.receiver.subscribe('help');
        this.receiver.subscribe('chapter');

        const mainBackground = this.add.sprite("background", "main");
        mainBackground.position.copy(center); 
        const controlBackground = this.add.sprite("background", "control");
        controlBackground.position.copy(center); 
        const helpBackground = this.add.sprite("background", "help");
        helpBackground.position.copy(center); 
        const chapterBackground = this.add.sprite("background", "chapter");
        chapterBackground.position.copy(center); 

        
        const titlePosition = { x: CANVAS_SIZE.x / 4, y: 2 * PADDING }

        /* ------------------------------- MAIN LAYER ------------------------------ */
        const mainTitleLine = <Label>this.add.uiElement(UIElementType.LABEL, "main", { position: new Vec2(titlePosition.x, titlePosition.y), text: "XENO" })
        mainTitleLine.textColor = Color.BLACK;
        mainTitleLine.fontSize = 78;

        const chapterBtn = this.add.uiElement(UIElementType.BUTTON, "main", { position: new Vec2(CANVAS_SIZE.x * 0.75, 4 * PADDING), text: 'CHAPTER' });
        chapterBtn.borderColor = chapterBtn.backgroundColor = PassiveGrey;
        chapterBtn.size.set(200, 50);
        chapterBtn.onClickEventId = "chapter"; 

        const controlBtn = this.add.uiElement(UIElementType.BUTTON, "main", { position: new Vec2(CANVAS_SIZE.x * 0.75, 5 * PADDING), text: 'CONTROL' });
        controlBtn.borderColor = controlBtn.backgroundColor = PassiveGrey;
        controlBtn.size.set(200, 50);
        controlBtn.onClickEventId = "control"; 

        const helpBtn = this.add.uiElement(UIElementType.BUTTON, "main", { position: new Vec2(CANVAS_SIZE.x * 0.75, 6 * PADDING), text: 'HELP' });
        helpBtn.borderColor = helpBtn.backgroundColor = PassiveGrey;
        helpBtn.size.set(200, 50);
        helpBtn.onClickEventId = "help"; 

        /* ------------------------------ CHAPTER LAYER ----------------------------- */

        /* ------------------------------ CONTROL LAYER ----------------------------- */
        const controlTitleLine = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(titlePosition.x, titlePosition.y), text: "COTNROL" })
        controlTitleLine.textColor = Color.BLACK;
        controlTitleLine.fontSize = 78;

        const leftclick = this.add.sprite("leftclick", "control");
        leftclick.position = new Vec2(titlePosition.x, 4 * PADDING);

        const leftclickLine1 = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.55, 4 * PADDING), text: 'Leftclick to interact with the in game UI.' })
        leftclickLine1.backgroundColor = leftclickLine1.borderColor = Color.TRANSPARENT;
        leftclickLine1.fontSize = 40;
        leftclickLine1.textColor = Color.BLACK; 

        const leftclickLine2 = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 4.5 * PADDING), text: 'Click on existing turrets/walls/traps to upgrade them.' })
        leftclickLine2.backgroundColor = leftclickLine2.borderColor = Color.TRANSPARENT;
        leftclickLine2.fontSize = 40;
        leftclickLine2.textColor = Color.BLACK; 
        
        const ESC = this.add.sprite("ESC", "control");
        ESC.position = new Vec2(titlePosition.x, 6 * PADDING);
        const ESCLine = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 6 * PADDING), text: 'Pause the game while in game and acess the pause menu' });
        ESCLine.backgroundColor = ESCLine.borderColor = Color.TRANSPARENT;
        ESCLine.fontSize = 40;
        ESCLine.textColor = Color.BLACK; 

        const controlBackBtn = this.add.uiElement(UIElementType.BUTTON, "control", { position: new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING), text: 'BACK' });
        controlBackBtn.borderColor = controlBackBtn.backgroundColor = ActiveGrey; 
        controlBackBtn.size.set(200, 50);
        controlBackBtn.onClickEventId = "main";


        /* ------------------------------- HELP LAYER ------------------------------- */
        const helpTitleLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(titlePosition.x, titlePosition.y), text: "HELP" })
        helpTitleLine.textColor = Color.BLACK;
        helpTitleLine.fontSize = 78;
        
        const helpDeveLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { postion: new Vec2(center.x, 2 * PADDING), text: "This game is developed by Chencheng Yang, Hongcheng Li, and xxx"});

        const helpStoryLine1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { postion: new Vec2(center.x, 3 * PADDING), text: "Your are part of the intergalactic explorers, \"Xeno\"."});
        const helpStoryLine2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { postion: new Vec2(center.x, 4 * PADDING), text: "Utilize your resource to build up a fortress and defend against the vicious UMAs"});
        const helpStoryLine3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { postion: new Vec2(center.x, 5 * PADDING), text: "Don't let your guard down or you will be eaten alive "});

        const semicolon = this.add.sprite("semicolon", "help");
        semicolon.position = new Vec2(titlePosition.x, 6 * PADDING);
        const semicolonLine = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 6 * PADDING), text: 'Infinite Money' });
        semicolonLine.backgroundColor = semicolonLine.borderColor = Color.TRANSPARENT;
        semicolonLine.fontSize = 40;
        semicolonLine.textColor = Color.BLACK; 

        const quote = this.add.sprite("quote", "help");
        quote.position = new Vec2(titlePosition.x, 7 * PADDING);
        const quoteLine = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 7 * PADDING), text: 'Infinite Health' });
        quoteLine.backgroundColor = quoteLine.borderColor = Color.TRANSPARENT;
        quoteLine.fontSize = 40;
        quoteLine.textColor = Color.BLACK; 


        const helpBackBtn = this.add.uiElement(UIElementType.BUTTON, "help", { position: new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING), text: 'BACK' });
        helpBackBtn.borderColor = helpBackBtn.backgroundColor = ActiveGrey; 
        helpBackBtn.size.set(200, 50);
        helpBackBtn.onClickEventId = "main";


    }

    updateScene() {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            console.log(event);

            switch(event.type) {
                case "main":
                    this.switchScene('main')
                    break;
                case "chapter":
                    this.switchScene('chapter')
                    break;
                case "control":
                    this.switchScene('control')
                    break;
                case "help":
                    this.switchScene('help')
                    break;
            }
        }
    }

    switchScene(name: string) {
        const names = ['main', 'control', 'help', 'chapter'];
        names.forEach((e) => {
            if (e === name) {
                this.getLayer(e).setHidden(false);
            } else {
                this.getLayer(e).setHidden(true);
            }
        })
    }


}