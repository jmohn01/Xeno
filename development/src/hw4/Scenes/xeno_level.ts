import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
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
import { CANVAS_SIZE, GRADE, TRAP_TYPE, TURRET_TYPE, UI_POSITIONS, WALL_TYPE, XENO_ACTOR_TYPE, XENO_COLOR, XENO_EVENTS } from "../constants";
import { EffectData } from "../GameSystems/Attack/internal";
import BattleManager from "../GameSystems/BattleManager";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import UIElement from "../../Wolfie2D/Nodes/UIElement";
import Upgradeable from "../AI/Upgradable";
import Timer from "../../Wolfie2D/Timing/Timer";

export type LevelState = {
    placing: TRAP_TYPE | TURRET_TYPE | 'WALL' | 'ENEMY',
    selected: BattlerAI & Upgradeable,
    gold: number,
    currentWave: number,
    maxWave: number
}

const PassiveGrey = new Color(196, 196, 196);


export default class xeno_level extends Scene {

    private state: LevelState = {
        placing: null,
        selected: null,
        gold: 0,
        currentWave: 0,
        maxWave: 0
    }

    
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

    /* ------------------------------- ENTITY DATA ------------------------------ */
    private trapData: Object;

    private wallData: Object;

    private turretData: Object;

    private enemyData: Object;

    private levelData: any;

    /* ------------------------------- UI ELEMENTS ------------------------------ */

    private errorLabel: Label;

    private selectionHighlight: AnimatedSprite;

    private costLabel: Label;

    private hpLabel: Label;

    private armorLabel: Label;

    private atkLabel: Label;

    private rangeLabel: Label;

    private fireLabel: Label;

    private slowLabel: Label;

    private acidLabel: Label;

    private goldLabel: Label;

    private waveLabel: Label;

    private selectingLable: Label;

    private placingLable: Label;


    loadScene(): void {
        this.load.tilemap("level", "xeno_assets/map/test_map.json");
        this.load.spritesheet("base", "xeno_assets/spritesheets/generator.json");
        this.load.spritesheet("walls", "xeno_assets/spritesheets/walls.json");
        this.load.spritesheet("traps", "xeno_assets/spritesheets/traps.json");
        this.load.spritesheet("turret", "xeno_assets/spritesheets/turret.json");
        this.load.spritesheet("uma", "xeno_assets/spritesheets/uma.json")
        this.load.spritesheet("slice", "hw4_assets/spritesheets/slice.json")
        this.load.spritesheet("highlight", "xeno_assets/spritesheets/highlight.json");
        this.load.image("ingame_ui", "xeno_assets/images/ingame_ui.png");
        this.load.image("cave", "xeno_assets/images/cave.png");
        this.load.object("trapData", "xeno_assets/data/trap_data.json");
        this.load.object("turretData", "xeno_assets/data/turret_data.json");
        this.load.object("wallData", "xeno_assets/data/wall_data.json");
        this.load.object("enemyData", "xeno_assets/data/enemy_data.json");
        this.load.object("levelData", "xeno_assets/data/level_data.json");
    }

    startScene(): void {

        this.initUI();
        this.initData();
        
        let tilemapLayers = this.add.tilemap("level", new Vec2(1, 1));
        
        this.floor = (tilemapLayers[1].getItems()[0] as OrthogonalTilemap);
        let tilemapSize = this.floor.size.scaled(1);
        this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);
        
        this.addLayer("primary", 10);
        
        this.placeBase(new Vec2(672, 352));
        
        this.battleManager = new BattleManager(this);
        
