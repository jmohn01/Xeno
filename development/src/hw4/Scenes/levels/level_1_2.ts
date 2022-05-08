import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { XENO_EVENTS, XENO_LEVEL_PHYSICS_OPTIONS } from "../../constants";
import xeno_level from "../xeno_level";
import level_2_1 from "./level_2_1";

export default class level_1_2 extends xeno_level {
    level: string = '1_2';
    nextLevel: string = '2_1'; 

    loadScene(): void {
        super.loadScene();
        this.load.tilemap("level", "xeno_assets/map/map_1_2.json");
        this.load.audio('music', "xeno_assets/audio/lvl1.wav");
    }

    unloadScene(): void {
        super.unloadScene();
        this.resourceManager.unloadAllResources()
    }

    startScene(): void {
        super.startScene();
        super.initLevel(this.level);
        this.updateLevelUI();
        this.spawnWave();
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: 'music', loop: true, holdReference: true})
    }

    handleEvent(event: GameEvent): void {
        super.handleEvent(event);
        switch(event.type) {
            case XENO_EVENTS.RETRY:
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: 'music'}); 
                this.sceneManager.changeToScene(level_1_2, {}, {physics: XENO_LEVEL_PHYSICS_OPTIONS}); 
                break;
            case XENO_EVENTS.NEXT_LEVEL:
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: 'music'}); 
                this.sceneManager.changeToScene(level_2_1, {}, {physics: XENO_LEVEL_PHYSICS_OPTIONS}); 
        }
    }
    
}