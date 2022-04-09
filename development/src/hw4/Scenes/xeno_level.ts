import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Scene from "../../Wolfie2D/Scene/Scene";
import { TRAP_TYPE, XENO_EVENTS } from "../constants";

export default class xeno_level extends Scene {

    private floor: OrthogonalTilemap;

    private walls: Array<AnimatedSprite> = new Array();

    private traps: Array<AnimatedSprite> = new Array();

    private turrets: Array<AnimatedSprite> = new Array();

    private aliveWalls: Array<AnimatedSprite> = new Array();

    private aliveTraps: Array<AnimatedSprite> = new Array();

    private aliveTurrets: Array<AnimatedSprite> = new Array();

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

        console.log(this.viewport.getCenter());
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
        }

        if (Input.isMouseJustPressed(0)) {
            this.placeWall(Input.getGlobalMousePressPosition());
        }
    }

    isAnyOverlap(position: Vec2): boolean {
        const tilePosition = this.floor.getColRowAt(position);
        return this.aliveTurrets.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveWalls.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveTraps.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition));
    }


    placeTrap(position: Vec2, type: TRAP_TYPE) {
        console.log(this.floor.getTileSize());
        console.log(this.floor.getColRowAt(position));

        let trap = null;
        for (let t of this.traps) {
            if (!t.visible) {
                trap = t;
                break;
            }
        }

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
        let wall = null;
        for (let w of this.walls) {
            if (!w.visible) {
                wall = w;
                break;
            }
        }

        if (!wall) {
            wall = this.add.animatedSprite('walls', 'primary');
            wall.setCollisionShape(new AABB(Vec2.ZERO, wall.sizeWithZoom));
        }

        let leftTile = null, rightTile = null, topTile = null, botTile = null;
        const leftTileColRow = this.floor.getColRowAt(position.add(new Vec2(-32, 0)));
        const rightTileColRow = this.floor.getColRowAt(position.add(new Vec2(32, 0)));
        const botTileColRow = this.floor.getColRowAt(position.add(new Vec2(0, 32)));
        const topTileColRow = this.floor.getColRowAt(position.add(new Vec2(0, -32)));

        this.aliveWalls.forEach((w) => {
            if (this.floor.getColRowAt(w.position).equals(leftTileColRow))
                leftTile = w;
            if (this.floor.getColRowAt(w.position).equals(rightTileColRow))
                rightTile = w;
            if (this.floor.getColRowAt(w.position).equals(botTileColRow))
                botTile = w;
            if (this.floor.getColRowAt(w.position).equals(topTileColRow))
                topTile = w;
        })

        const shape = this.getWallShape(leftTile, rightTile, botTile, topTile);
        wall.animation.playIfNotAlready(`DIRT_${shape}`, true);
        wall.position = this.floor.getColRowAt(position.add(new Vec2(16, 16))).mult(new Vec2(32, 32));
        console.log(wall.position);

        wall.visible = true;
        this.aliveWalls.push(wall);
    }

    getWallShape(left: AnimatedSprite, right: AnimatedSprite, bot: AnimatedSprite, top: AnimatedSprite): string {
        if (left && right && bot && top)
            return 'CROSSROAD';

        if (left && right && bot && !top)
            return 'BTRI'

        if (left && right && !bot && top)
            return 'TTRI'

        if (left && !right && bot && top)
            return 'LTRI'

        if (!left && right && bot && top)
            return 'RTRI'

        if (left && right && !bot && !top)
            return 'HORIZONTAL'

        if (!left && !right && bot && top)
            return 'VERTICAL'

        if (left && !right && bot && !top)
            return 'LBTURN'

        if (!left && right && bot && !top)
            return 'RBTURN'

        if (!left &&!right && !bot && top)
            return 'RTTURN'

        if (left && right && !bot && top)
            return 'LTTURN'

        return 'HORIZONTAL'
    }










}