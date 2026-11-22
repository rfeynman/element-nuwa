export interface PanelRect {left:number;top:number;width:number;height:number}
export interface PointerPoint {x:number;y:number}
const intersects=(a:PanelRect,b:PanelRect,gap=8)=>a.left<b.left+b.width+gap&&a.left+a.width>b.left-gap&&a.top<b.top+b.height+gap&&a.top+a.height>b.top-gap;

/** Keep the hovered tile clear; retain a clear placement rather than bouncing back. */
export function avoidElement(panel:PanelRect,tile:PanelRect,viewport:{width:number;height:number},nearLeft:number,point:PointerPoint):PanelRect|null{
 if(!intersects(panel,tile))return null;
 const margin=12,right=Math.max(margin,viewport.width-panel.width-margin);
 const top=Math.max(margin,Math.min(panel.top,viewport.height-panel.height-margin));
 const near=Math.max(margin,Math.min(nearLeft,right));
 const candidates=(panel.left+panel.width/2<viewport.width/2?[right,near,margin]:[near,margin,right])
  .filter((left,index,all)=>all.indexOf(left)===index).map(left=>({...panel,left,top}));
 const clear=candidates.find(candidate=>!intersects(candidate,tile));
 if(clear)return clear;
 // When a narrow layout cannot clear the entire tile, at least uncover the cursor.
 return candidates.find(candidate=>point.x<candidate.left-margin||point.x>candidate.left+candidate.width+margin||point.y<candidate.top-margin||point.y>candidate.top+candidate.height+margin)??null;
}
