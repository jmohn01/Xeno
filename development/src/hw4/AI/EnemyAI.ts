import GoapActionPlanner from "../../Wolfie2D/AI/GoapActionPlanner";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import StateMachineGoapAI from "../../Wolfie2D/AI/StateMachineGoapAI";
import GoapAction from "../../Wolfie2D/DataTypes/Interfaces/GoapAction";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Stack from "../../Wolfie2D/DataTypes/Stack";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import { hw4_Events, hw4_Names, hw4_Statuses } from "../hw4_constants";
import BattlerAI from "./BattlerAI";

import { EffectData } from "../GameSystems/Attack/internal";
import { Effect } from "../GameSystems/Effect/Effect";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import PointAttack from "../GameSystems/Attack/PointAttack";
import Emitter from "../../Wolfie2D/Events/Emitter";
import { SliceAnimation } from "../GameSystems/AttackAnimation/SliceAnimation";
import Color from "../../Wolfie2D/Utils/Color";


export default class EnemyAI implements BattlerAI {

    atk: PointAttack;

    armor: number;

    effects: Effect<any>[];

    atkEffect: EffectData;

    routeIndex: number = 0;

    aliveTurrets: Array<AnimatedSprite>;
    
    floor: OrthogonalTilemap;

    emitter: Emitter = new Emitter();

    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The total possible amount of health this entity has */
    maxHealth: number;

    /** The current amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    // The current known position of the player
    BasePos: Vec2;
    SpawnPos: Vec2;

    aliveWalls: Array<AnimatedSprite>;

    // Attack range
    inRange: number;

    // Path to player
    path: Array<Vec2> = [];

    currentPath: NavigationPath;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.maxHealth = options.health;

        this.health = options.health;

        this.BasePos = options.BasePos;

        this.SpawnPos=options.SpawnPos;

        this.aliveWalls = options.aliveWalls;

        this.aliveTurrets = options.aliveTurrets;

        this.floor = options.floor;

        this.currentPath = this.getNextPath();

        this.atk = new PointAttack(10, 300, new SliceAnimation(Color.BLACK), {}, options.battleManager);

    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        this.health -= damage;
        // If health goes below 0, disable AI and fire enemyDied event
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent("enemyDied", { owner: this.owner })
        }
    }

    moveOnePath(deltaT: number): void {
        if (this.currentPath.isDone()) {
            this.currentPath = this.getNextPath();
        } else {
            if (this.atkIfPathBlocked()) {
                return;
            }
            else {
                this.owner.moveOnPath(this.speed * deltaT, this.currentPath);
            }
        }
    }

    getNextPath(): NavigationPath {
        let stack = new Stack<Vec2>();
        this.findPath();
        stack.push(this.path[this.routeIndex]);
        let path = new NavigationPath(stack);
        this.routeIndex = this.routeIndex + 1;
        return path;
    }

    atkIfPathBlocked(): boolean {
        const rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
        const tilePosition = this.floor.getColRowAt(this.owner.position);
        console.log(rotation);
        if ((rotation >= -0.5 && rotation < 0.7) || rotation>5.5) {
           tilePosition.add(new Vec2(0, -1));
        }
        else if (rotation > 0.9 && rotation < 2.3) {
           tilePosition.add(new Vec2(-1, 0))
        }
        else if (rotation > 2.4 && rotation < 3.8) {
  
        tilePosition.add(new Vec2(0, 1));
        }
        else if (rotation > 4 && rotation < 5.4) {
         tilePosition.add(new Vec2(1, 0));
        }
        else {
            console.log("Moving in impossible ways");
            return false;
        }
        if (this.aliveTurrets.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition))) {
            this.atk.attack(this, this.aliveTurrets.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)).ai as BattlerAI);
        }
        else if (this.aliveWalls.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition))) {
            this.atk.attack(this, this.aliveWalls.find((e) => this.floor.getColRowAt(e.position).equals(tilePosition)).ai as BattlerAI);
        }
        else {
            return false;
        }
    }

    findPath() {
        const turnpoint = new Vec2(this.SpawnPos.x, this.BasePos.y);
        this.path.push(turnpoint.clone());
        this.path.push(this.BasePos.clone())
        return;
    }

    update(deltaT: number) {
        if (!this.path.length) {
            this.findPath();
        }
        else {
            this.moveOnePath(deltaT);
        }
    }

    addEffect(effect: Effect<any>): void {
        throw new Error("Method not implemented.");
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }
    handleEvent(event: GameEvent): void {
        throw new Error("Method not implemented.");
    }
}

export enum EnemyStates {
    DEFAULT = "default"
}