import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE } from "../../constants";
import { Effect } from "./Effect";


export class SlowEffect extends Effect<SlowEffect> {

    duration: number;

    type: XENO_EFFECT_TYPE = XENO_EFFECT_TYPE.SLOW_EFFECT;
    
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

    refreshEffect(): void {
        this.durationTimer.reset();
    }

    equal(e: SlowEffect): boolean {
        if (e.type === this.type) {
            return this.duration === e.duration && this.percent === e.percent;
        }
    }
}
