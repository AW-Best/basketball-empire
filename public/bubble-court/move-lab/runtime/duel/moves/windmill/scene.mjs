import {drawStudioFrame} from '../studio-art.mjs';
export function createMoveScene(ctx){return {render(ms){drawStudioFrame(ctx,'windmill',Math.max(0,ms));}};}
