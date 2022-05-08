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
import Receiver from "../../Wolfie2D/Events/Receiver";

type Nodee = {
    tileposition: Vec2;
    f: number;
    g: number;
    h: number;
    prev: Nodee | null;
  };

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
    receiver: Receiver;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { basePos, spawnPos, battleManager, level, type } = options; 
    
        this.level = level;
        this.type = type;
        this.basePos = basePos;
        this.spawnPos = spawnPos;
        this.battleManager = battleManager; 
        this.currentPath = this.getNextPath(this.spawnPos);
        this.setNewStats(options); 
        this.receiver=new Receiver();
        this.receiver.subscribe([
            XENO_EVENTS.PLACED,
            XENO_EVENTS.WALL_DIED,
            XENO_EVENTS.ENEMY_DIED,
            XENO_EVENTS.TURRET_DIED
        ])
    }

    activate(options: Record<string, any>): void { }

    damage(damage: number): void {
        if (this.health <= 0) {
            return;
        }

        this.health -= ((100 - this.armor) / 100) * damage; 
        
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
            }, 400); 
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
            this.currentPath = this.getNextPath(this.owner.position);
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

    getNextPath(pos:Vec2): NavigationPath {
        let stack = new Stack<Vec2>();
        if(this.path.length==0){
            this.Pathfinding(pos);
        }
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

    
    Pathfinding(currentpos : Vec2){
        this.routeIndex=0;
        let openlist: Array<Nodee>=[];
        let closedlist: Array<Nodee>=[];
        const floor = this.level.getFloor();
        const targetnodee : Nodee = {tileposition: floor.getColRowAt(this.basePos), f: 0, g: 0, h: 0, prev: null}; 
        const startnodee : Nodee = {tileposition: floor.getColRowAt(currentpos), f: 0, g: 0, h: 0, prev: null}; 
        openlist.unshift(startnodee);
        while (openlist.length > 0){
            let currentnodee = openlist[0];
            let index=0;
            let currentindex=0;
            openlist.forEach(nodee => {
                if (nodee.f < currentnodee.f){
                    currentnodee = nodee;
                    currentindex = index;
                }
                index = index +1;
            });
            openlist.splice(currentindex,1);
            closedlist.unshift(currentnodee);
            if(currentnodee.tileposition.equals(targetnodee.tileposition)==true){
                let current = currentnodee;
                while (current){
                    this.path.unshift(current.tileposition.mult(new Vec2(32,32)));
                    current=current.prev;
                }
                console.log(this.path);
                return;
            }
            let children: Array<Nodee> = [];
            let node_position = new Vec2(currentnodee.tileposition.x,currentnodee.tileposition.y);
            if  (this.level.findFriendAtColRow(new Vec2(node_position.x+0,node_position.y-1))==null){
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x+0,node_position.y-1), f: 0, g: 0, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            else{
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x+0,node_position.y-1), f: 0, g: 50, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            if  (this.level.findFriendAtColRow(new Vec2(node_position.x+1,node_position.y-0))==null){
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x+1,node_position.y-0), f: 0, g: 0, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            else{
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x+1,node_position.y-0), f: 0, g: 50, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            if  (this.level.findFriendAtColRow(new Vec2(node_position.x-0,node_position.y+1))==null){
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x-0,node_position.y+1), f: 0, g: 0, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            else{
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x-0,node_position.y+1), f: 0, g: 50, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            if  (this.level.findFriendAtColRow(new Vec2(node_position.x-1,node_position.y+0))==null){
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x-1,node_position.y+0), f: 0, g: 0, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            else{
                let newnodee: Nodee = {tileposition: new Vec2(node_position.x-1,node_position.y+0), f: 0, g: 50, h: 0, prev: currentnodee};
                children.unshift(newnodee);
            }
            children.forEach(nodee=>{
                let flag1=0;
                closedlist.forEach(nodeee=>{
                   if(nodee.tileposition.equals(nodeee.tileposition)){
                       flag1=1;
                   } 
                });
                if(flag1==1){}
                else{
                    nodee.g = nodee.g+currentnodee.g+1;
                    nodee.h = (nodee.tileposition.x-targetnodee.tileposition.x)*(nodee.tileposition.x-targetnodee.tileposition.x) 
                    + (nodee.tileposition.y-targetnodee.tileposition.y)*(nodee.tileposition.y-targetnodee.tileposition.y);
                    nodee.f = nodee.g+nodee.h;
                    let flag2=0;
                    openlist.forEach(nodeee=>{
                        if (nodee.tileposition.equals(nodeee.tileposition) && nodee.g > nodeee.g){
                            flag2=1;
                        }
                    });
                    if(flag2==1){}
                    else{
                        openlist.unshift(nodee);
                    }
                }
            });
        }
    }

    update(deltaT: number) {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }
        this.moveOnePath(deltaT);
    }

    handleEvent(event: GameEvent) {
        this.path= [];
        this.currentPath = this.getNextPath(this.owner.position);
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
    }
}

export enum EnemyStates {
    DEFAULT = "default"
}