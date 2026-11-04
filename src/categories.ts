export const categories=['Concrete','Grading','Storm','Conduit'] as const;
export type Category=typeof categories[number];
export const categoryColors:Record<Category,string>={Concrete:'#c35b12',Grading:'#a23b78',Storm:'#2563c5',Conduit:'#7351bb'};
export const completedColor='#397b5a';
export function categoryFromDescription(description:string):Category|'Uncategorized'{
 return categories.find(c=>new RegExp('^'+c+'\\b','i').test(description.trim()))||'Uncategorized';
}
export function itemColor(item:{category:string;status:string}){
 return item.status!=='open'?completedColor:categoryColors[item.category as Category]||'#6b7280';
}
export function matchesFilters(item:{id:string;code:string;description:string;category:string;status:string},filters:{category:string;party:string;status:string;query:string}){
 return (filters.category==='all'||item.category===filters.category)&&(filters.party==='all'||item.code===filters.party)&&(filters.status==='all'||item.status===filters.status)&&`${item.id} ${item.code} ${item.description}`.toLowerCase().includes(filters.query.toLowerCase());
}
