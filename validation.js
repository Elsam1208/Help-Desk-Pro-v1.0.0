export const priorities=['low','normal','high','urgent'];
export const statuses=['open','progress','resolved'];
export function validTicket(t){
 return !!t && ['title','description','customer'].every(k=>typeof t[k]==='string' && t[k].trim().length>0)
 && t.title.length<=160 && t.customer.length<=120 && t.description.length<=10000
 && priorities.includes(t.priority) && statuses.includes(t.status)
 && (t.assigned_to==null || Number.isSafeInteger(t.assigned_to)&&t.assigned_to>0);
}
