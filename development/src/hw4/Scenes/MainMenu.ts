import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { CANVAS_SIZE, XENO_COLOR, XENO_LEVEL_PHYSICS_OPTIONS } from "../constants";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import xeno_level from "./xeno_level";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import level_1_1 from "./levels/level_1_1";
import level_1_2 from "./levels/level_1_2";
import level_2_1 from "./levels/level_2_1";
import level_2_2 from "./levels/level_2_2";
import level_3_1 from "./levels/level_3_1";
import level_3_2 from "./levels/level_3_2";
import Input from "../../Wolfie2D/Input/Input";

const PADDING = 100;


export default class MainMenu extends Scene {
    // Layers, for multiple main menu screens
    private main: Layer;
    private chapter: Layer;
    private control: Layer;
    private help: Layer;

    private unlockedLevels: any;

    loadScene() {
        this.load.audio("music", "xeno_assets/audio/menu.mp3")
        this.load.image("background", "xeno_assets/images/background.png")
        this.load.image("leftclick", "xeno_assets/images/light/mouse_left_key_light.png")
        this.load.image("ESC", "xeno_assets/images/light/esc_key_light.png")
        this.load.image("semicolon", "xeno_assets/images/light/semicolon_key_light.png")
        this.load.image("quote", "xeno_assets/images/light/quote_key_light.png")
        this.load.image("rightclick", "xeno_assets/images/light/mouse_right_key_light.png")
        this.load.image("tilda", "xeno_assets/images/light/tilda_key_light.png")
    }

    unloadScene() {
        this.resourceManager.keepImage("background");
        this.resourceManager.keepImage("leftclick");
        this.resourceManager.keepImage("rightclick");
        this.resourceManager.keepImage("ESC");
        this.resourceManager.keepImage("semicolon");
        this.resourceManager.keepImage("quote");
        this.resourceManager.keepImage("tilda");
    }

