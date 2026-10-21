import {drawStudioFrame} from '../studio-art.mjs';
export function createMoveScene(ctx){return {render(ms){drawStudioFrame(ctx,'cat',Math.max(0,ms));}};}
