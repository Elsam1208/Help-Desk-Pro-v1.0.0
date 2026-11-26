import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import {db} from './db.js';
import {validTicket} from './validation.js';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const app=express(), secret=process.env.JWT_SECRET;
if(!secret || secret.length<32 || secret.startsWith('SUBSTITUA')) throw Error('Configure JWT_SECRET.');
app.use(helmet({contentSecurityPolicy:{directives:{styleSrc:["'self'","'unsafe-inline'"],upgradeInsecureRequests:null}}}),express.json({limit:'32kb'}));
app.use(express.static(fileURLToPath(new URL('../public',import.meta.url))));
app.use('/docs',swaggerUi.serve,swaggerUi.setup(JSON.parse(readFileSync(new URL('../docs/openapi.json',import.meta.url)))));
app.post('/api/login',rateLimit({windowMs:15*60*1000,limit:20}),async(req,res)=>{
 const {email,password}=req.body||{};
 if(typeof email!=='string'||typeof password!=='string'||Buffer.byteLength(password)>72) return res.sendStatus(400);
 const [[u]]=await db.execute('SELECT * FROM users WHERE email=?',[email]);
 if(!u||!await bcrypt.compare(password,u.password_hash)) return res.status(401).json({error:'Credenciais inválidas'});
 res.json({token:jwt.sign({sub:String(u.id)},secret,{expiresIn:'2h',algorithm:'HS256'}),name:u.name,role:u.role});
});
app.use('/api',async(req,res,next)=>{
 let payload;
 try{payload=jwt.verify(req.headers.authorization?.split(' ')[1]||'',secret,{algorithms:['HS256']});}catch{return res.sendStatus(401);}
 const [[user]]=await db.execute('SELECT id,name,role FROM users WHERE id=?',[payload.sub]);
 if(!user)return res.sendStatus(401);req.user=user;next();
});
const admin=(req,res,next)=>req.user.role==='admin'?next():res.sendStatus(403);
app.get('/api/users',async(req,res)=>res.json((await db.query('SELECT id,name,role FROM users ORDER BY name'))[0]));
app.post('/api/users',admin,async(req,res)=>{
 const {name,email,password}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>120||typeof email!=='string'||!email.includes('@')||email.length>190||typeof password!=='string'||password.length<12||Buffer.byteLength(password)>72)return res.sendStatus(400);
 const [r]=await db.execute('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',[name,email,await bcrypt.hash(password,12)]);
 res.status(201).json({id:r.insertId});
});
app.get('/api/tickets',async(req,res)=>res.json((await db.query('SELECT t.*,u.name AS technician FROM tickets t LEFT JOIN users u ON u.id=t.assigned_to ORDER BY t.id DESC'))[0]));
const values=t=>[t.title.trim(),t.description.trim(),t.customer.trim(),t.priority,t.status,t.assigned_to??null];
app.post('/api/tickets',async(req,res)=>{
 if(!validTicket(req.body))return res.status(400).json({error:'Dados inválidos'});
 const [r]=await db.execute('INSERT INTO tickets(title,description,customer,priority,status,assigned_to) VALUES(?,?,?,?,?,?)',values(req.body));
 res.status(201).json({id:r.insertId});
});
app.put('/api/tickets/:id',async(req,res)=>{
 if(!validTicket(req.body))return res.sendStatus(400);
 const [r]=await db.execute('UPDATE tickets SET title=?,description=?,customer=?,priority=?,status=?,assigned_to=? WHERE id=?',[...values(req.body),req.params.id]);
 res.sendStatus(r.affectedRows?204:404);
});
app.delete('/api/tickets/:id',admin,async(req,res)=>{
 const [r]=await db.execute('DELETE FROM tickets WHERE id=?',[req.params.id]);res.sendStatus(r.affectedRows?204:404);
});
app.use('/api',(req,res)=>res.sendStatus(404));
app.use((err,req,res,next)=>{console.error(err.code||err.message);res.status(err.code==='ER_DUP_ENTRY'?409:err.code==='ER_NO_REFERENCED_ROW_2'?400:err.status||500).json({error:'Não foi possível concluir a operação'});});
await db.query('SELECT 1');
app.listen(Number(process.env.PORT||3000),()=>console.log('Help Desk Pro iniciado'));
