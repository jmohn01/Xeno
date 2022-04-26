import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import xeno_level from "../xeno_level";

export default class level_1_1 extends xeno_level {
    level: string = '3_1';

    loadScene(): void {
        this.load.tilemap("level", "xeno_assets/map/map_3_1.json");
        super.loadScene();
        this.load.audio('music', "xeno_assets/audio/lvl3.wav");
    }

    unloadScene(): void {
        super.unloadScene();
        this.resourceManager.unloadAllResources();
    }   

    startScene(): void {
        super.startScene();
        super.initLevel(this.level);
        this.updateLevelUI();
        this.spawnWave();
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: 'music', loop: true, holdReference: true})
    }
    
}