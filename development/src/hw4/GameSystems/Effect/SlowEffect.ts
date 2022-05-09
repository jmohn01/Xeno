import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE, XENO_EVENTS } from "../../constants";
import { Effect } from "./Effect";


export class SlowEffect extends Effect<SlowEffect> {
    

    duration: number;

    type: XENO_EFFECT_TYPE = XENO_EFFECT_TYPE.SLOW_EFFECT;
    
    target: BattlerAI;

    private percent: number; 

    private durationTimer: Timer; 



    constructor(duration: number, percent: number, target: BattlerAI) {
        super(); 
        this.target = target;
        this.percent = percent;
        this.durationTimer = new Timer(duration, this.endEffect); 
    }

    applyEffect(): void { 
        this.target.speed *= this.percent;
        this.durationTimer.start();
    }

    endEffect = () => {
        this.target.speed /= this.percent;
        this.durationTimer.pause(); 
        this.target.removeEffect(this.id);
    }

    refreshEffect(): void {
        this.durationTimer.reset();
    }

    isActive(): boolean {
        return !this.durationTimer.isStopped();
    }

    equal(e: SlowEffect): boolean {
        if (e.type === this.type) {
            return this.duration === e.duration && this.percent === e.percent;
        }
    }

    pause(): void {
        this.durationTimer.pause();
    }

    resume(): void {
        this.durationTimer.resume(); 
    }
}
