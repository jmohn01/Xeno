import Emitter from "../../../Wolfie2D/Events/Emitter";
import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE } from "../../constants";

export abstract class Effect<T> {

    id: number = Math.floor(Date.now() + Math.random()); 

    duration: number; 
    
    target: BattlerAI; 

    type: XENO_EFFECT_TYPE;

    abstract applyEffect(): void;

    abstract endEffect(): void;

    abstract refreshEffect(): void;
    
    abstract isActive(): boolean; 

    abstract equal(e: T): boolean;

    abstract pause(): void;

    abstract resume(): void;
}