        this.receiver.subscribe([
            XENO_EVENTS.WALL_DIED,
            XENO_EVENTS.TURRET_DIED,
            XENO_EVENTS.ENEMY_DIED,
            XENO_EVENTS.UNLOAD_ASSET,
            XENO_EVENTS.TRIGGER_TRAP,
            XENO_EVENTS.ERROR,
        ])
        this.initLevel();
        this.updateLevelUI();
    
    }

    addLabelAt(position: Vec2, text: string, color: Color, fontSize: number): Label {
        const lb = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: position, text: text });
        lb.textColor = color;
        lb.font = 'CaveatBrush';
        lb.fontSize = fontSize;
        return lb;
    }

    initUI() {
        const center = this.viewport.getCenter();
        this.UI = this.addUILayer("UI");
        const gameUI = this.add.sprite("ingame_ui", "UI");
        gameUI.position.copy(center);

        this.goldLabel = this.addLabelAt(UI_POSITIONS.SLOT_MONEY, '0', Color.BLACK, 32);
        this.waveLabel = this.addLabelAt(UI_POSITIONS.SLOT_STATUS, '0 / 4', Color.BLACK, 32);
        this.placingLable = this.addLabelAt(UI_POSITIONS.PLACING_LABEL, 'Placing:', Color.BLACK, 32);
        this.selectingLable = this.addLabelAt(UI_POSITIONS.SELECTING_LABEL, 'Selecting:', Color.BLACK, 32);

        this.errorLabel = this.addLabelAt(UI_POSITIONS.ERROR_LABEL, '100', Color.RED, 32);

        this.costLabel = this.addLabelAt(UI_POSITIONS.COST_LABEL, '5000', XENO_COLOR.ORANGE, 32);
        this.hpLabel = this.addLabelAt(UI_POSITIONS.HP_LABEL, '100', XENO_COLOR.GREEN, 32);
        this.armorLabel = this.addLabelAt(UI_POSITIONS.ARMOR_LABEL, '100', XENO_COLOR.GREEN, 32);
        this.atkLabel = this.addLabelAt(UI_POSITIONS.ATK_LABEL, '100', XENO_COLOR.BLUE, 32);
        this.rangeLabel = this.addLabelAt(UI_POSITIONS.RANGE_LABEL, '100', XENO_COLOR.BLUE, 32);
        this.fireLabel = this.addLabelAt(UI_POSITIONS.FIRE_LABEL, '2.5/tick 4', XENO_COLOR.PURPLE, 27.4936);
        this.slowLabel = this.addLabelAt(UI_POSITIONS.SLOW_LABEL, '30% 5s', XENO_COLOR.PURPLE, 27.4936);
        this.acidLabel = this.addLabelAt(UI_POSITIONS.ACID_LABEL, '-2.5 4s', XENO_COLOR.PURPLE, 27.4936);


        this.selectionHighlight = this.add.animatedSprite("highlight", "UI");
        this.selectionHighlight.animation.playIfNotAlready("IDLE", true);
        this.updateLevelUI();
        // this.updateSelectedUI();
    }

    initData() {
        this.trapData = this.load.getObject('trapData');
        this.turretData = this.load.getObject('turretData');
        this.wallData = this.load.getObject('wallData');
        this.enemyData = this.load.getObject('enemyData');
        this.levelData = this.load.getObject('levelData')
    }

    initLevel() {
        this.levelData = this.levelData['1_1'];
        this.state.gold = this.levelData["gold"];
        this.spawns = this.levelData.spawns.map((e: {x: number, y: number}) => {
            const cave = this.add.sprite('cave', 'primary');
            cave.position = new Vec2(e.x, e.y).mult(new Vec2(32, 32));
            return cave; 
        })
        console.log(this.levelData);
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
                console.log("DEAD ENEMY: %d", deadEnemy.id);
                this.aliveEnemies = this.aliveEnemies.filter((e) => e.id != deadEnemy.id);
                this.deadEnemies.push(deadEnemy);
                break;
            case XENO_EVENTS.GAME_OVER:
                break;
            case XENO_EVENTS.TRIGGER_TRAP:

                const node = this.sceneGraph.getNode(event.data.get("node"));
                const other = this.sceneGraph.getNode(event.data.get("other"));

                const trapAI = (node.ai instanceof TrapAI ? node.ai : other.ai as TrapAI);

                trapAI.attack();
        }
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }

        if (Input.isMouseJustPressed(0)) {

            const clickPos = Input.getGlobalMousePressPosition().clone();
            console.log(clickPos);
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
            this.placingLable.text = 'Placing: ';
        }
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
                this.placeEnemey(clickColRow);
                break;
        }
        if (spawnedAI) {
            console.log(spawnedAI);
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
        //@ts-ignore
        if (this.levelData.friendAllowed.indexOf(newPlacing) === -1) {
            this.errorLabel.text = 'Technology is not unlocked!'
            this.state.placing = null;
            this.placingLable.text = 'Placing: ';
            return; 
        }
        this.errorLabel.text = '';
        this.state.placing = newPlacing;
        this.placingLable.text = `Placing: ${this.getTooltip(this.state.placing)}`
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
        console.log("UPGRADE");
        if (this.state.selected) {
            this.state.selected.upgrade();
            this.updateSelectedUI();
        }
    }

    updateSelectedUI() {
        if (!this.state.selected) {
            this.atkLabel.visible = false;
            this.hpLabel.visible = false;
            this.selectionHighlight.visible = false;
            this.selectingLable.text = 'Selecting: '; 
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
        this.atkLabel.visible = true;
        this.hpLabel.visible = true;
        this.selectionHighlight.visible = true;

        //@ts-ignore
        this.selectingLable.text = `Selecting: ${this.getTooltip(friendAI.type)}`
    }

    updateLevelUI() {
        this.goldLabel.text = `${this.state.gold}`;
        this.waveLabel.text = `${this.state.currentWave} / ${this.state.maxWave}`;
    }

    addLevelGold(inc: number) {
        this.state.gold += inc;
        this.updateLevelUI();
    }

    spawnWave() {
        this.state.currentWave++;
        if (this.state.currentWave === this.state.maxWave) {
            this.emitter.fireEvent(XENO_EVENTS.GAME_OVER, {won: true});
            return;
        }
        const spawn = () => {
            const spawnPos = this.spawns[Math.floor(Math.random() * this.spawns.length)].position;
            this.placeEnemey(this.floor.getColRowAt(spawnPos));
        }
        const spawnTimer = new Timer(1000, spawn, true);
        const waveTimer = new Timer(1000 * this.levelData.wave[this.state.currentWave])
        

    }




    isAnyOverlap(tilePosition: Vec2): AnimatedSprite | Sprite | undefined {
        return this.aliveTurrets.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveWalls.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveTraps.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveEnemies.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.spawns.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            (this.floor.getColRowAt(this.base.position).equals(tilePosition) ? this.base : undefined);
    }

    placeFriend() {
        console.log("PLACING");
    }

    placeBase(position: Vec2) {
        let base: AnimatedSprite;
        base = this.add.animatedSprite('base', 'primary');
        base.addAI(BaseAI, {
            health: 1 << 30,
            armor: 0
        });
        base.setCollisionShape(new AABB(Vec2.ZERO, base.sizeWithZoom));
        const currColRow = this.floor.getColRowAt(position);

        base.position = currColRow.clone().mult(new Vec2(32, 32));
        base.visible = true;
        base.addPhysics();
        this.base = base;
        base.animation.play("IDLE", true);
    }

    placeTrap(tilePosition: Vec2, type: TRAP_TYPE): BattlerAI & Upgradeable {
        const trap = this.add.animatedSprite('traps', 'primary');
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


        if (!wall) {
            wall = this.add.animatedSprite('walls', 'primary');
            wall.addAI(WallAI, {});
            wall.setCollisionShape(new AABB(Vec2.ZERO, wall.sizeWithZoom));
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
        turret.animation.playIfNotAlready(`${type}_IDLE`, true);

        turret.visible = true;
        turret.addPhysics();
        this.aliveTurrets.push(turret);
        return (turret.ai as BattlerAI & Upgradeable);
    }

    placeEnemey(tilePosition: Vec2) {
        console.log(`DEAD ENEMIES: ${this.deadEnemies.map((e) => e.id)}`);
        let enemy = this.deadEnemies.pop();

        if (!enemy) {
            enemy = this.add.animatedSprite("uma", "primary");
            enemy.addAI(EnemyAI, {
                health: 30,
                BasePos: this.base.position,
                SpawnPos: tilePosition.clone().mult(new Vec2(32, 32)),
                level: this,
                battleManager: this.battleManager
            });
        }
        (enemy.ai as EnemyAI).health = 30;
        enemy.animation.playIfNotAlready("IDLE", true);
        enemy.position = tilePosition.clone().mult(new Vec2(32, 32));
        enemy.visible = true;
        enemy.addPhysics();
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
        return [
            ...this.aliveWalls.filter((e) => from.distanceTo(e.position) <= range).map((e) => (e.ai as BattlerAI)),
            ...this.aliveTurrets.filter((e) => from.distanceTo(e.position) <= range).map((e) => (e.ai as BattlerAI))
        ]
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

    getTooltip(type: TURRET_TYPE | WALL_TYPE | TRAP_TYPE | 'ENEMY' | 'WALL') {
        switch (type) {
            case 'ENEMY':
                return `UMA: Most basic meele uma.`
            case 'WALL':
            case WALL_TYPE.DIRT:
                return `Dirt wall: Minecraft wall. Can't really defend. DIRT cheap.`
            case WALL_TYPE.WOOD:
                return `Wood wall: Viking technology. It seems to offer little protection.`
            case WALL_TYPE.STONE:
                return `Stone wall: Stone age! UMAs cannot get through now.`
            case WALL_TYPE.FIBER:
                return `Fiber wall: ⏃⌰⟟⟒⋏ ⏁⟒☊⊑⋏⍜⌰⍜☌⊬`
            case TRAP_TYPE.FIRE:
                return `Fire trap: BURN THEM ALIVE!`
            case TRAP_TYPE.FROST:
                return `Frost trap: Frost Nova! Lvl3 mage ability.`
            case TRAP_TYPE.NET:
                return `NET TRAP: Spiderman! Spiderman!`
            case TRAP_TYPE.ACID:
                return `Acid trap: Vat of acid is a good idea.`
            case TURRET_TYPE.BEAM:
                return `BEAM TURRET: Not bad at anything. Not good at anything either.`
            case TURRET_TYPE.ELECTRIC:
                return `ELECTRIC TURRET: Only if Tesla could see this alive.`
            case TURRET_TYPE.ROCKET:
                return `ROCKET TURRET: Bombard your enemy with rocket barrage.`
            case TURRET_TYPE.BANK:
                return `BANK: Mysterious money printing machine (literally).`
        }
    }


    getFloor() {
        return this.floor;
    }

}

