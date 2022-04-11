import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { Effect } from "./Effect";

export class FireEffect extends Effect {

    duration: number;

    damage: number;

    ticks: number; 

    private dotTimer: Timer; 

    private durationTimer: Timer; 

    constructor(duration: number, ticks: number, target: BattlerAI) {
        super(); 
        this.target = target;
        this.durationTimer = new Timer(duration, this.endEffect); 
        this.dotTimer = new Timer(duration / ticks, this.dot, true);
    }

    applyEffect(): void {
        this.dotTimer.start(); 
        this.durationTimer.start();
    }

    dot(): void {
        this.target.damage(this.damage); 
    }

    endEffect(): void {
        this.dotTimer.pause(); 
        this.durationTimer.pause(); 
        delete this.dotTimer;
        delete this.durationTimer; 
    }
}
