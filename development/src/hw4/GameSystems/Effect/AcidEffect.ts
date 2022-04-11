import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { Effect } from "./Effect";

export class AcidEffect extends Effect {
    
    duration: number;

    reduction: number; 

    private durationTimer: Timer; 

    constructor(duration: number, reduction: number, target: BattlerAI) {
        super(); 
        this.target = target;
        this.reduction = reduction;
        this.durationTimer = new Timer(duration, this.endEffect); 
    }

    applyEffect(): void { 
        this.target.armor -= this.reduction;
        this.durationTimer.start();
    }

    endEffect(): void {
        this.target.armor += this.reduction;
        delete this.durationTimer; 
    }
    
}
