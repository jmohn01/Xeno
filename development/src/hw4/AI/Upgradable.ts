export default interface Upgradeable {
    upgradeCost: number | undefined;
    
    upgrade(): void;
}