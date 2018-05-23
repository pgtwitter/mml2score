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
	for (let i = 0; i < data0.length; i++) {
		const obj = data0[i];
		const note = {};
		note.clef = 'treble';
		note.duration = obj.length == 0 ? 'q' : obj.length + '';
		if (obj.command == 'note') {
			note.keys = [obj.tone + '/4'];
		} else if (obj.command == 'rest') {
			note.keys = ['b/4'];
			note.duration += 'r';
		}
		notes.push(new VF.StaveNote(note));
	}
	return notes;
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
