const mml = require('music-macro-language');
const Vex = require('VexFlow');
const VF = Vex.Flow;
document.getElementById('mmlInput')
	.addEventListener('keyup', function(e) {
		if (e.keyCode == 13)
			draw(this.value);
	});
draw(document.getElementById('mmlInput').value);

function draw(mmlString) {
	if (!mmlString || mmlString.length == 0) return;
	const mmlArray = parseMML(mmlString);
	const notes = getNotes(mmlArray);
	const [context, stave] = getScoreLinesContext('staveDiv', notes.length);
	VF.Formatter.FormatAndDraw(context, stave, notes);
}

function parseMML(data) {
	if (!data.match(/;$/)) data += ';';
	return mml.parse(data)
}

function getNotes(data) {
	const notes = [];
	const data0 = data[0];
	let octave = 4;
	let n= 0;
	for (let i = 0; i < data0.length; i++) {
		const obj = data0[i];
		const note = {};
		note.clef = 'treble';
		obj.length = (obj.length == 0) ? 4 : obj.length;
		note.duration = obj.length + '';
		if (obj.command == 'note') {
			note.keys = [obj.tone + '/' + octave];
		} else if (obj.command == 'rest') {
			note.keys = ['b/4'];
			note.duration += 'r';
		} else if (obj.command == 'octave_up') {
			octave += 1;
			continue;
		} else if (obj.command == 'octave_down') {
			octave -= 1;
			continue;
		} else {
			console.warn('skip', obj);
			continue;
		}
		const sNote = new VF.StaveNote(note);
		if (obj.dots)
			dots(sNote, obj.dots);
		if (obj.accidentals)
			accidentals(sNote, obj.accidentals);
		notes.push(sNote);
	}
	return notes;
}

function dots(sNote, dots) {
	for (let j = 0; j < dots.length; j++) {
		const dot = dots[j];
		if (dot != '.') continue;
		sNote.addDot(0)
	}
}

function accidentals(sNote, accidentals) {
	for (let j = 0; j < accidentals.length; j++) {
		const acc = accidentals[j];
		if (acc != '+' && acc != '-') continue;
		const accVex = acc == '+' ? '#' : (acc == '-') ? 'b' : acc;
		sNote.addAccidental(0, new VF.Accidental(accVex));
	}
}

function getScoreLinesContext(id, n) {
	var div = document.getElementById(id)
	div.innerHTML = '';
	var renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
	renderer.resize(50 + n * 35, 500);
	var context = renderer.getContext();
	var stave = new VF.Stave(10, 40, 35 + n * 35);
	stave.addClef('treble') //.addTimeSignature('4/4');
	stave.setContext(context).draw();
	return [context, stave];
}
