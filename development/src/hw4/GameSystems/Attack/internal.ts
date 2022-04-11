export type effectsData = {
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