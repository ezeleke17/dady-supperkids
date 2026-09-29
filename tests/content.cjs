const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({
  randomInt: max => Math.floor(Math.random() * (max+1)),
  shuffle: items => [...items].sort(() => Math.random()-.5),
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../content.js'),'utf8'),context);
for (const grade of ['1','3']) for (const level of ['easy','medium','hard']) {
  for (let repeat=0;repeat<200;repeat++) {
    for (const game of ['math','spelling','reading']) {
      const questions = vm.runInContext(`curriculum.${game}('${grade}','${level}')`,context);
      assert.equal(questions.length,10);
      for (const q of questions) {
        assert.equal(q.options.length,4);
        assert.equal(new Set(q.options).size,4,`${grade} ${q.label}`);
        assert.equal(q.options.filter(a=>a===q.answer).length,1);
        assert(q.label && q.explanation && q.skill && q.standard);
        if (q.fraction) assert.equal(q.answer,`${q.fraction.shaded}/${q.fraction.parts}`);
        if (game==='reading') assert(q.passage && q.title && q.writingPrompt);
        if (game==='math') {
          assert(q.standard.startsWith(grade+'.'));
          const equation = q.label.match(/^(\d+) ([+−]) (\d+) =/);
          if(equation) assert.equal(Number(q.answer),equation[2]==='+' ? +equation[1]+ +equation[3] : +equation[1]- +equation[3]);
          if(q.skill==='Equal groups') {const n=q.label.match(/\d+/g).map(Number);assert.equal(+q.answer,n[0]*n[1]);assert(+q.answer<=100);}
          if(q.skill==='Division') {const n=q.label.match(/\d+/g).map(Number);assert.equal(+q.answer,n[0]/n[1]);}
          if(q.skill==='Area') {const n=q.label.match(/\d+/g).map(Number);assert.equal(+q.answer,n[0]*n[1]);}
          if(q.skill==='Perimeter') assert.equal(+q.answer,q.label.match(/\d+/g).map(Number).reduce((a,b)=>a+b));
          if(q.skill==='Rounding') assert.equal(+q.answer,Math.round(+q.label.match(/\d+/)[0]/10)*10);
          if(q.skill==='Two-step problems') {const n=q.label.match(/\d+/g).map(Number);assert.equal(+q.answer,n[0]*n[1]-n[2]);}
        }
      }
      if(game==='math' && grade==='3') for(const domain of ['OA','NBT','NF','MD','G']) assert(questions.some(q=>q.standard.startsWith(`3.${domain}.`)));
    }
  }
}
console.log('PASS: 36,000 generated items checked across both grades and all difficulties; answer uniqueness, numeric solutions, reading data, and grade 3 domain coverage.');
