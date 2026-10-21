import {SPECTACLE,SPECIAL_SPECTACLE,SPECIAL_SOURCE_ANCHORS} from '../duel-lab/Constants.js';
const specials=Object.fromEntries(Object.entries(SPECIAL_SOURCE_ANCHORS).map(([id,sourceAnchors])=>[id,Object.freeze({...SPECTACLE,...SPECIAL_SPECTACLE,sourceAnchors})]));
export const getAttackTiming=id=>Object.hasOwn(specials,id)?specials[id]:SPECTACLE;
