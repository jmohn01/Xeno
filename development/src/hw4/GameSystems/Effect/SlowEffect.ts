import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { Effect } from "./Effect";

export class SlowEffect extends Effect {

    duration: number;

    private percent: number; 

    private dotTimer: Timer; 

    private durationTimer: Timer; 

    constructor(duration: number, percent: number, target: BattlerAI) {
        super(); 
        this.target = target;
        this.durationTimer = new Timer(duration, this.dotTimer.pause); 
    }

    applyEffect(): void { 
        this.target.speed *= this.percent;
        this.durationTimer.start();
    }

    endEffect(): void {
        this.target.speed /= this.percent;
        this.durationTimer.pause(); 
        delete this.durationTimer; 
    }
}
