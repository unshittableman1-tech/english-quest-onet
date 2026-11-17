import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDelimitedRows,importMatrixToText,readStudentImportFile,normalizeClassName,STUDENT_IMPORT_TEMPLATE_CSV,STUDENT_IMPORT_TEMPLATE_DETAILED_CSV} from '../src/utils/studentImportFile.js';
await import('./helpers/environment.mjs');
const {parseStudentCSV,validateStudentImportBatch}=await import('../src/utils/schoolAdmin.js');

test('Excel matrix and CSV preserve Thai, commas, quotes, newlines and string student IDs',()=>{
  const matrix=[['student_id','name','class','number'],['00012','น้อง "ก", ทดสอบ\nชื่อยาว','6/1',1]];
  const text=importMatrixToText(matrix);
  assert.deepEqual(parseDelimitedRows(text),matrix.map(r=>r.map(String)));
  const rows=parseStudentCSV(text);
  assert.equal(rows[0].student_id,'00012');assert.equal(rows[0].name,'น้อง "ก", ทดสอบ\nชื่อยาว');
  assert.equal(rows[0].class,'ป.6/1');
  assert.equal(validateStudentImportBatch(rows,[],10,0).canCommit,true);
});
test('import combines separate honorific, given name and surname without duplicating a full name',()=>{
  const thai='student_id,คำนำหน้า,ชื่อ,นามสกุล,class,number\nTEST01,ด.ช.,ตัวอย่าง,ทดสอบ,ป.6/1,1';
  assert.equal(parseStudentCSV(thai)[0].name,'ด.ช. ตัวอย่าง ทดสอบ');
  const english='student_id,title,first_name,last_name,class,number\nTEST02,Miss,Sample,Student,6/1,2';
  assert.equal(parseStudentCSV(english)[0].name,'Miss Sample Student');
  const full='student_id,คำนำหน้า,ชื่อ-นามสกุล,นามสกุล,class,number\nTEST03,ด.ญ.,ด.ญ. ทดสอบ ตัวอย่าง,ตัวอย่าง,6/1,3';
  assert.equal(parseStudentCSV(full)[0].name,'ด.ญ. ทดสอบ ตัวอย่าง');
});
test('CSV/Excel validation rejects duplicate IDs, exceeded seats, unknown quota and oversized batches',async()=>{
  const row={student_id:'A001',name:'Synthetic',class:'6/1',number:'1'};
  assert.equal(validateStudentImportBatch([row,row],[],10,0).canCommit,false);
  assert.equal(validateStudentImportBatch([row],[],1,1).canCommit,false);
  assert.equal(validateStudentImportBatch([row],[],null,0).canCommit,false);
  assert.equal(validateStudentImportBatch(Array.from({length:201},(_,i)=>({...row,student_id:'A'+i})),[],500,0).canCommit,false);
  await assert.rejects(readStudentImportFile({size:3*1024*1024,name:'roster.xlsx'}),/2 MB/);
  await assert.rejects(readStudentImportFile({size:10,name:'roster.exe'}),/รองรับ/);
});

test('Student import template uses ป.6/1 and normalizeClassName repairs Thai Excel auto-formatted dates', () => {
  assert.match(STUDENT_IMPORT_TEMPLATE_CSV, /ป\.6\/1/);
  assert.doesNotMatch(STUDENT_IMPORT_TEMPLATE_CSV, /,\s*6\/1\s*,/);

  // Auto-formatted dates from Excel (Thai locale)
  assert.equal(normalizeClassName('6-ม.ค.'), 'ป.6/1');
  assert.equal(normalizeClassName('6-ก.พ.'), 'ป.6/2');
  assert.equal(normalizeClassName('6-มี.ค.'), 'ป.6/3');
  assert.equal(normalizeClassName('6-เม.ย.'), 'ป.6/4');
  assert.equal(normalizeClassName('6-ธ.ค.'), 'ป.6/12');

  // Bare number slash
  assert.equal(normalizeClassName('6/1'), 'ป.6/1');
  assert.equal(normalizeClassName('6/2'), 'ป.6/2');
  assert.equal(normalizeClassName('6-1'), 'ป.6/1');

  // Already prefixed
  assert.equal(normalizeClassName('ป.6/1'), 'ป.6/1');
  assert.equal(normalizeClassName('ป6/1'), 'ป.6/1');
  assert.equal(normalizeClassName('ป 6/1'), 'ป.6/1');

  // Parser heals Excel auto-formatted CSV
  const excelCsv = 'student_id,name,class,number\r\nBNS-60101,ด.ช. ภูผา สมบูรณ์,6-ม.ค.,1\r\nBNS-60102,ด.ญ. ฟ้าใส เรียนดี,6-ก.พ.,2';
  const parsed = parseStudentCSV(excelCsv);
  assert.equal(parsed[0].class, 'ป.6/1');
  assert.equal(parsed[1].class, 'ป.6/2');
  const batch = validateStudentImportBatch(parsed, [], 10, 0);
  assert.equal(batch.canCommit, true);
  assert.equal(batch.rows[0].class, 'ป.6/1');
  assert.equal(batch.rows[1].class, 'ป.6/2');
});

test('Detailed template with prefix/name/surname parses cleanly and skips comment rows', () => {
  assert.match(STUDENT_IMPORT_TEMPLATE_DETAILED_CSV, /คำนำหน้าชื่อ/);
  const parsed = parseStudentCSV(STUDENT_IMPORT_TEMPLATE_DETAILED_CSV);
  assert.equal(parsed.length, 5);
  assert.equal(parsed[0].student_id, 'BNS-60101');
  assert.equal(parsed[0].name, 'ด.ช. ภูผา สมบูรณ์');
  assert.equal(parsed[0].class, 'ป.6/1');
  assert.equal(parsed[0].number, '1');
  const batch = validateStudentImportBatch(parsed, [], 10, 0);
  assert.equal(batch.canCommit, true);

  // Comment row starting with # is skipped
  const withComment = 'student_id,name,class,number\r\n# แถวคำแนะนำ\r\nBNS-60101,ด.ช. ภูผา สมบูรณ์,ป.6/1,1';
  const parsedComment = parseStudentCSV(withComment);
  assert.equal(parsedComment.length, 1);
  assert.equal(parsedComment[0].student_id, 'BNS-60101');
});
