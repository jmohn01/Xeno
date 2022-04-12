import Vec2 from "../Wolfie2D/DataTypes/Vec2";

export const CANVAS_SIZE = {
    x: 1600,
    y: 900
}

export enum WALL_TYPE {
    DIRT = "DIRT",
    WOOD = "WOOD",
    STONE = "STONE",
    FIBER = "FIBER"
}

export enum TRAP_TYPE {
    ACID = "ACID",
    NET = "NET",
    FROST = "FROST",
    FLAME = "FLAME"
}

export enum XENO_EVENTS {
    ERROR = "ERROR",
    UNLOAD_ASSET = "UNLOAD_ASSET",
    WALL_DIED = "WALL_DIED",
    ENEMY_DIED = "ENEMY_DIED",
    TURRET_DIED = "TURRET_DIED",
    GAME_OVER = "GAME_OVER",
    EFFECT_END = "EFFECT_END",
    UPGRADE = "UPGRADE"
}

export enum XENO_EFFECT_TYPE {
    FIRE_EFFECT = "FIRE_EFFECT",
    SLOW_EFFECT = "SLOW_EFFECT",
    ACID_EFFECT = "ACID_EFFECT"
}

export enum XENO_ATKER_TYPE {
    FRIEND = "FRINED",
    ENEMY = "ENEMY"
}

