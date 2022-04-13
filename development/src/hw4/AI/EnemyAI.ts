import Stack from "../../Wolfie2D/DataTypes/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Color from "../../Wolfie2D/Utils/Color";
import { XENO_EVENTS } from "../constants";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { SliceAnimation } from "../GameSystems/AttackAnimation/SliceAnimation";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";



export default class EnemyAI implements BattlerAI {
    level: xeno_level;

    atk: PointAttack;

    armor: number;

    effects: Effect<any>[] = [];

    atkEffect: EffectData;

    routeIndex: number = 0;

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

        this.SpawnPos = options.SpawnPos;

        this.currentPath = this.getNextPath();

        this.atk = new PointAttack(10, 300, new SliceAnimation(Color.BLACK), {}, options.battleManager);

        this.level = options.level;
    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        this.health -= damage;
        // If health goes below 0, disable AI and fire enemyDied event
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent(XENO_EVENTS.ENEMY_DIED, { owner: this.owner })
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
        const floor = this.level.getFloor();
        const rotation = Vec2.UP.angleToCCW(this.currentPath.getMoveDirection(this.owner));
        const tilePosition = floor.getColRowAt(this.owner.position);
        if ((rotation >= -0.5 && rotation < 0.7) || rotation > 5.5) {
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
        const target = this.level.findFriendAtColRow(tilePosition);
        if (!target) return false;
        this.atk.attack(this, target);
        return true;
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
        for (let i = 0; i < this.effects.length; i++) {
            const curr = this.effects[i];
            if (curr.type === effect.type && curr.isActive() && curr.equal(effect)) {
                curr.refreshEffect();
                return;
            }
        }
        this.effects.push(effect);
        effect.applyEffect();
    }

    removeEffect(id: number): void {
        this.effects = this.effects.filter((e) => e.id !== id);
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