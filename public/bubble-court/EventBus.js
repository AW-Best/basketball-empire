export const events=new EventTarget();
export const Events={DUNK_END:'spectacle-dunk-end',ROW_CLEAR:'spectacle-row-clear',POP:'spectacle-pop',DUNK:'spectacle-dunk',RESET:'spectacle-reset',IMPACT:'spectacle-impact'};
export const emit=(name,detail)=>events.dispatchEvent(new CustomEvent(name,{detail}));
