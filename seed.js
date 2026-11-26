import {db} from './db.js';
import bcrypt from 'bcryptjs';
try {
 const password=process.env.ADMIN_PASSWORD;
 if(!password || password.length<12 || Buffer.byteLength(password)>72 || !process.env.ADMIN_EMAIL) throw Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD (12 a 72 bytes).');
 await db.execute('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)',['Administrador',process.env.ADMIN_EMAIL,await bcrypt.hash(password,12),'admin']);
 console.log('Administrador criado.');
} catch(e){console.error(e.message);process.exitCode=1;} finally{await db.end();}
