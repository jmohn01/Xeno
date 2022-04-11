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
import Weapon from "../GameSystems/items/Weapon";
import { hw4_Events, hw4_Names, hw4_Statuses } from "../hw4_constants";
import BattlerAI from "./BattlerAI";
import Alert from "./EnemyStates/Alert";
import Active from "./EnemyStates/Active";
import Guard from "./EnemyStates/Guard";
import Patrol from "./EnemyStates/Patrol";
import { EffectData } from "../GameSystems/Attack/internal";
import { Effect } from "../GameSystems/Effect/Effect";
import AttackAction from "./EnemyActions/AttackAction";


export default class EnemyAI extends StateMachineGoapAI implements BattlerAI {
    armor: number;
    effects: Effect<any>[];
    atkEffect: EffectData;
    routeIndex: number;
    addEffect(effect: Effect<any>): void {
        throw new Error("Method not implemented.");
    }
    /** The owner of this AI */
    owner: AnimatedSprite;

    /** The total possible amount of health this entity has */
    maxHealth: number;

    /** The current amount of health this entity has */
    health: number;

    /** The default movement speed of this AI */
    speed: number = 20;

    /** The weapon this AI has */
    weapon: Weapon;

    // The current known position of the player
    BasePos: Vec2;

    aliveWalls: Array<AnimatedSprite>;

    // Attack range
    inRange: number;

    // Path to player
    Path: Array<Vec2>;

    currentPath: NavigationPath;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.maxHealth = options.health;

        this.health = options.health;

        this.weapon = options.weapon;

        this.BasePos = options.BasePos;

        this.inRange = options.inRange;

        this.aliveWalls = options.aliveWalls;

        // Initialize to the default state
        this.initialize(EnemyStates.DEFAULT);
    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        this.health -= damage;
        // If health goes below 0, disable AI and fire enemyDied event
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent("enemyDied", {enemy: this.owner})
        }
    }

    moveonepath(deltaT: number):void{
        if(this.currentPath.isDone()){
            this.currentPath = this.getNextPath();
        } else {
            if(this.attackifpathblocked()){
                return;
            }
            else{
                this.owner.moveOnPath(this.speed * deltaT, this.currentPath);
                this.owner.rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
            }
        }
    }

    getNextPath(): NavigationPath {
        let path = this.owner.getScene().getNavigationManager().getPath(hw4_Names.NAVMESH, this.owner.position, this.Path[this.routeIndex]);
        this.routeIndex = (this.routeIndex + 1)%this.Path.length;
        return path;
    }

    attackifpathblocked(): boolean{
        const rotation =Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
        if(rotation<0.7 || rotation>5.6){

        }
        else if(rotation>0.9 || rotation<2.3){

        }
        else if(rotation>2.4 || rotation<3.8){

        }
        else if(rotation>4 || rotation<5.4){

        }
        else{
            console.log("Moving in impossible ways");
            return false;
        }
    }

    update(deltaT: number){
        super.update(deltaT);
        if(!this.Path){
            this.findpath();
        }
        else{
            this.moveonepath(deltaT);
        }
    }
}

export enum EnemyStates {
    DEFAULT = "default"
}