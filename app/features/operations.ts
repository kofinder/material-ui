export const permissions = {
  materials: 'Create and edit materials', receive: 'Receive stock', issue: 'Issue materials', adjust: 'Adjust stock counts',
  purchasing: 'Create purchase requests', approve: 'Approve purchase requests', suppliers: 'Manage suppliers', users: 'Manage users', roles: 'Manage roles', export: 'Export records',
} as const;
export type Permission = keyof typeof permissions;
export type Role = { id: string; name: string; description: string; permissions: Permission[]; locked?: boolean };
export type User = { id: string; name: string; email: string; department: string; roleId: string; active: boolean };
export type Supplier = { id: string; name: string; contact: string; email: string; phone: string; terms: string; active: boolean };
export type PurchaseLine = { material: string; qty: number; price: number; discount: number };
export type Purchase = { id: string; supplierId: string; lines: PurchaseLine[]; freight: number; tax: number; department: string; requiredDate: string; note: string; status: 'Submitted'|'Approved'|'Rejected'|'Received'|'Cancelled'; creator: string; created: string; reviewer?: string; reason?: string; received?: string };
export type Event = { id: string; at: string; actor: string; action: string; detail: string };
export const seedRoles: Role[] = [
  { id: 'admin', name: 'Administrator', description: 'Full workspace administration and operations.', permissions: Object.keys(permissions) as Permission[], locked: true },
  { id: 'manager', name: 'Store manager', description: 'Stock control, purchasing approvals, and reporting.', permissions: ['materials','receive','issue','adjust','purchasing','approve','suppliers','export'] },
  { id: 'clerk', name: 'Store officer', description: 'Day-to-day receiving, issuing, and purchase requests.', permissions: ['receive','issue','purchasing','export'] },
  { id: 'viewer', name: 'Auditor', description: 'Read-only review and export of records.', permissions: ['export'] },
];
export const seedUsers: User[] = [
  {id:'admin-user',name:'Demo administrator',email:'admin@example.com',department:'Administration',roleId:'admin',active:true},
  {id:'manager-user',name:'Demo store manager',email:'manager@example.com',department:'Store',roleId:'manager',active:true},
  {id:'officer-user',name:'Demo store officer',email:'officer@example.com',department:'Store',roleId:'clerk',active:true},
  {id:'auditor-user',name:'Demo auditor',email:'auditor@example.com',department:'Finance',roleId:'viewer',active:true},
];
export const seedSuppliers: Supplier[] = [
 {id:'SUP-DEMO-01',name:'Demo Industrial Supply',contact:'Demo supplier contact',email:'supplier@example.com',phone:'',terms:'Net 30',active:true},
 {id:'SUP-DEMO-02',name:'Demo Foundry Materials',contact:'Demo supplier contact',email:'foundry@example.com',phone:'',terms:'Net 15',active:true},
];
export const money = (n:number) => Math.round((n + Number.EPSILON)*100)/100;
/** Demo accounting convention: round line extensions to cents; freight is taxable; tax is excluded from stock cost. */
export function calculate(lines:PurchaseLine[],freight:number,tax:number) {
 const lineTotals=lines.map(l=>{const gross=money(l.qty*l.price);const discount=money(gross*l.discount/100);return {gross,discount,net:money(gross-discount)};});
 const gross=money(lineTotals.reduce((s,l)=>s+l.gross,0)), discount=money(lineTotals.reduce((s,l)=>s+l.discount,0));
 const net=money(gross-discount), landed=money(net+freight), taxAmount=money(landed*tax/100), total=money(landed+taxAmount);
 // Allocate freight by discounted line value (or equally if all lines are free), assigning rounding residue to the last line.
 let allocated=0;
 const costs=lineTotals.map((l,i)=>{const share=i===lineTotals.length-1?money(freight-allocated):money(freight*(net>0?l.net/net:1/lineTotals.length));allocated=money(allocated+share);return {freight:share,landed:money(l.net+share),unitCost:(l.net+share)/lines[i].qty};});
 return {lineTotals,gross,discount,net,landed,taxAmount,total,costs};
}
export function validatePurchase(p:Pick<Purchase,'lines'|'freight'|'tax'|'department'|'requiredDate'>,validIds:Set<string>) {
 if(!p.department.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(p.requiredDate)||!Number.isFinite(Date.parse(p.requiredDate)))return 'Enter a department and valid required date.';
 if(!p.lines.length)return 'Add at least one material.';
 if(p.lines.some(l=>!validIds.has(l.material)||!Number.isFinite(l.qty)||l.qty<=0||!Number.isFinite(l.price)||l.price<0||!Number.isFinite(l.discount)||l.discount<0||l.discount>100))return 'Every line needs a material, positive quantity, nonnegative price, and discount between 0 and 100%.';
 if(new Set(p.lines.map(l=>l.material)).size!==p.lines.length)return 'Combine duplicate materials into one line.';
 if(!Number.isFinite(p.freight)||p.freight<0||!Number.isFinite(p.tax)||p.tax<0||p.tax>100)return 'Freight must be zero or greater; tax must be between 0 and 100%.';
 if(!Number.isFinite(calculate(p.lines,p.freight,p.tax).total)||calculate(p.lines,p.freight,p.tax).costs.some(c=>!Number.isFinite(c.unitCost)))return 'Amounts exceed the supported calculation range.';
 return '';
}
export function mayTransition(p:Purchase,action:'approve'|'reject'|'receive'|'cancel',actor:string,allowed:Permission[]):string {
 if(action==='approve'||action==='reject') {
  if(!allowed.includes('approve'))return 'Your role cannot approve purchase requests.';
  if(p.status!=='Submitted')return 'Only submitted requests can be reviewed.';
  if(p.creator===actor)return 'A different user must review this request.';
 } else if(action==='receive') {
  if(!allowed.includes('receive'))return 'Your role cannot receive stock.';
  if(p.status!=='Approved')return 'Only approved requests can be received, once.';
 } else {
  if(p.status!=='Submitted')return 'Only submitted requests can be cancelled.';
  if(p.creator!==actor&&!allowed.includes('approve'))return 'Only the requester or an approver may cancel this request.';
 }
 return '';
}