    startScene() {
        const center = this.viewport.getCenter();
        this.unlockedLevels = window.localStorage.getItem('unlockedLevels');
        if (!this.unlockedLevels) {
            this.unlockedLevels = {
                '1_1': true,
                '1_2': false,
                '2_1': false,
                '2_2': false,
                '3_1': false,
                '3_2': false
            }
            window.localStorage.setItem(
                'unlockedLevels',
                JSON.stringify(
                    this.unlockedLevels
                ));
        } else {
            this.unlockedLevels = JSON.parse(this.unlockedLevels);
        }

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

        this.receiver.subscribe('chapter1_1');
        this.receiver.subscribe('chapter1_2');
        this.receiver.subscribe('chapter2_1');
        this.receiver.subscribe('chapter2_2');
        this.receiver.subscribe('chapter3_1');
        this.receiver.subscribe('chapter3_2');

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
        chapterBtn.borderColor = chapterBtn.backgroundColor = XENO_COLOR.PASSIVE_GREY;
        chapterBtn.size.set(200, 50);
        chapterBtn.onClickEventId = "chapter";

        const controlBtn = this.add.uiElement(UIElementType.BUTTON, "main", { position: new Vec2(CANVAS_SIZE.x * 0.75, 5 * PADDING), text: 'CONTROL' });
        controlBtn.borderColor = controlBtn.backgroundColor = XENO_COLOR.PASSIVE_GREY;
        controlBtn.size.set(200, 50);
        controlBtn.onClickEventId = "control";

        const helpBtn = this.add.uiElement(UIElementType.BUTTON, "main", { position: new Vec2(CANVAS_SIZE.x * 0.75, 6 * PADDING), text: 'HELP' });
        helpBtn.borderColor = helpBtn.backgroundColor = XENO_COLOR.PASSIVE_GREY;
        helpBtn.size.set(200, 50);
        helpBtn.onClickEventId = "help";

        /* ------------------------------ CHAPTER LAYER ----------------------------- */
        const chapterTitleLine = <Label>this.add.uiElement(UIElementType.LABEL, "chapter", { position: new Vec2(titlePosition.x, titlePosition.y), text: "CHAPTERS" })
        chapterTitleLine.textColor = Color.BLACK;
        chapterTitleLine.fontSize = 78;

        const chapter1_1Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.25, 4 * PADDING), text: '1-1' })
        const is1_1Unlocked = this.unlockedLevels['1_1'];
        chapter1_1Btn.borderColor = chapter1_1Btn.backgroundColor = this.getBtnColor(is1_1Unlocked);
        chapter1_1Btn.size.set(100, 100);
        chapter1_1Btn.onClickEventId = is1_1Unlocked ? "chapter1_1": '';
        const chapter1_2Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.25, 6 * PADDING), text: '1-2' })
        const is1_2Unlocked = this.unlockedLevels['1_2'];
        chapter1_2Btn.borderColor = chapter1_2Btn.backgroundColor = this.getBtnColor(is1_2Unlocked);
        chapter1_2Btn.size.set(100, 100);
        chapter1_2Btn.onClickEventId = is1_2Unlocked ? "chapter1_2": '';
        const chapter2_1Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.5, 4 * PADDING), text: '2-1' })
        const is2_1Unlocked = this.unlockedLevels['2_1'];
        chapter2_1Btn.borderColor = chapter2_1Btn.backgroundColor = this.getBtnColor(is2_1Unlocked);
        chapter2_1Btn.size.set(100, 100);
        chapter2_1Btn.onClickEventId = is2_1Unlocked ? "chapter2_1": '';
        const chapter2_2Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.5, 6 * PADDING), text: '2-2' })
        const is2_2Unlocked = this.unlockedLevels['2_2'];
        chapter2_2Btn.borderColor = chapter2_2Btn.backgroundColor = this.getBtnColor(is2_2Unlocked);
        chapter2_2Btn.size.set(100, 100);
        chapter2_2Btn.onClickEventId = is2_2Unlocked ? "chapter2_2": '';
        const chapter3_1Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.75, 4 * PADDING), text: '3-1' })
        const is3_1Unlocked = this.unlockedLevels['3_1'];
        chapter3_1Btn.borderColor = chapter3_1Btn.backgroundColor = this.getBtnColor(is3_1Unlocked);
        chapter3_1Btn.size.set(100, 100);
        chapter3_1Btn.onClickEventId = is3_1Unlocked ? "chapter3_1": '';
        const chapter3_2Btn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.75, 6 * PADDING), text: '3-2' })
        const is3_2Unlocked = this.unlockedLevels['3_2'];
        chapter3_2Btn.borderColor = chapter3_2Btn.backgroundColor = this.getBtnColor(is3_2Unlocked);
        chapter3_2Btn.size.set(100, 100);
        chapter3_2Btn.onClickEventId = is3_2Unlocked ? "chapter3_2": '';


        const chapterBackBtn = this.add.uiElement(UIElementType.BUTTON, "chapter", { position: new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING), text: 'BACK' });
        chapterBackBtn.borderColor = chapterBackBtn.backgroundColor = XENO_COLOR.ACTIVE_GREY;
        chapterBackBtn.size.set(200, 50);
        chapterBackBtn.onClickEventId = "main";



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

        const rightclick = this.add.sprite("rightclick", "control");
        rightclick.position = new Vec2(titlePosition.x, 5.5 * PADDING);

        const rightclickLine1 = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 5.5 * PADDING), text: 'Rightclick to clear out select & placing' })
        rightclickLine1.backgroundColor = rightclickLine1.borderColor = Color.TRANSPARENT;
        rightclickLine1.fontSize = 40;
        rightclickLine1.textColor = Color.BLACK;


        const ESC = this.add.sprite("ESC", "control");
        ESC.position = new Vec2(titlePosition.x, 7 * PADDING);
        const ESCLine = <Label>this.add.uiElement(UIElementType.LABEL, "control", { position: new Vec2(CANVAS_SIZE.x * 0.6, 7 * PADDING), text: 'Pause the game while in game and acess the pause menu' });
        ESCLine.backgroundColor = ESCLine.borderColor = Color.TRANSPARENT;
        ESCLine.fontSize = 40;
        ESCLine.textColor = Color.BLACK;

        const controlBackBtn = this.add.uiElement(UIElementType.BUTTON, "control", { position: new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING), text: 'BACK' });
        controlBackBtn.borderColor = controlBackBtn.backgroundColor = XENO_COLOR.ACTIVE_GREY;
        controlBackBtn.size.set(200, 50);
        controlBackBtn.onClickEventId = "main";


        /* ------------------------------- HELP LAYER ------------------------------- */
        const helpTitleLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(titlePosition.x, titlePosition.y), text: "HELP" })
        helpTitleLine.textColor = Color.BLACK;
        helpTitleLine.fontSize = 78;

        const helpDeveLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(center.x, 3 * PADDING), text: "Xeno is developed by Chencheng Yang, Hongcheng Li, and XXX" })

        const helpStoryLine1 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(center.x, 4 * PADDING), text: "You are part of the intergalactic explorers, \"Xeno\"" });
        const helpStoryLine2 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(center.x, 4.5 * PADDING), text: "Utilize your resource to build up a fortress and defend against the vicious UMAs" });
        const helpStoryLine3 = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(center.x, 5 * PADDING), text: "Don't let your guard down or you will be eaten alive " });

        const semicolon = this.add.sprite("semicolon", "help");
        semicolon.position = new Vec2(titlePosition.x, 6 * PADDING);
        const semicolonLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(CANVAS_SIZE.x * 0.6, 6 * PADDING), text: 'Infinite Money' });
        semicolonLine.backgroundColor = semicolonLine.borderColor = Color.TRANSPARENT;
        semicolonLine.fontSize = 40;
        semicolonLine.textColor = Color.BLACK;
        const quote = this.add.sprite("quote", "help");
        quote.position = new Vec2(titlePosition.x, 7 * PADDING);
        const quoteLine = <Label>this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(CANVAS_SIZE.x * 0.6, 7 * PADDING), text: 'Infinite Health' });
        quoteLine.backgroundColor = quoteLine.borderColor = Color.TRANSPARENT;
        quoteLine.fontSize = 40;
        quoteLine.textColor = Color.BLACK;

        this.add.sprite("tilda", "help").position = new Vec2(titlePosition.x, 8 * PADDING);
        const tildaLine = <Label> this.add.uiElement(UIElementType.LABEL, "help", { position: new Vec2(CANVAS_SIZE.x * 0.6, 8 * PADDING), text: "Beat the current level"});
        tildaLine.fontSize = 40;
        tildaLine.textColor = Color.BLACK;


        const helpBackBtn = this.add.uiElement(UIElementType.BUTTON, "help", { position: new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING), text: 'BACK' });
        helpBackBtn.borderColor = helpBackBtn.backgroundColor = XENO_COLOR.ACTIVE_GREY;
        helpBackBtn.size.set(200, 50);
        helpBackBtn.onClickEventId = "main";

        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, { key: 'music', loop: true, holdReference: true });
    }

    updateScene() {
        const sceneOptions = {
            physics: XENO_LEVEL_PHYSICS_OPTIONS
        };
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();

            console.log(event);

            switch (event.type) {
                case "main":
                    this.switchLayer('main')
                    break;
                case "chapter":
                    this.switchLayer('chapter')
                    break;
                case "control":
                    this.switchLayer('control')
                    break;
                case "help":
                    this.switchLayer('help')
                    break;
                case "chapter1_1":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_1_1, {}, sceneOptions);
                    break;
                case "chapter1_2":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_1_2, {}, sceneOptions);
                    break;
                case "chapter2_1":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_2_1, {}, sceneOptions);
                    break;
                case "chapter2_2":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_2_2, {}, sceneOptions);
                    break;
                case "chapter3_1":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_3_1, {}, sceneOptions);
                    break;
                case "chapter3_2":
                    this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                    this.sceneManager.changeToScene(level_3_2, {}, sceneOptions);
                    break;
            }
        }
    }

    switchLayer(name: string) {
        const names = ['main', 'control', 'help', 'chapter'];
        names.forEach((e) => {
            if (e === name) {
                this.getLayer(e).setHidden(false);
            } else {
                this.getLayer(e).setHidden(true);
            }
        })
    }

    getBtnColor(isUnlocked: boolean) {
        return isUnlocked ? XENO_COLOR.PASSIVE_GREY : XENO_COLOR.ACTIVE_GREY;
    }


}