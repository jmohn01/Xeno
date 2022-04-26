import Stack from "../../Wolfie2D/DataTypes/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Color from "../../Wolfie2D/Utils/Color";
import { ENEMY_NAME, ENEMY_TYPE, XENO_EVENTS } from "../constants";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { EmptyAnimation } from "../GameSystems/AttackAnimation/EmptyAnimation";
import { SliceAnimation } from "../GameSystems/AttackAnimation/SliceAnimation";
import BattleManager from "../GameSystems/BattleManager";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";



export default class EnemyAI implements BattlerAI {

    range: number;
    
    level: xeno_level;

    atk: PointAttack;

    armor: number = 0;

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
    basePos: Vec2;
    spawnPos: Vec2;

    // Attack range
    inRange: number;

    // Path to player
    path: Array<Vec2> = [];

    reward: number; 

    type: ENEMY_TYPE;

    currentPath: NavigationPath;

    battleManager: BattleManager; 

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { basePos, spawnPos, battleManager, level, type } = options; 
    
        this.level = level;
        this.type = type;
        this.basePos = basePos;
        this.spawnPos = spawnPos;
        this.battleManager = battleManager; 
        this.currentPath = this.getNextPath();
        this.setNewStats(options); 
    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        if (this.health <= 0) {
            return;
        }
        console.log(damage);
        this.health -= damage;
        
        if (this.health <= 0) {
            this.effects.forEach((e) => {
                e.endEffect();
            })
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.level.removeEnemy(this.owner.id);
            this.owner.animation.play(`${ENEMY_NAME[this.type]}_DIED`);
            setTimeout(() => {
                this.emitter.fireEvent(XENO_EVENTS.ENEMY_DIED, { owner: this.owner, reward: this.reward })
            }, 250); 
        }
    }

    setNewStats(data: Record<string, any>): void {
        console.log(data);
        const { armor, health, speed, damage, cooldown, reward, atkEffect } = data;
        this.atk = new PointAttack(damage, cooldown, new EmptyAnimation(), atkEffect, this.battleManager)
        this.armor = armor;
        this.health = health;
        this.speed = speed;
        this.reward = reward; 
    }

    moveOnePath(deltaT: number): void {
        if (this.currentPath.isDone()) {
            this.currentPath = this.getNextPath();
        } else {
            if (this.atkIfPathBlocked()) {
                if (this.type !== ENEMY_TYPE.TANK)
                    this.owner.animation.playIfNotAlready(`${ENEMY_NAME[this.type]}_ATK`, true);
                return;
            }
            else {
                this.owner.animation.playIfNotAlready(`${ENEMY_NAME[this.type]}_MOVE`, true); 
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
        const turnpoint = new Vec2(this.spawnPos.x, this.basePos.y);
        this.path.push(turnpoint.clone());
        this.path.push(this.basePos.clone())
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
        console.log("ENEMY %d added Effect", this.owner.id, effect);
    }

    removeEffect(id: number): void {
        this.effects = this.effects.filter((e) => e.id !== id);
        console.log("ENEMY %d removed Effect", this.owner.id, this);
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