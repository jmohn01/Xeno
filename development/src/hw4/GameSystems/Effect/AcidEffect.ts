import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EFFECT_TYPE, XENO_EVENTS } from "../../constants";
import { Effect } from "./Effect";

export class AcidEffect extends Effect<AcidEffect> {

    
    duration: number;
    
    reduction: number; 
    
    type: XENO_EFFECT_TYPE = XENO_EFFECT_TYPE.ACID_EFFECT;
    
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
        this.emitter.fireEvent(XENO_EVENTS.EFFECT_END, {id: this.id, owner: this.target})
    }

    refreshEffect(): void {
        this.durationTimer.reset();
    }

    isActive(): boolean {
        return !this.durationTimer.isStopped()
    }

    equal(e: AcidEffect): boolean {
        return this.duration === e.duration && this.reduction === e.reduction; 
    }
    
    
}
