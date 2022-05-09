import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle"
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import TimerManager from "../../Wolfie2D/Timing/TimerManager";
import Color from "../../Wolfie2D/Utils/Color";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import BaseAI from "../AI/BaseAI";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import TrapAI from "../AI/TrapAI";
import TurretAI from "../AI/TurretAI";
import WallAI, { NEIGHBOR } from "../AI/WallAI";
import { CANVAS_SIZE, ENEMY_NAME, ENEMY_TYPE, GRADE, TRAP_TYPE, TURRET_TYPE, UI_POSITIONS, WALL_TYPE, XENO_ACTOR_TYPE, XENO_COLOR, XENO_EVENTS, XENO_LEVEL_PHYSICS_OPTIONS } from "../constants";
import { EffectData } from "../GameSystems/Attack/internal";
import BattleManager from "../GameSystems/BattleManager";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Upgradeable from "../AI/Upgradable";
import Timer from "../../Wolfie2D/Timing/Timer";
import Shape from "../../Wolfie2D/DataTypes/Shapes/Shape";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import MainMenu from "./MainMenu";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";


export type LevelState = {
    placing: TRAP_TYPE | TURRET_TYPE | 'WALL' | 'ENEMY',
    selected: BattlerAI & Upgradeable,
    gold: number,
    currentWave: number,
    maxWave: number,
    currentWaveEnemy: number,
    aliveEnemies: number,
    isPaused: boolean
}


export default class xeno_level extends Scene {

    private state: LevelState = {
        placing: null,
        selected: null,
        gold: 0,
        currentWave: 1,
        maxWave: 0,
        currentWaveEnemy: 0,
        aliveEnemies: 0,
        isPaused: false
    }

    protected level: string;

    protected nextLevel: string;

    private floor: OrthogonalTilemap;

    private base: AnimatedSprite;

    private spawns: Array<Sprite> = new Array();

    private deadWalls: Array<AnimatedSprite> = new Array();

    private deadTurrets: Array<AnimatedSprite> = new Array();

    private deadEnemies: Array<AnimatedSprite> = new Array();

    private aliveWalls: Array<AnimatedSprite> = new Array();

    private aliveTraps: Array<AnimatedSprite> = new Array();

    private aliveTurrets: Array<AnimatedSprite> = new Array();

    private aliveEnemies: Array<AnimatedSprite> = new Array();

    private battleManager: BattleManager;

    private UI: Layer;

    private waveTimer: Timer;

    private spawnTimer: Timer;

    /* ------------------------------- ENTITY DATA ------------------------------ */
    private trapData: any;

    private wallData: any;

    private turretData: any;

    private enemyData: any;

    private levelData: any;

    /* ------------------------------- UI ELEMENTS ------------------------------ */

    private primary: Layer;
    private control: Layer;
    private help: Layer;
    private menu: Layer;
    private gameover: Layer;

    private errorLabel: Label;

    private selectionHighlight: AnimatedSprite;

    private placingCostLabel: Label;

    private upgradeCostLabel: Label;

    private hpLabel: Label;

    private armorLabel: Label;

    private atkLabel: Label;

    private rangeLabel: Label;

    private fireLabel: Label;

    private slowLabel: Label;

    private acidLabel: Label;

    private goldLabel: Label;

    private waveLabel: Label;

    private selectingLabel: Label;

    private placingLabel: Label;

    private gameoverLabel: Label;
    private gameoverBtn: Button;


    loadScene(): void {
        this.load.spritesheet("base", "xeno_assets/spritesheets/generator.json");
        this.load.spritesheet("walls", "xeno_assets/spritesheets/walls.json");
        this.load.spritesheet("traps", "xeno_assets/spritesheets/traps.json");
        this.load.spritesheet("turret", "xeno_assets/spritesheets/turret.json");
        this.load.spritesheet("enemy", "xeno_assets/spritesheets/enemy.json")
        this.load.spritesheet("slice", "hw4_assets/spritesheets/slice.json")
        this.load.spritesheet("highlight", "xeno_assets/spritesheets/highlight.json");
        this.load.image("ingame_ui", "xeno_assets/images/ingame_ui.png");
        this.load.image("background", "xeno_assets/images/background.png")
        this.load.image("leftclick", "xeno_assets/images/light/mouse_left_key_light.png")
        this.load.image("ESC", "xeno_assets/images/light/esc_key_light.png")
        this.load.image("semicolon", "xeno_assets/images/light/semicolon_key_light.png")
        this.load.image("quote", "xeno_assets/images/light/quote_key_light.png")
        this.load.image("rightclick", "xeno_assets/images/light/mouse_right_key_light.png")
        this.load.image("cave", "xeno_assets/images/cave.png");
        this.load.object("trapData", "xeno_assets/data/trap_data.json");
        this.load.object("turretData", "xeno_assets/data/turret_data.json");
        this.load.object("wallData", "xeno_assets/data/wall_data.json");
        this.load.object("enemyData", "xeno_assets/data/enemy_data.json");
        this.load.object("levelData", "xeno_assets/data/level_data.json");

        this.load.audio("ACID", "xeno_assets/audio/acid.wav");
        this.load.audio("FIRE", "xeno_assets/audio/fire.wav");
        this.load.audio("FROST", "xeno_assets/audio/frost.wav");
        this.load.audio("NET", "xeno_assets/audio/net.wav");

        this.load.audio("BEAM", "xeno_assets/audio/beam.wav");
        this.load.audio("ROCKET", "xeno_assets/audio/rocket.wav");
        this.load.audio("ELECTRIC", "xeno_assets/audio/electric.wav");

        this.load.audio("takedmg", "xeno_assets/audio/takedmg.wav");
    }

