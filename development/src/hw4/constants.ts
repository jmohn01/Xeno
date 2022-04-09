import Vec2 from "../Wolfie2D/DataTypes/Vec2";

export const CANVAS_SIZE = {
    x: 1600, 
    y: 900
}

export enum WALL_DIRECTION_TYPE {
    CROSSROAD,

    LTRI,
    TTRI,
    RTRI,
    BTRI,

    LTTURN,
    RTTURN,
    RBTURN,
    LBTURN,

    HORIZONTAL,
    VERTICAL
}

export enum TRAP_TYPE {
    ACID = "ACID",
    NET = "NET",
    FROST = "FROST",
    FLAME = "FLAME"
}

export enum XENO_EVENTS {
    ERROR = "ERROR", 
    PLACE_TRAP = "PLACE_TRAP",
    PLACE_WALL = "PLACE_WALL",
    PLACE_TURRET = "PLACE_TURRET",
    UPGRADE = "UPGRADE"
}