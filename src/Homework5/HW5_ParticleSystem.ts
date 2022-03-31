import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Particle from "../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../Wolfie2D/Utils/RandUtils";
import { HW5_Color } from "./hw5_color";

// HOMEWORK 5 - TODO
/**
 * This particle system extends the base ParticleSystem class, and I reccommend you look at some of the implementation, 
 * at least for the default setParticleAnimation()
 * 
 * You'll just be handling the tweens for each particle for their animation, overriding the base implementation.
 * 
 * The new particle animation add these behaviors, along with the existing setParticleAnimation behaviors:
 * 
 *  - Each particle should look like they're affected by gravity, accelerating down over the course of their lifetime. This
 *  change should also be affected by the particle's mass, meaning particles with a higher mass should fall faster.
 * 
 *  - Each particle should disappear over it's lifetime, moving from an alpha of 1 to 0.
 */
export default class HW5_ParticleSystem extends ParticleSystem {

    setParticleAnimation(particle: Particle) {
        particle.vel = new Vec2(RandUtils.randFloat(-50, 50), RandUtils.randFloat(1, 50 * this.particleMass));
        switch (this.particleMass) {
            case 1:
                particle.color = Color.RED
                break;
            case 2:
                particle.color = Color.GREEN
                break;
            case 3:
                particle.color = Color.BLUE
                break; 
        }
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        })
    }
}