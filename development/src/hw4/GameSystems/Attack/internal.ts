export type EffectData = {
    fire?: { 
        duration: number, 
        damage: number,
        ticks: number
    },
    slow?: {
        duration: number,
        percent: number
    },
    acid?: {
        duration: number,
        reduction: number
    }
}
