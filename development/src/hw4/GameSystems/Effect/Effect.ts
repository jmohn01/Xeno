import AnimatedSprite from "../../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";

export abstract class Effect {

    duration: number; 
    
    target: BattlerAI; 

    abstract applyEffect(): void;

    abstract endEffect(): void;
}


