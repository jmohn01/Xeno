import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../Wolfie2D/Scene/Scene";
import TimerManager from "../../Wolfie2D/Timing/TimerManager";
import WallAI, { NEIGHBOR } from "../AI/wallAI";
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

    

    loadScene(): void {

        this.load.tilemap("level", "xeno_assets/map/test_map.json");

        this.load.spritesheet("walls", "xeno_assets/spritesheets/walls.json");
        this.load.spritesheet("traps", "xeno_assets/spritesheets/traps.json");

    }

    startScene(): void {
        let tilemapLayers = this.add.tilemap("level", new Vec2(1, 1));



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

        if (Input.isMouseJustPressed(0)) {
            this.placeWall(Input.getGlobalMousePressPosition().clone().add(new Vec2(16, 16)));
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