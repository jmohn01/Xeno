import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import TimerManager from "../../Wolfie2D/Timing/TimerManager";
import WallAI, { NEIGHBOR } from "../AI/WallAI";
import { TRAP_TYPE, XENO_EVENTS } from "../constants";


export default class xeno_level extends Scene {

    private floor: OrthogonalTilemap;

    private deadWalls: Array<AnimatedSprite> = new Array();

    private deadTraps: Array<AnimatedSprite> = new Array();

    private deadTurrets: Array<AnimatedSprite> = new Array();

    private aliveWalls: Array<AnimatedSprite> = new Array();

    private aliveTraps: Array<AnimatedSprite> = new Array();

    private aliveTurrets: Array<AnimatedSprite> = new Array();
    
    private timerManager: TimerManager = TimerManager.getInstance(); 

    private UI: Layer; 

    loadScene(): void {

        this.load.tilemap("level", "xeno_assets/map/test_map.json");

        this.load.spritesheet("walls", "xeno_assets/spritesheets/walls.json");
        this.load.spritesheet("traps", "xeno_assets/spritesheets/traps.json");
        this.load.spritesheet("UNA","xeno_assets/spritesheets/UMA.json");
        this.load.image("Drawing", "xeno_assets/images/Drawing.png");
    }

    startScene(): void {
        const Slot1 =  new Vec2(1455, 210);
        const Slot2 =  new Vec2(1555, 210);
        const Slot3 =  new Vec2(1455, 340);
        const Slot4 = new Vec2(1555, 340);
        const Slot5 = new Vec2(1455, 460);
        const Slot6 =  new Vec2(1555, 460);
        const Slot7 =  new Vec2(1455, 590);
        const Slot8 =  new Vec2(1555, 590);
        const Slot9 =  new Vec2(1455, 710);
        const Slot10 =  new Vec2(1555, 710);
        const SlotMoney =  new Vec2(1500, 40);
        const SlotStatus =  new Vec2(1460, 120);
        const center = this.viewport.getCenter();

        let tilemapLayers = this.add.tilemap("level", new Vec2(1, 1));
        
        this.UI = this.addUILayer("UI");
        const Drawing = this.add.sprite("Drawing", "UI");
        Drawing.position.copy(center); 
        const MoneyLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: SlotMoney, text: "00000"});
        const StatusLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", {position: SlotStatus, text: "Status"});
        this.floor = (tilemapLayers[1].getItems()[0] as OrthogonalTilemap);
        let tilemapSize = this.floor.size.scaled(1);
        this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);

        this.addLayer("primary", 10);

        this.viewport.setZoomLevel(1);

    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
        }

        if (Input.isMouseJustPressed(0) && Input.getGlobalMousePressPosition().clone().x<1388) {
            this.placeWall(Input.getGlobalMousePressPosition().clone());
        }
        else if(Input.isMouseJustPressed(0)){
            const clickPos = Input.getGlobalMousePressPosition().clone()
            console.log(clickPos);
            if(clickPos.x<1500 && clickPos.x>1410){
                if (clickPos.y<270 && clickPos.y>170) {
                    console.log("1,1 SLOT1");
                }
                else if(clickPos.y<400 && clickPos.y>300){
                    console.log("1,2 SLOT3");
                }
                else if(clickPos.y<520 && clickPos.y>420){
                    console.log("1,3 SLOT5");
                }
                else if(clickPos.y<650 && clickPos.y>540){
                    console.log("1,4 SLOT7");
                }
                else if(clickPos.y<780 && clickPos.y>680){
                    console.log("1,5 SLOT9");
                }
                else if(clickPos.y<880 && clickPos.y>820){
                    console.log("1,6 Pause");
                }
            }
            else if(clickPos.x<1600 && clickPos.x>1510){
                if (clickPos.y<270 && clickPos.y>170) {
                    console.log("2,1 SLOT2");
                }
                else if(clickPos.y<400 && clickPos.y>300){
                    console.log("2,2 SLOT4");
                }
                else if(clickPos.y<520 && clickPos.y>420){
                    console.log("2,3 SLOT6");
                }
                else if(clickPos.y<650 && clickPos.y>540){
                    console.log("2,4 SLOT8");
                }
                else if(clickPos.y<780 && clickPos.y>680){
                    console.log("2,5 SLOT10");
                }
                else if(clickPos.y<880 && clickPos.y>820){
                    console.log("2,6 Speed Up");
                }
            }
        }
    }

    isAnyOverlap(position: Vec2): boolean {
        const tilePosition = this.floor.getColRowAt(position);
        return this.aliveTurrets.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveWalls.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveTraps.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition));
    }


    placeTrap(position: Vec2, type: TRAP_TYPE) {
        let trap: AnimatedSprite = this.deadTraps.pop(); 

        if (!trap) {
            trap = this.add.animatedSprite('traps', 'primary');
            trap.setCollisionShape(new AABB(Vec2.ZERO, trap.sizeWithZoom));
        }
        trap.animation.playIfNotAlready('BRONZE_FROST', true);
        trap.position = this.floor.getColRowAt(position.add(new Vec2(16, 16))).mult(new Vec2(32, 32));

        trap.visible = true;
        this.aliveTraps.push(trap);
    }

    placeWall(position: Vec2) {
        let wall: AnimatedSprite = this.deadWalls.pop();

        if (!wall) {
            wall = this.add.animatedSprite('walls', 'primary');
            wall.ai = new WallAI();
            wall.setCollisionShape(new AABB(Vec2.ZERO, wall.sizeWithZoom));
        }

        let leftTile: AnimatedSprite = null, rightTile: AnimatedSprite = null, topTile: AnimatedSprite = null, botTile: AnimatedSprite = null;
        position.add(new Vec2(16, 16));
        const currColRow = this.floor.getColRowAt(position);
        const leftTileColRow = currColRow.clone().add(new Vec2(-1, 0));
        const rightTileColRow = currColRow.clone().add(new Vec2(1, 0));
        const botTileColRow = currColRow.clone().add(new Vec2(0, 1));
        const topTileColRow = currColRow.clone().add(new Vec2(0, -1));

        console.log(`Curr: ${currColRow}`);
        console.log(`Left: ${leftTileColRow}`);
        console.log(`Right: ${rightTileColRow}`);
        console.log(`Bot: ${botTileColRow}`);
        console.log(`Top: ${topTileColRow}`);

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
            leftTile: leftTile,
            rightTile: rightTile,
            botTile: botTile,
            topTile: topTile
        })


        wall.position = currColRow.clone().mult(new Vec2(32, 32));

        wall.visible = true;
        this.aliveWalls.push(wall);
    }












}