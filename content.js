'use strict';

// Original practice items. Standards references and coverage limits: CURRICULUM.md.
const curriculum = (() => {
  const item = (skill, standard, label, answer, distractors, explanation, extra = {}) => ({
    skill, standard, label, answer: String(answer),
    options: shuffle([String(answer), ...distractors.map(String)]), explanation, ...extra,
  });
  const numeric = (skill, standard, label, answer, explanation) => {
    const wrong = shuffle([...new Set([answer + 1, answer + 2, Math.max(0, answer - 1), Math.max(0, answer - 2), answer + 10])].filter(n => n !== answer)).slice(0, 3);
    return item(skill, standard, label, answer, wrong, explanation);
  };
  function math(grade, level) {
    const difficulty = {easy: 0, medium: 1, hard: 2}[level];
    if (grade === '1') {
      const cap = difficulty === 0 ? 10 : 20;
      const a = 2 + randomInt(cap - 4), b = 1 + randomInt(cap - a - 1);
      const tens = 1 + randomInt(difficulty === 0 ? 3 : 8), ones = randomInt(9);
      const hour = 1 + randomInt(11), half = difficulty > 0;
      const count = 2 + randomInt(4);
      const pool = [
        numeric('Addition', '1.OA.C.6', `${a} + ${b} = ?`, a+b, `Start at ${a} and count on ${b}. You land on ${a+b}.`),
        numeric('Subtraction', '1.OA.C.6', `${a+b} − ${b} = ?`, a, `Think of the related addition fact: ${a} + ${b} = ${a+b}.`),
        numeric('Story problems', '1.OA.A.1', `Mia has ${a} shells. She finds ${b} more. How many shells does she have now?`, a+b, `Finding more means adding: ${a} + ${b} = ${a+b}.`),
        numeric('Missing numbers', '1.OA.D.8', `${a} + ? = ${a+b}`, b, `The missing part is ${b}, because ${a} + ${b} = ${a+b}.`),
        numeric('Tens and ones', '1.NBT.B.2', `What number has ${tens} tens and ${ones} ones?`, tens*10+ones, `${tens} tens is ${tens*10}. Add ${ones} ones to make ${tens*10+ones}.`),
        numeric('Ten more', '1.NBT.C.5', `What is 10 more than ${tens*10+ones}?`, (tens+1)*10+ones, `Add one ten. The ones stay the same: ${(tens+1)*10+ones}.`),
        item('Time', '1.MD.B.3', `Which time means ${half ? 'half past' : 'exactly'} ${hour} o’clock?`, `${hour}:${half ? '30' : '00'}`, [`${hour}:${half ? '00' : '30'}`, `${hour === 12 ? 1 : hour+1}:00`, `${hour}:15`], half ? 'Half an hour is 30 minutes, so half past ends in :30.' : 'An exact hour has 00 minutes.'),
        numeric('Read data', '1.MD.C.4', `Our class picked pets: cats ${count}, dogs ${count+2}, fish 1. How many more votes did dogs get than cats?`, 2, `Compare the two counts: ${count+2} − ${count} = 2.`),
        item('Shapes', '1.G.A.1', 'Which flat shape has exactly 3 straight sides?', 'triangle', ['square','circle','rectangle'], 'A triangle has 3 straight sides and 3 corners.'),
        item('Equal shares', '1.G.A.3', 'A sandwich is cut into 2 equal parts. What is each part called?', 'one half', ['one fourth','one whole','two wholes'], 'Two equal halves make one whole sandwich.'),
        item('Compare numbers', '1.NBT.B.3', `Which number is greater than ${tens*10+5}?`, tens*10+7, [tens*10+4,tens*10+3,tens*10+5], `The tens are the same. Compare the ones: 7 is greater than 5.`),
        item('Compare lengths', '1.MD.A.1', 'The red ribbon is longer than the blue ribbon. The blue ribbon is longer than the green ribbon. Which ribbon is longest?', 'red', ['blue','green','all the same'], 'Red is longer than blue, and blue is already longer than green.'),
      ];
      return [...pool.slice(0,2), ...shuffle(pool.slice(2)).slice(0,8)];
    }
    const maxFactor = [5,8,10][difficulty];
    const a = 2 + randomInt(maxFactor-2), b = 2 + randomInt(maxFactor-2);
    const n = [120,240,360][difficulty] + randomInt(99), m = 101 + randomInt(99);
    const d = [2,3,4,6,8][randomInt(4)], part = 1 + randomInt(d-2);
    const length = 3 + randomInt(5), width = 2 + randomInt(3);
    const tens = 2 + randomInt(6), ones = 1 + randomInt(8), number = 100 + tens*10 + ones;
    const startMinute = 5 + randomInt(15), duration = 10 + randomInt(20);
    const pool = [
      numeric('Equal groups', '3.OA.A.1', `There are ${a} baskets with ${b} apples in each. How many apples are there?`, a*b, `${a} groups of ${b} means ${a} × ${b} = ${a*b}.`),
      numeric('Division', '3.OA.A.3', `${a*b} stickers are shared equally among ${a} children. How many stickers does each child get?`, b, `${a*b} ÷ ${a} = ${b}. Check: ${a} × ${b} = ${a*b}.`),
      numeric('Add within 1,000', '3.NBT.A.2', `${n} + ${m} = ?`, n+m, `Add hundreds, tens, and ones, regrouping when needed. ${n} + ${m} = ${n+m}.`),
      numeric('Subtract within 1,000', '3.NBT.A.2', `${n+m} − ${m} = ?`, n, `Use addition to check: ${m} + ${n} = ${n+m}.`),
      item('Fractions', '3.NF.A.1', `A whole strip has ${d} equal parts. ${part} ${part === 1 ? 'part is' : 'parts are'} shaded. What fraction is shaded?`, `${part}/${d}`, [`${d}/${part}`,`${part}/${d+1}`,`${part+1}/${d}`], `The denominator ${d} counts all equal parts. The numerator ${part} counts shaded parts.`, {fraction: {parts:d, shaded:part}}),
      numeric('Area', '3.MD.C.7', `A rectangle is ${length} units long and ${width} units wide. What is its area in square units?`, length*width, `Area counts the squares inside: ${length} × ${width} = ${length*width} square units.`),
      numeric('Perimeter', '3.MD.D.8', `A rectangle has side lengths ${length}, ${width}, ${length}, and ${width} centimeters. What is its perimeter in centimeters?`, 2*(length+width), `Add every side: ${length} + ${width} + ${length} + ${width} = ${2*(length+width)} cm.`),
      numeric('Rounding', '3.NBT.A.1', `Round ${number} to the nearest ten.`, Math.round(number/10)*10, `The ones digit is ${ones}. ${ones >= 5 ? 'Round up to the next ten.' : 'Round down to the previous ten.'}`),
      item('Elapsed time', '3.MD.A.1', `Reading starts at 2:${String(startMinute).padStart(2,'0')} p.m. and lasts ${duration} minutes. When does it end?`, `2:${String(startMinute+duration).padStart(2,'0')} p.m.`, [`2:${String(startMinute).padStart(2,'0')} p.m.`,`3:${String(startMinute+duration).padStart(2,'0')} p.m.`,`2:${String(startMinute+duration+1).padStart(2,'0')} p.m.`], `Add ${duration} minutes to ${startMinute} minutes: ${startMinute+duration} minutes past 2.`),
      numeric('Two-step problems', '3.OA.D.8', `Ava buys ${a} packs of ${b} pencils. She gives away 2 pencils. How many are left?`, a*b-2, `First multiply ${a} × ${b} = ${a*b}. Then subtract 2 to get ${a*b-2}.`),
      numeric('Scaled data', '3.MD.B.3', 'In a picture graph, each star means 2 books. Kai has 4 stars and Jo has 2 stars. How many more books did Kai read?', 4, 'Kai read 4 × 2 = 8 books. Jo read 2 × 2 = 4. The difference is 4 books.'),
      item('Shape families', '3.G.A.1', 'Which statement is true about every square?', 'It is a quadrilateral.', ['It has 3 sides.','It has no right angles.','Its sides are curved.'], 'A quadrilateral is a closed shape with four straight sides. Every square belongs to that family.'),
      item('Equivalent fractions', '3.NF.A.3', 'Which fraction is equal to 1/2 of the same whole?', '2/4', ['1/4','3/4','2/3'], 'Splitting each half into two equal pieces makes four pieces. Two fourths cover the same amount as one half.'),
      numeric('Liquid volume', '3.MD.A.2', `A jug holds ${a+b} liters of water. You pour out ${b} liters. How many liters remain?`, a, `Subtract the liters poured out: ${a+b} − ${b} = ${a}.`),
    ];
    // Include all five math domains in every round; rotate related skills on replay.
    return [pool[0],pool[1],shuffle([pool[2],pool[3]])[0],shuffle([pool[4],pool[12]])[0],pool[5],shuffle([pool[6],pool[8],pool[13]])[0],pool[7],pool[9],pool[10],pool[11]];
  }

  const spellingSets = {
    '1': {
      easy: [['cat','🐱','The pet says meow.','The short a sound sits between c and t.'],['dog','🐶','This pet barks.','The short o sound sits between d and g.'],['sun','☀️','It shines in the sky.','The short u sound sits between s and n.'],['pig','🐷','This farm animal says oink.','The short i sound sits between p and g.'],['hat','🎩','Wear it on your head.','Listen for h, short a, and t.'],['bed','🛏️','Sleep here at night.','The short e sound sits between b and d.'],['hen','🐔','This bird lays eggs.','Listen for h, short e, and n.'],['bug','🐞','A tiny crawling creature.','The short u sound sits between b and g.'],['map','🗺️','It shows where places are.','Listen for m, short a, and p.'],['cup','☕','You drink from it.','Listen for c, short u, and p.']],
      medium: [['ship','🚢','A large boat.','The letters sh work together to make one sound.'],['fish','🐟','An animal with fins.','The word ends with the digraph sh.'],['duck','🦆','A bird that quacks.','The short u is followed by ck.'],['shell','🐚','A hard covering found on the beach.','Start with sh and end with double l.'],['tree','🌳','A tall plant with a trunk.','The letters ee make the long e sound.'],['boat','⛵','It floats on water.','The vowel team oa makes the long o sound.'],['rain','🌧️','Water falling from clouds.','The vowel team ai makes the long a sound.'],['cake','🎂','A birthday treat.','A silent e helps a say its name.'],['bike','🚲','It has two wheels and pedals.','A silent e helps i say its name.'],['moon','🌙','It lights up the night sky.','Use oo for the middle vowel sound.']],
      hard: [['train','🚂','It travels on tracks.','Start with the blend tr and use the vowel team ai.'],['chair','🪑','A seat for one person.','Start with ch, then spell air.'],['whale','🐋','A huge ocean mammal.','Start with wh and use silent e.'],['clock','🕒','It tells the time.','Start with cl and end with ck.'],['brush','🖌️','Use it to paint.','Start with br and end with sh.'],['grape','🍇','A small fruit that grows in bunches.','Start with gr; silent e makes a long.'],['green','🟢','The color of grass.','Start with gr and use ee.'],['feet','🦶','You stand on these.','The word uses the vowel team ee.'],['night','🌙','The dark part of the day.','The letters igh make the long i sound.'],['star','⭐','A bright point in the night sky.','Start with st, then the r-controlled vowel ar.']],
    },
    '3': {
      easy: [['helpful','🤝','Someone who helps is ___.','Add the suffix -ful to help; -ful has one l.'],['careless','💧','Someone who spills by not paying attention is ___.','Add -less to care to mean without care.'],['replay','🔁','To play a game again is to ___ it.','The prefix re- means again.'],['unhappy','😞','A person who is not happy is ___.','The prefix un- means not.'],['teacher','🧑‍🏫','A person who teaches.','Add -er to teach to name a person who teaches.'],['hopeful','🌱','Feeling full of hope.','Keep the e in hope and add -ful.'],['slowly','🐢','The turtle moves ___.','Add -ly to slow to tell how something moves.'],['kindness','💛','Helping a friend shows ___.','Add -ness to kind to name the quality.'],['fearless','🦁','Someone without fear is ___.','Add -less to fear.'],['joyful','😊','Feeling full of joy.','Add -ful to joy.']],
      medium: [['running','🏃','The child is ___ a race.','Double the final n in run before adding -ing.'],['hopping','🐰','The rabbit is ___ along.','Double the final p in hop before adding -ing.'],['making','🛠️','They are ___ a toy.','Drop the silent e in make before adding -ing.'],['hoped','🌠','Yesterday, I ___ for clear skies.','Hope already ends in e, so add d.'],['carried','🧺','Yesterday, she ___ the basket.','Change the y in carry to i, then add -ed.'],['babies','👶','More than one baby.','Change consonant + y to ies for this plural.'],['boxes','📦','More than one box.','Add -es after x.'],['leaves','🍃','More than one leaf.','In this plural, change f to ves.'],['writing','✍️','Putting words on paper.','Drop the silent e in write before adding -ing.'],['planned','📅','Yesterday, we ___ our trip.','Double the n in plan before adding -ed.']],
      hard: [['butterfly','🦋','An insect with colorful wings.','Break it into butter + fly.'],['elephant','🐘','A large animal with a trunk.','Say the syllables el-e-phant; ph makes the f sound.'],['beautiful','🌸','Another word for lovely.','Remember the vowel group eau and the ending -ful.'],['different','🟠🔵','Not the same.','Notice the double f and the ending -ent.'],['important','⭐','Something that matters is ___.','Break it into im-por-tant.'],['remember','🧠','To keep something in your mind.','Break it into re-mem-ber.'],['tomorrow','📅','The day after today.','Use one m and double r.'],['because','💬','I wore boots ___ it was raining.','This word introduces a reason; notice the vowel pair au.'],['discover','🔎','To find something new.','Break it into dis-cov-er.'],['wonderful','🌈','Something very good is ___.','Join wonder and -ful, with one l at the end.']],
    },
  };
  function spelling(grade, level) {
    return shuffle(spellingSets[grade][level]).map(([answer, emoji, label, explanation]) => {
      const variants = [...new Set([answer.slice(0,-1), answer + answer.at(-1), answer[0] + answer.slice(2), answer.slice(0,1) + 'u' + answer.slice(2), answer + 'e'])].filter(w => w !== answer);
      return item('Spelling patterns', grade === '1' ? 'L.1.2 / RF.1.3' : 'L.3.2 / RF.3.3', label, answer, shuffle(variants).slice(0,3), explanation, {emoji});
    });
  }

  const texts = {
    '1': [
      {title:'The Little Seed', text:'Lena put a seed in a pot. She gave it water. She set the pot by a sunny window. Each day, Lena looked at the pot. At last, a tiny green leaf came up. Lena smiled.', questions:[
        ['Story details','RL.1.1','Where did Lena put the pot?','by a sunny window',['under a bed','in a bag','behind a door'],'The story says she set the pot by a sunny window.'],
        ['Sequence','RL.1.3','What did Lena do first?','put a seed in a pot',['saw a leaf','smiled at a leaf','looked at a tall tree'],'The first sentence tells us she put a seed in a pot.'],
        ['Word meanings','L.1.4','What does tiny mean?','very small',['very loud','very heavy','very cold'],'The new leaf is little; tiny means very small.'],
        ['Story details','RL.1.1','What came up from the seed?','a green leaf',['a red ball','a blue hat','a small toy'],'The story says a tiny green leaf came up.'],
        ['Sentences','L.1.2','Which sentence has a capital letter and correct ending?','Lena watered the seed.',['lena watered the seed.','Lena watered the seed','lena watered the seed'],'A sentence starts with a capital letter and ends with punctuation.'],
      ], prompt:'Tell how Lena took care of the seed. Write one or two sentences using a detail from the story.'},
      {title:'Animal Homes', text:'Animals need safe places to rest. A bird can make a nest with twigs. A rabbit can rest in a hole under the ground. A nest and a hole are different homes. Both can help animals stay safe.', questions:[
        ['Main topic','RI.1.2','What is this text mostly about?','homes for animals',['games for children','colors of flowers','food for fish'],'The text describes places where birds and rabbits can rest safely.'],
        ['Text details','RI.1.1','What can a bird use to make a nest?','twigs',['plates','shoes','ice'],'The text says a bird can make a nest with twigs.'],
        ['Compare','RI.1.3','How are a nest and a rabbit hole alike?','Both can keep animals safe.',['Both are made of ice.','Both are in trees.','Both have doors.'],'The last sentence says both homes can help animals stay safe.'],
        ['Word meanings','L.1.4','In this text, rest means ___.','relax or sleep',['run very fast','sing loudly','build a road'],'A safe home gives an animal a place to relax or sleep.'],
        ['Grammar','L.1.1','Choose the word: Two ___ rest in a nest.','birds',['bird','birding','birded'],'Use the plural birds because there are two.'],
      ], prompt:'Write one fact about an animal home. Then tell why that home is useful.'},
    ],
    '3': [
      {title:'The Bridge Challenge', text:'On Saturday, Nia and Ben tried to build a bridge for their toy truck. They stretched one sheet of paper between two books. When Ben rolled the truck onto it, the paper sagged. Nia almost gave up. Then she noticed the folded sides of a cardboard box. She folded their paper back and forth into ridges and placed it across the gap again. This time, the bridge held the truck. Ben cheered, but Nia wanted to test it once more. They added a second truck. The bridge bent, yet it stayed up. Nia wrote down what they had changed so they could build another bridge later.', questions:[
        ['Character actions','RL.3.3','Why did Nia fold the paper?','She wanted to make the bridge stronger.',['She wanted to hide the truck.','She wanted to make a book.','She wanted to end the game.'],'After the first bridge sagged, Nia tried folds inspired by the box. The new bridge held the truck.'],
        ['Text evidence','RL.3.1','Which detail best shows that the new design worked?','The folded bridge held two trucks.',['They used two books.','It was Saturday.','Nia saw a cardboard box.'],'Holding two trucks is direct evidence that the folded bridge supported weight.'],
        ['Vocabulary in context','L.3.4','What does sagged mean in the story?','bent downward',['flew upward','became brighter','made a loud sound'],'The truck weighed down the flat paper, so it bent downward.'],
        ['Central message','RL.3.2','Which lesson does the story support?','Testing a new idea can help solve a problem.',['Every first try will work.','Writing notes is never useful.','Working together makes tasks impossible.'],'The first bridge failed, but a new design and more testing led to success.'],
        ['Grammar','L.3.1','Choose the verb: Yesterday, Nia ___ her idea.','tested',['test','testing','will test'],'Yesterday tells us to use the past tense: tested.'],
      ], prompt:'Explain how Nia responded when the first bridge did not work. Use two details from the story and explain what they show about her.'},
      {title:'A Garden That Saves Water', text:'A school garden needed frequent watering during hot weather. The garden club looked for ways to keep the soil moist. First, students covered the soil around the plants with dry leaves. This covering, called mulch, shaded the soil and slowed water loss. Next, they moved watering time from the middle of the day to early morning. Less water evaporated before it could soak into the ground. The students also checked the soil before watering. If it still felt damp, they waited. Over several weeks, the class used less water while the plants continued to grow. Their notes helped them decide which habits to keep.', questions:[
        ['Main idea','RI.3.2','What is the main idea of this text?','Changing garden habits can save water.',['Gardens cannot grow in warm weather.','Students should water only at noon.','Dry leaves stop all plant growth.'],'Mulch, morning watering, and checking the soil all helped the class use less water.'],
        ['Cause and effect','RI.3.3','How did mulch help the garden?','It shaded the soil and slowed water loss.',['It made the soil hotter.','It replaced the plant roots.','It stopped rain from falling.'],'The text explains that the leaf covering shaded the soil and slowed water loss.'],
        ['Vocabulary in context','L.3.4','What does moist mean in this text?','slightly wet',['very dusty','completely frozen','brightly colored'],'The students wanted water to stay in the soil; damp is another clue.'],
        ['Text evidence','RI.3.1','Which detail shows that the plan was successful?','Plants grew while the class used less water.',['The weather was hot.','The students belonged to a club.','The garden had soil.'],'Using less water while keeping the plants growing meets both goals of the plan.'],
        ['Conventions','L.3.2','Which sentence uses commas correctly in a list?','We used leaves, water, and soil.',['We, used leaves water and soil.','We used leaves water and, soil.','We used, leaves water and soil.'],'Commas separate the items in the list: leaves, water, and soil.'],
      ], prompt:'Explain two ways the students saved water. Use details from the text. End by explaining why their plan was useful.'},
    ],
  };
  function reading(grade) {
    return shuffle(texts[grade]).flatMap(passage => passage.questions.map(q => item(...q, {passage: passage.text, title: passage.title, writingPrompt: passage.prompt})));
  }
  return {math, spelling, reading};
})();