    unloadScene(): void {
        this.resourceManager.keepSpritesheet("base");
        this.resourceManager.keepSpritesheet("walls");
        this.resourceManager.keepSpritesheet("traps");
        this.resourceManager.keepSpritesheet("turret");
        this.resourceManager.keepSpritesheet("enemy");
        this.resourceManager.keepSpritesheet("slice");
        this.resourceManager.keepSpritesheet("highlight");

        this.resourceManager.keepImage("background");
        this.resourceManager.keepImage("leftclick");
        this.resourceManager.keepImage("rightclick");
        this.resourceManager.keepImage("ESC");
        this.resourceManager.keepImage("semicolon");
        this.resourceManager.keepImage("quote");
        this.resourceManager.keepImage("cave");
        this.resourceManager.keepImage("ingame_ui");

        this.resourceManager.keepObject('trapData');
        this.resourceManager.keepObject('enemyData');
        this.resourceManager.keepObject('levelData');
        this.resourceManager.keepObject('turretData');
        this.resourceManager.keepObject('wallData');

        this.resourceManager.unloadAllResources();
    }

    startScene(): void {

        this.initUI();
        this.initData();
        this.initPauseMenuUI();
        this.initGameoverUI();

        let tilemapLayers = this.add.tilemap("level", new Vec2(1, 1));
        this.floor = (tilemapLayers[1].getItems()[0] as OrthogonalTilemap);
        let tilemapSize = this.floor.size.scaled(1);
        this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);

        this.primary = this.addLayer("primary", 10);

        this.placeBase(new Vec2(672, 352));

        this.battleManager = new BattleManager(this);

