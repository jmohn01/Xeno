import Game from "./Wolfie2D/Loop/Game";
import RegistryManager from "./Wolfie2D/Registry/RegistryManager";
import MainMenu from "./hw4/Scenes/MainMenu";
import GoapActionPlanner from "./Wolfie2D/AI/GoapActionPlanner";
import SplashScreen from "./hw4/Scenes/SplashScreen";
import { CANVAS_SIZE } from "./hw4/constants";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: CANVAS_SIZE.x, y: CANVAS_SIZE.y},          // The size of the game
        clearColor: {r: 0.1, g: 0.1, b: 0.1},   // The color the game clears to
        inputs: [
            {name: "forward", keys: ["w"]},
            {name: "backward", keys: ["s"]},
            {name: "left", keys: ["a"]},
            {name: "right", keys: ["d"]},
            {name: "pickup", keys: ["e"]},
            {name: "drop", keys: ["q"]},
            {name: "slot1", keys: ["1"]},
            {name: "slot2", keys: ["2"]},
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }


    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});
})();

function runTests(){
    
};