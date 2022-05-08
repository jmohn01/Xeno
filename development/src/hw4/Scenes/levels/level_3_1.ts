import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { XENO_EVENTS, XENO_LEVEL_PHYSICS_OPTIONS } from "../../constants";
import xeno_level from "../xeno_level";
import level_3_2 from "./level_3_2";

export default class level_3_1 extends xeno_level {
    level: string = '3_1';
    nextLevel: string = '3_2';

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
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, { key: 'music', loop: true, holdReference: true })
    }

    handleEvent(event: GameEvent): void {
        super.handleEvent(event);
        switch (event.type) {
            case XENO_EVENTS.RETRY:
                this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                this.sceneManager.changeToScene(level_3_1, {}, { physics: XENO_LEVEL_PHYSICS_OPTIONS });
                break;
            case XENO_EVENTS.NEXT_LEVEL:
                this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: 'music' });
                this.sceneManager.changeToScene(level_3_2, {}, { physics: XENO_LEVEL_PHYSICS_OPTIONS });
        }
    }

}