        this.receiver.subscribe([
            XENO_EVENTS.WALL_DIED,
            XENO_EVENTS.TURRET_DIED,
            XENO_EVENTS.ENEMY_DIED,
            XENO_EVENTS.UNLOAD_ASSET,
            XENO_EVENTS.TRIGGER_TRAP,
            XENO_EVENTS.ERROR,
            XENO_EVENTS.SPAWN_NEXT_WAVE,
            XENO_EVENTS.RESUME,
            XENO_EVENTS.GAME_OVER,
            XENO_EVENTS.NEXT_LEVEL,
            XENO_EVENTS.RETRY,
            'menu',
            'control',
            'help',
            'quit'
        ])
    }

    addLabelAt(position: Vec2, text: string, color: Color, fontSize: number, font: string = 'CaveatBrush', layer = 'UI'): Label {
        const lb = <Label>this.add.uiElement(UIElementType.LABEL, layer, { position: position, text: text });
        lb.textColor = color;
        lb.font = font;
        lb.fontSize = fontSize;
        return lb;
    }

    addBtnAt(position: Vec2, text: string, layer: string, eventId?: string): Button {
        const btn = <Button>this.add.uiElement(UIElementType.BUTTON, layer, { position: position, text: text });
        btn.borderColor = btn.backgroundColor = XENO_COLOR.PASSIVE_GREY;
        btn.size.set(200, 50);
        if (eventId) {
            btn.onClickEventId = eventId;
        }
        return btn;
    }

    initUI() {
        const center = this.viewport.getCenter();
        this.UI = this.addUILayer("UI");
        const gameUI = this.add.sprite("ingame_ui", "UI");
        gameUI.position.copy(center);

        this.goldLabel = this.addLabelAt(UI_POSITIONS.SLOT_MONEY, '0', Color.BLACK, 32);
        this.waveLabel = this.addLabelAt(UI_POSITIONS.SLOT_STATUS, '0 / 4', Color.BLACK, 32);
        this.placingLabel = this.addLabelAt(UI_POSITIONS.PLACING_LABEL, 'Placing:', Color.BLACK, 32, 'Roboto');
        this.selectingLabel = this.addLabelAt(UI_POSITIONS.SELECTING_LABEL, 'Selecting:', Color.BLACK, 32, 'Roboto');

        this.errorLabel = this.addLabelAt(UI_POSITIONS.ERROR_LABEL, '', Color.RED, 32, 'Roboto');

        this.placingCostLabel = this.addLabelAt(UI_POSITIONS.PLACING_COST_LABEL, '/', XENO_COLOR.ORANGE, 32);
        this.upgradeCostLabel = this.addLabelAt(UI_POSITIONS.UPGRADE_COST_LABEL, '/', XENO_COLOR.ORANGE, 32);
        this.hpLabel = this.addLabelAt(UI_POSITIONS.HP_LABEL, '/', XENO_COLOR.GREEN, 32);
        this.armorLabel = this.addLabelAt(UI_POSITIONS.ARMOR_LABEL, '/', XENO_COLOR.GREEN, 32);
        this.atkLabel = this.addLabelAt(UI_POSITIONS.ATK_LABEL, '/', XENO_COLOR.BLUE, 32);
        this.rangeLabel = this.addLabelAt(UI_POSITIONS.RANGE_LABEL, '/', XENO_COLOR.BLUE, 32);
        this.fireLabel = this.addLabelAt(UI_POSITIONS.FIRE_LABEL, '/', XENO_COLOR.PURPLE, 27.4936);
        this.slowLabel = this.addLabelAt(UI_POSITIONS.SLOW_LABEL, '/', XENO_COLOR.PURPLE, 27.4936);
        this.acidLabel = this.addLabelAt(UI_POSITIONS.ACID_LABEL, '/', XENO_COLOR.PURPLE, 27.4936);


        this.selectionHighlight = this.add.animatedSprite("highlight", "UI");
        this.selectionHighlight.animation.playIfNotAlready("IDLE", true);
        this.selectionHighlight.visible = false;
        this.updateLevelUI();
        this.updateSelectedUI();
    }

    initPauseMenuUI() {
        const center = this.viewport.getCenter();
        const PADDING = 100;
        const titlePos = new Vec2(CANVAS_SIZE.x / 4, 2 * PADDING);
        const backPos = new Vec2(CANVAS_SIZE.x * 0.9, 8 * PADDING);
        this.menu = this.addUILayer("menu");
        this.control = this.addUILayer("control");
        this.help = this.addUILayer("help");

        this.menu.setHidden(true);
        this.control.setHidden(true);
        this.help.setHidden(true);

        this.add.sprite("background", "menu").position.copy(center);
        this.add.sprite("background", "control").position.copy(center);
        this.add.sprite("background", "help").position.copy(center);

        /* ---------------------------------- MENU LAYER ---------------------------------- */
        this.addBtnAt(new Vec2(center.x, PADDING * 3), "CONTROL", "menu", "control");
        this.addBtnAt(new Vec2(center.x, PADDING * 4), "HELP", "menu", "help");
        this.addBtnAt(new Vec2(center.x, PADDING * 5), "RESUME", "menu", XENO_EVENTS.RESUME);

        /* ------------------------------ CONTROL LAYER ----------------------------- */
        this.addLabelAt(titlePos.clone(), "CONTROL", Color.BLACK, 78, 'Roboto', 'control');
        this.add.sprite("leftclick", "control").position = new Vec2(titlePos.x, 4 * PADDING);
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.55, 4 * PADDING),
            'Lefclick to interact with the in game UI',
            Color.BLACK,
            40,
            'Roboto',
            'control'
        );
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.6, 4.5 * PADDING),
            'Click on existing turrets/walls/traps to upgrade them.',
            Color.BLACK,
            40,
            'Roboto',
            'control'
        );

        this.add.sprite("rightclick", "control").position = new Vec2(titlePos.x, 5.5 * PADDING);
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.6, 5.5 * PADDING),
            'Rightclick to clear out select & placing',
            Color.BLACK,
            40,
            'Roboto',
            'control'
        );

        this.add.sprite("ESC", "control").position = new Vec2(titlePos.x, 7 * PADDING);
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.6, 7 * PADDING),
            'Pause the game while in game and acess the pause menu',
            Color.BLACK,
            40,
            'Roboto',
            'control'
        );

        this.addBtnAt(
            backPos.clone(),
            'BACK',
            'control',
            'menu'
        )

        /* ------------------------------- HELP LAYER ------------------------------- */
        this.addLabelAt(
            titlePos.clone(),
            'HELP',
            Color.BLACK,
            78,
            'Roboto',
            'help'
        );
        this.addLabelAt(
            new Vec2(center.x, 3 * PADDING),
            "Xeno is developed by Chencheng Yang and Hongcheng Li",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.addLabelAt(
            new Vec2(center.x, 4 * PADDING),
            "You are part of the intergalactic explorers, \"Xeno\"",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.addLabelAt(
            new Vec2(center.x, 4.5 * PADDING),
            "Utilize your resource to build up a fortress and defend against the vicious UMAs",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.addLabelAt(
            new Vec2(center.x, 5 * PADDING),
            "Don't let your guard down or you will be eaten alive",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.add.sprite("semicolon", "help").position = new Vec2(titlePos.x, 6 * PADDING);
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.6, 6 * PADDING),
            "Infinite Money",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.add.sprite("quote", "help").position = new Vec2(titlePos.x, 7 * PADDING);
        this.addLabelAt(
            new Vec2(CANVAS_SIZE.x * 0.6, 7 * PADDING),
            "Infinite Health",
            Color.BLACK,
            40,
            'Roboto',
            'help'
        )
        this.addBtnAt(
            backPos.clone(),
            'BACK',
            'help',
            'menu'
        )
    }

    initGameoverUI() {
        const center = this.viewport.getCenter();
        const PADDING = 100;
        this.gameover = this.addUILayer('gameover');
        this.add.sprite('background', 'gameover').position = center.clone();
        this.gameoverLabel = this.addLabelAt(new Vec2(center.x, 4 * PADDING), 'Congrats! You won!', Color.BLACK, 48, 'Roboto', 'gameover');
        this.gameoverBtn = this.addBtnAt(new Vec2(center.x, 5 * PADDING), 'NEXT LEVEL', 'gameover', XENO_EVENTS.NEXT_LEVEL);
        this.addBtnAt(new Vec2(center.x, 6 * PADDING), 'QUIT', 'gameover', 'quit');
        this.gameover.setHidden(true);
    }

    initData() {
        this.trapData = this.load.getObject('trapData');
        this.turretData = this.load.getObject('turretData');
        this.wallData = this.load.getObject('wallData');
        this.enemyData = this.load.getObject('enemyData');
        this.levelData = this.load.getObject('levelData')
    }

    initLevel(lvl: string) {
        this.levelData = this.levelData[lvl];
        this.state.gold = this.levelData["gold"];
        this.spawns = this.levelData.spawns.map((e: { x: number, y: number }) => {
            const cave = this.add.sprite('cave', 'primary');
            cave.position = new Vec2(e.x, e.y).mult(new Vec2(32, 32));
            return cave;
        })
        this.state.aliveEnemies = this.levelData.waves.reduce(((acc: number, element: number[]) => acc + element.length), 0)
        this.state.maxWave = this.levelData.waves.length;
    }


    handleEvent(event: GameEvent) {
        switch (event.type) {
            case XENO_EVENTS.UNLOAD_ASSET:
                const asset = this.sceneGraph.getNode(event.data.get("node"));
                asset.destroy();
                break;
            case XENO_EVENTS.ERROR:
                this.errorLabel.setText(event.data.get("message"));
                break;
            case XENO_EVENTS.TURRET_DIED:
                const deadTurret = event.data.get('owner');
                this.aliveTurrets = this.aliveTurrets.filter((e) => e.id != deadTurret.id);
                this.deadTurrets.push(deadTurret);
                break;
            case XENO_EVENTS.WALL_DIED:
                const deadWall = event.data.get('owner');
                this.updateNeighbors(deadWall);
                this.aliveWalls = this.aliveWalls.filter((e) => e.id != deadWall.id);
                this.deadWalls.push(deadWall);
                break;
            case XENO_EVENTS.ENEMY_DIED:
                const deadEnemy = event.data.get('owner');
                const reward = event.data.get('reward');
                deadEnemy.visible = false;
                this.state.aliveEnemies--;
                this.state.gold += reward;
                if (!this.state.aliveEnemies) {
                    console.log(this.state.aliveEnemies);
                    this.emitter.fireEvent(XENO_EVENTS.GAME_OVER, { won: true });
                }
                this.deadEnemies.push(deadEnemy);
                this.updateLevelUI();
                break;
            case XENO_EVENTS.GAME_OVER:
                const won = event.data.get('won');
                if (won) {
                    if (this.level === '3_2') {
                        this.gameoverLabel.text = 'Finally, we get to return home...'
                        this.gameoverBtn.visible = false;
                    }
                    if (this.nextLevel) {
                        const unlockedLevels: any = JSON.parse(window.localStorage.getItem('unlockedLevels'));
                        unlockedLevels[this.nextLevel] = true;
                        window.localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
                    }
                    this.UI.setHidden(true);
                    this.primary.setHidden(true);
                    this.gameover.setHidden(false);
                } else {
                    this.gameoverBtn.text = 'RETRY';
                    this.gameoverBtn.onClickEventId = XENO_EVENTS.RETRY;
                    this.gameoverLabel.text = 'UMAs won... Your journey has ended'
                    this.UI.setHidden(true);
                    this.primary.setHidden(true);
                    this.gameover.setHidden(false);
                }
                break;
            case XENO_EVENTS.TRIGGER_TRAP:
                const node = this.sceneGraph.getNode(event.data.get("node"));
                const other = this.sceneGraph.getNode(event.data.get("other"));
                const trapAI = (node.ai instanceof TrapAI ? node.ai : other.ai as TrapAI);
                trapAI.attack();
                break;
            case XENO_EVENTS.SPAWN_NEXT_WAVE:
                if (this.state.currentWave === this.state.maxWave) {
                    return;
                }
                this.state.currentWaveEnemy = 0;
                this.state.currentWave++;
                this.spawnWave();
                this.updateLevelUI();
                break;
            case XENO_EVENTS.RESUME:
                this.menu.setHidden(true);
                this.control.setHidden(true);
                this.help.setHidden(true);
                this.resumeLevel();
                break;
            case 'menu':
                this.menu.setHidden(false);
                this.control.setHidden(true);
                this.help.setHidden(true);
                break;
            case 'control':
                this.menu.setHidden(true);
                this.control.setHidden(false);
                this.help.setHidden(true);
                break;
            case 'help':
                this.menu.setHidden(true);
                this.control.setHidden(true);
                this.help.setHidden(false);
                break;
            case 'quit':
                this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                this.sceneManager.changeToScene(MainMenu, {});
                break;
        }
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }

        if (!this.state.isPaused) {
            if (Input.isMouseJustPressed(0)) {

                const clickPos = Input.getGlobalMousePressPosition().clone();
                console.log(this.floor.getColRowAt(clickPos));
                if (clickPos.x < UI_POSITIONS.RIGHT_UI_BORDER) {
                    if (clickPos.y > UI_POSITIONS.BOT_UI_BORDER) {
                        if (
                            clickPos.x > UI_POSITIONS.UPGRADE_BUTTON.TOP_LEFT.x &&
                            clickPos.x < UI_POSITIONS.UPGRADE_BUTTON.BOT_RIGHT.x &&
                            clickPos.y > UI_POSITIONS.UPGRADE_BUTTON.TOP_LEFT.y &&
                            clickPos.y < UI_POSITIONS.UPGRADE_BUTTON.BOT_RIGHT.y
                        ) {
                            this.upgradeFriend();
                        }
                    } else {
                        this.mapClick(clickPos);
                    }
                } else {
                    this.rightMenuClick(clickPos);
                }

            }

            if (Input.isMouseJustPressed(2)) {
                this.state.placing = null;
                this.state.selected = null;
                this.updateSelectedUI();
                this.placingLabel.text = 'Placing: ';
            }

            if (Input.isKeyJustPressed('\'')) {
                console.log("INFINITE HEALTH");
                (this.base.ai as BattlerAI).health = 1 << 30;
            }

            if (Input.isKeyJustPressed(';')) {
                console.log("INFINITE MONEY");
                this.state.gold = 1 << 30;
                this.updateLevelUI();
            }

            if (Input.isKeyJustPressed('escape')) {
                this.pauseLevel();
            }

            if (Input.isKeyJustPressed('`')) {
                this.emitter.fireEvent(XENO_EVENTS.GAME_OVER, { won: true });
            }

            if (Input.isKeyJustPressed('2')) {
                this.emitter.fireEvent(XENO_EVENTS.GAME_OVER, { won: false });
            }
        } else {

        }

    }

    updateSelectedUI() {
        if (!this.state.selected) {
            this.selectionHighlight.visible = false;
            this.selectingLabel.text = 'Selecting: ';
            return;
        }
        const friendAI = this.state.selected;
        this.selectionHighlight.position = friendAI.owner.position;
        this.hpLabel.text = friendAI.health ? friendAI.health.toString() : '/';
        this.armorLabel.text = friendAI.armor ? friendAI.armor.toString() : '/';
        this.atkLabel.text = friendAI.atk ? friendAI.atk.damage.toString() : '/';
        this.rangeLabel.text = friendAI.range ? friendAI.range.toString() : '/';

        const atkEffect = friendAI.atk ? friendAI.atk.effects : {};
        this.fireLabel.text = atkEffect.fire ? `${atkEffect.fire.damage}/tick ${atkEffect.fire.ticks}t` : '/';
        this.slowLabel.text = atkEffect.slow ? `-${((1 - atkEffect.slow.percent) * 100).toFixed(1)}% ${atkEffect.slow.duration / 1000}s` : '/';
        this.acidLabel.text = atkEffect.acid ? `-${atkEffect.acid.reduction} ${atkEffect.acid.duration / 1000}s` : '/';
        // this.atkLabel.visible = true;
        // this.hpLabel.visible = true;
        this.selectionHighlight.visible = true;

        console.log(friendAI);

        //@ts-ignore
        this.selectingLabel.text = `Selecting: ${this.getTooltip(friendAI.type)}`

        //@ts-ignore
        const upgradeCost = friendAI.upgradeCost;
        if (upgradeCost) {
            this.upgradeCostLabel.text = upgradeCost.toString();
        } else {
            this.upgradeCostLabel.text = '/';
        }
    }

    updatePlacingUI() {
        if (!this.state.placing) {
            this.placingCostLabel.visible = false;
            this.placingLabel.text = 'Placing: ';
            return;
        }
        this.placingLabel.text = `Placing: ${this.getTooltip(this.state.placing)}`;
        if (this.state.placing === 'WALL') {
            this.placingCostLabel.text = this.wallData.placingCost.toString();
        } else if ((<any>Object).values(TURRET_TYPE).includes(this.state.placing)) {
            this.placingCostLabel.text = this.turretData[this.state.placing].placingCost.toString();
        } else if ((<any>Object).values(TRAP_TYPE).includes(this.state.placing)) {
            this.placingCostLabel.text = this.trapData[this.state.placing].placingCost.toString();
        } else {
            this.placingCostLabel.text = '/';
        }
        this.placingCostLabel.visible = true;
    }

    updateLevelUI() {
        this.goldLabel.text = `${this.state.gold}`;
        this.waveLabel.text = `${this.state.currentWave} / ${this.state.maxWave}`;
    }



    mapClick(clickPos: Vec2) {
        const clickColRow = this.floor.getColRowAt(clickPos.add(new Vec2(16, 16)));
        console.log("Tile Pos: %d, %d", clickColRow.x, clickColRow.y);
        if (this.isAnyOverlap(clickColRow.clone())) {
            this.selectFriend(clickColRow);
            this.updateSelectedUI();
            if (this.state.placing)
                this.emitter.fireEvent(XENO_EVENTS.ERROR, { message: 'SPACE OCCUPIED' });
            return;
        }
        this.state.selected = null;
        this.updateSelectedUI();

        let spawnedAI: BattlerAI & Upgradeable;
        let placingCost = parseInt(this.placingCostLabel.text);
        if (placingCost && placingCost > this.state.gold) {
            this.errorLabel.text = 'Not enough money!'
            return;

        }
        switch (this.state.placing) {
            case TRAP_TYPE.ACID:
            case TRAP_TYPE.NET:
            case TRAP_TYPE.FIRE:
            case TRAP_TYPE.FROST:
                spawnedAI = this.placeTrap(clickColRow, this.state.placing);
                break;
            case TURRET_TYPE.BANK:
            case TURRET_TYPE.BEAM:
            case TURRET_TYPE.ELECTRIC:
            case TURRET_TYPE.ROCKET:
                spawnedAI = this.placeTurret(clickColRow, this.state.placing);
                break;
            case 'WALL':
                spawnedAI = this.placeWall(clickColRow);
                break;
            case 'ENEMY':
                this.placeEnemy(clickColRow, ENEMY_TYPE.BASIC);
                break;
        }
        if (spawnedAI) {
            console.log(spawnedAI);
            if (placingCost) {
                this.state.gold -= placingCost;
                this.updateLevelUI();
            }
            this.state.selected = spawnedAI;
            this.updateSelectedUI();
        }

    }

    rightMenuClick(clickPos: Vec2) {
        let newPlacing: TRAP_TYPE | TURRET_TYPE | 'WALL' | 'ENEMY';
        if (clickPos.x < 1500 && clickPos.x > 1410) {
            if (clickPos.y < 270 && clickPos.y > 170) {
                newPlacing = 'WALL';
            }
            else if (clickPos.y < 400 && clickPos.y > 300) {
                newPlacing = TURRET_TYPE.ELECTRIC;
            }
            else if (clickPos.y < 520 && clickPos.y > 420) {
                newPlacing = TURRET_TYPE.BANK;
            }
            else if (clickPos.y < 650 && clickPos.y > 540) {
                newPlacing = TRAP_TYPE.FIRE;
            }
            else if (clickPos.y < 780 && clickPos.y > 680) {
                newPlacing = TRAP_TYPE.ACID;
            }
            else if (clickPos.y < 880 && clickPos.y > 820) {
                console.log("1,6 Pause");
            }
        }
        else if (clickPos.x < 1600 && clickPos.x > 1510) {
            if (clickPos.y < 270 && clickPos.y > 170) {
                newPlacing = TURRET_TYPE.BEAM;
            }
            else if (clickPos.y < 400 && clickPos.y > 300) {
                newPlacing = TURRET_TYPE.ROCKET;
            }
            else if (clickPos.y < 520 && clickPos.y > 420) {
                newPlacing = 'ENEMY';
            }
            else if (clickPos.y < 650 && clickPos.y > 540) {
                newPlacing = TRAP_TYPE.FROST;
            }
            else if (clickPos.y < 780 && clickPos.y > 680) {
                newPlacing = TRAP_TYPE.NET;
            }
            else if (clickPos.y < 880 && clickPos.y > 820) {
                console.log("2,6 Speed Up");
            }
        }

        if (this.levelData.friendAllowed.indexOf(newPlacing) === -1) {
            this.errorLabel.text = 'Technology is not unlocked!'
            this.state.placing = null;
            this.updatePlacingUI();
            return;
        }
        this.errorLabel.text = '';
        this.state.placing = newPlacing;
        this.updatePlacingUI();
    }

    pauseLevel() {
        this.state.isPaused = true;
        this.waveTimer.pause();
        this.spawnTimer.pause();
        this.primary.setHidden(true);
        this.UI.setHidden(true);
        this.menu.setHidden(false);
    }

    resumeLevel() {
        this.state.isPaused = false;
        this.spawnTimer.resume();
        this.waveTimer.resume();
        this.primary.setHidden(false);
        this.UI.setHidden(false);
        this.menu.setHidden(true);
    }

    isPaused() {
        return this.state.isPaused;
    }

    selectFriend(tilePosition: Vec2) {
        const friend = this.isAnyOverlap(tilePosition);
        console.log(friend);
        if (!friend) {
            this.state.selected = null;
            return;
        }
        const friendAI = (friend.ai as BattlerAI & Upgradeable);
        this.state.selected = friendAI;
        this.atkLabel.visible = true;
        this.hpLabel.visible = true;
        this.selectionHighlight.visible = true;
    }

    upgradeFriend() {
        if (this.state.selected) {
            const cost = this.state.selected.upgradeCost;
            if (cost && cost > this.state.gold) {
                this.errorLabel.text = 'Error: Not enough money';
                return;
            }
            if (cost) 
                this.state.gold -= cost; 
            this.state.selected.upgrade();
            this.updateSelectedUI();
            this.updateLevelUI();
        }
    }


    addLevelGold(inc: number) {
        this.state.gold += inc;
        this.updateLevelUI();
    }

    spawnWave() {
        console.log("WAVE: ", this.state.currentWave);
        const spawnEnemy = () => {
            const enemyType = this.levelData.waves[this.state.currentWave - 1][this.state.currentWaveEnemy];
            console.log(`SPAWNED ${ENEMY_NAME[enemyType]}, currentWaveEnemy: ${this.state.currentWaveEnemy}`);
            if (enemyType) {
                const spawnPos = this.spawns[Math.floor(Math.random() * this.spawns.length)].position;
                this.placeEnemy(this.floor.getColRowAt(spawnPos), enemyType);
                this.state.currentWaveEnemy++;
            }
        }
        this.spawnTimer = new Timer(1000, spawnEnemy, true);
        const stopTimer = () => {
            console.log("STOPPED");
            this.spawnTimer.pause();
            setTimeout(() => {
                console.log("FIRED");
                this.emitter.fireEvent(XENO_EVENTS.SPAWN_NEXT_WAVE);
            }, 5000)
        }
        this.waveTimer = new Timer(1000 * this.levelData.waves[this.state.currentWave - 1].length + 100, stopTimer);
        this.spawnTimer.start();
        this.waveTimer.start();
    }



    isAnyOverlap(tilePosition: Vec2): AnimatedSprite | Sprite | undefined {
        return this.aliveTurrets.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveWalls.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveTraps.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveEnemies.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.spawns.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            (this.floor.getColRowAt(this.base.position).equals(tilePosition) ? this.base : undefined);
    }

    placeBase(position: Vec2) {
        let base: AnimatedSprite;
        base = this.add.animatedSprite('base', 'primary');
        base.addAI(BaseAI, {
            // @ts-ignore
            health: this.levelData[this.level]['baseHP'],
            // @ts-ignore
            armor: this.levelData[this.level]['baseArmor']
        });
        const currColRow = this.floor.getColRowAt(position);

        base.position = currColRow.clone().mult(new Vec2(32, 32));
        base.visible = true;
        base.addPhysics();
        this.base = base;
        base.animation.play("IDLE", true);
    }

    placeTrap(tilePosition: Vec2, type: TRAP_TYPE): BattlerAI & Upgradeable {
        const trap = this.add.animatedSprite('traps', 'primary');
        this.emitter.fireEvent(XENO_EVENTS.PLACED);
        //@ts-ignore
        trap.addAI(TrapAI, {
            // @ts-ignore
            ...this.trapData[type].BRONZE,
            grade: GRADE.BRONZE,
            level: this,
            type: type,
            battleManager: this.battleManager
        })
        trap.animation.playIfNotAlready(`${GRADE.BRONZE}_${type}`, true);
        trap.position = tilePosition.mult(new Vec2(32, 32));
        trap.visible = true;
        trap.addPhysics(undefined, undefined, false, true);
        trap.setGroup(XENO_ACTOR_TYPE.TRAP);
        trap.setTrigger(XENO_ACTOR_TYPE.ENEMY, XENO_EVENTS.TRIGGER_TRAP, null);
        this.aliveTraps.push(trap);
        return (trap.ai as BattlerAI & Upgradeable);
    }

    placeWall(tilePosition: Vec2): BattlerAI & Upgradeable {
        let wall: AnimatedSprite = this.deadWalls.pop();
        this.emitter.fireEvent(XENO_EVENTS.PLACED);

        if (!wall) {
            wall = this.add.animatedSprite('walls', 'primary');
            wall.addAI(WallAI, {});
        }

        let leftTile: AnimatedSprite = null, rightTile: AnimatedSprite = null, topTile: AnimatedSprite = null, botTile: AnimatedSprite = null;
        const leftTileColRow = tilePosition.clone().add(new Vec2(-1, 0));
        const rightTileColRow = tilePosition.clone().add(new Vec2(1, 0));
        const botTileColRow = tilePosition.clone().add(new Vec2(0, 1));
        const topTileColRow = tilePosition.clone().add(new Vec2(0, -1));

        this.aliveWalls.forEach((w) => {
            if (this.floor.getColRowAt(w.position).equals(leftTileColRow)) {
                leftTile = w;
                (leftTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.RIGHT);
                console.log(`LEFT TILE FOUND: ${leftTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(rightTileColRow)) {
                rightTile = w;
                (rightTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.LEFT);
                console.log(`RIGHT TILE FOUND: ${rightTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(botTileColRow)) {
                botTile = w;
                (botTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.TOP);
                console.log(`BOT TILE FOUND: ${botTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(topTileColRow)) {
                topTile = w;
                (topTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.BOT);
                console.log(`TOP TILE FOUND: ${topTile}`);
            }
        })

        wall.ai.initializeAI(wall, {
            //@ts-ignore
            ...this.wallData['DIRT'],
            level: this,
            type: WALL_TYPE.DIRT,
            leftTile: leftTile,
            rightTile: rightTile,
            botTile: botTile,
            topTile: topTile
        })

        wall.position = tilePosition.mult(new Vec2(32, 32));
        wall.visible = true;
        wall.addPhysics();
        this.aliveWalls.push(wall);
        return (wall.ai as BattlerAI & Upgradeable);
    }

    placeTurret(tilePosition: Vec2, type: TURRET_TYPE): BattlerAI & Upgradeable {
        let turret = this.deadTurrets.pop();
        this.emitter.fireEvent(XENO_EVENTS.PLACED);
        // Have to initialize the turret's position before intializing AI for explosion animation.
        if (!turret) {
            turret = this.add.animatedSprite("turret", "primary");
            turret.position = tilePosition.mult(new Vec2(32, 32));
            turret.addAI(
                TurretAI,
                {
                    //@ts-ignore
                    ...this.turretData[type].BRONZE,
                    level: this,
                    battleManager: this.battleManager,
                    type: type
                });
        } else {
            turret.position = tilePosition.mult(new Vec2(32, 32));
            turret.ai.initializeAI(turret, {
                //@ts-ignore
                ...this.turretData[type].BRONZE,
                level: this,
                battleManager: this.battleManager,
                type: type
            });
            turret.setAIActive(true, {});
        }

        turret.animation.playIfNotAlready(`BRONZE_${type}_IDLE`, true);

        turret.visible = true;
        turret.addPhysics();
        this.aliveTurrets.push(turret);
        return (turret.ai as BattlerAI & Upgradeable);
    }

    placeEnemy(tilePosition: Vec2, type: ENEMY_TYPE) {
        console.log(`DEAD ENEMIES: ${this.deadEnemies.map((e) => e.id)}`);
        let enemy = this.deadEnemies.pop();
        console.log(ENEMY_NAME[type]);
        if (!enemy) {
            enemy = this.add.animatedSprite("enemy", "primary");
            enemy.addAI(EnemyAI, {
                ...this.getEnemyData(type),
                basePos: this.base.position,
                spawnPos: tilePosition.clone().mult(new Vec2(32, 32)),
                level: this,
                battleManager: this.battleManager,
                type: type
            });
        } else {
            (enemy.ai as EnemyAI).setNewStats(this.getEnemyData(type));
        }

        enemy.animation.playIfNotAlready(`${ENEMY_NAME[type]}_MOVE`, true);
        enemy.position = tilePosition.clone().mult(new Vec2(32, 32));
        enemy.visible = true;
        let collisioncircle: Circle = new Circle(enemy.position, 8);
        enemy.addPhysics(collisioncircle);
        enemy.setGroup(XENO_ACTOR_TYPE.ENEMY);
        enemy.setAIActive(true, {});
        this.aliveEnemies.push(enemy);
        console.log(`ALIVE ENEMIES: ${this.aliveEnemies.map((e) => e.id)}`);
    }

    updateNeighbors(wall: AnimatedSprite) {
        const wallAI = wall.ai as WallAI;
        console.log(wallAI.neighboringWall);
        wallAI.neighboringWall.forEach((w, i) => {
            if (w) {
                let dir = 0;
                switch (i) {
                    case NEIGHBOR.LEFT:
                    case NEIGHBOR.TOP:
                        dir = i + 1;
                        break;
                    case NEIGHBOR.BOT:
                    case NEIGHBOR.RIGHT:
                        dir = i - 1;
                        break;
                }
                (w.ai as WallAI).delNeighbor(dir);
            }
        })

    }

    findEnemyInRange(from: Vec2, range: number): BattlerAI | undefined {
        if (!this.aliveEnemies.length) return undefined;

        for (let i = 0; i < this.aliveEnemies.length; i++) {
            if (from.distanceTo(this.aliveEnemies[i].position) < range) {
                return (this.aliveEnemies[i].ai as BattlerAI);
            }
        }
    }

    findEnemiesInRange(from: Vec2, range: number): BattlerAI[] {
        return this.aliveEnemies.filter((e) => from.distanceTo(e.position) <= range).map((e) => (e.ai as BattlerAI));
    }

    findFriendsInRange(from: Vec2, range: number): BattlerAI[] {
        if (from.distanceTo(this.base.position) <= range) return [(this.base.ai as BattlerAI)];
        else {
            return [

                ...this.aliveWalls.filter((e) => from.distanceTo(e.position) <= range).map((e) => (e.ai as BattlerAI)),
                ...this.aliveTurrets.filter((e) => from.distanceTo(e.position) <= range).map((e) => (e.ai as BattlerAI))
            ]
        }
    }

    findFriendAtColRow(colRow: Vec2): BattlerAI | undefined {
        if (this.floor.getColRowAt(this.base.position).equals(colRow))
            return this.base.ai as BattlerAI;
        for (let i = 0; i < this.aliveTurrets.length; i++) {
            const curr = this.aliveTurrets[i];
            if (this.floor.getColRowAt(curr.position).equals(colRow))
                return curr.ai as BattlerAI;
        }
        for (let i = 0; i < this.aliveWalls.length; i++) {
            const curr = this.aliveWalls[i];
            if (this.floor.getColRowAt(curr.position).equals(colRow))
                return curr.ai as BattlerAI;
        }
    }

    removeEnemy(id: number): void {
        this.aliveEnemies = this.aliveEnemies.filter((e) => e.id !== id);
    }

    getWallData(type: WALL_TYPE) {
        //@ts-ignore
        return this.wallData[type];
    }

    getTrapData(type: TRAP_TYPE, grade: GRADE) {
        console.log(`${grade}_${type}`);

        //@ts-ignore
        return this.trapData[type][grade];
    }

    getTurretData(type: TURRET_TYPE, grade: GRADE) {
        //@ts-ignore
        return this.turretData[type][grade];
    }

    getEnemyData(type: ENEMY_TYPE) {
        return this.enemyData[ENEMY_NAME[type]];
    }

    getTooltip(type: TURRET_TYPE | WALL_TYPE | TRAP_TYPE | ENEMY_TYPE | 'ENEMY' | 'WALL' | 'BASE' ) {
        switch (type) {
            case 'BASE':
                return 'Generator: Protect this well.'
            case ENEMY_TYPE.BASIC:
            case 'ENEMY':
                return 'BAISC UMA: Is that a purple zombie?'
            case ENEMY_TYPE.FAST:
                return 'FAST UMA: Don\'t get stung by this jellyfish'
            case ENEMY_TYPE.TANK:
                return 'TANK UNA: This is not dragon quest.'
            case 'WALL':
            case WALL_TYPE.DIRT:
                return 'Dirt wall: Minecraft wall. Can\'t really defend. DIRT cheap.'
            case WALL_TYPE.WOOD:
                return 'Wood wall: Viking technology. It seems to offer little protection.'
            case WALL_TYPE.STONE:
                return 'Stone wall: Stone age! UMAs cannot get through now.'
            case WALL_TYPE.FIBER:
                return 'Fiber wall: ⏃⌰⟟⟒⋏ ⏁⟒☊⊑⋏⍜⌰⍜☌⊬'
            case TRAP_TYPE.FIRE:
                return 'Fire trap: BURN THEM ALIVE!'
            case TRAP_TYPE.FROST:
                return 'Frost trap: Frost Nova! Lvl3 mage ability.'
            case TRAP_TYPE.NET:
                return 'NET TRAP: Spiderman! Spiderman!'
            case TRAP_TYPE.ACID:
                return 'Acid trap: Vat of acid is a good idea.'
            case TURRET_TYPE.BEAM:
                return 'BEAM TURRET: Not bad at anything. Not good at anything either.'
            case TURRET_TYPE.ELECTRIC:
                return 'ELECTRIC TURRET: Only if Tesla could see this alive.'
            case TURRET_TYPE.ROCKET:
                return 'ROCKET TURRET: Bombard your enemy with rocket barrage.'
            case TURRET_TYPE.BANK:
                return 'BANK: Mysterious money printing machine (literally).'
                
        }
    }

    getFloor() {
        return this.floor;
    }

    getBounds() {
        return {
            top: 0,
            left: 0,
            bot: 22,
            right: 44
        }
    }

}

