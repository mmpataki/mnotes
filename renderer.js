var IconButtons = [

	{
		'parent': 'headerISet',
		'icons': [
			{ 'icon': 'notebook.png', 'class': 'iconleft', 'desc': 'New Notebook', 'func': 'create_notebook' },
			{ 'icon': 'note.png', 'class': 'iconleft', 'desc': 'New Note', 'func': 'create_note' },
			{ 'icon': 'about.png', 'class': 'iconright', 'desc': 'About Creator', 'func': 'show_aboutus' },
			{ 'icon': 'settings.png', 'class': 'iconright', 'desc': 'Settings', 'func': 'show_settings' }
		]
	},
	{
		'parent': 'editorhelperISet',
		'icons': [
			{ 'icon': 'attachment.png', 'class': 'iconleft', 'desc': 'Add an attachment', 'func': 'add_attachment' },
			{ 'icon': 'preview.png', 'class': 'iconleft', 'desc': 'Preview', 'func': 'show_preview' },
			{ 'icon': 'html.png', 'class': 'iconleft', 'desc': 'Export to HTML', 'func': 'export_html' },
			{ 'icon': 'pdf.png', 'class': 'iconright', 'desc': 'Export to PDF.', 'func': 'export_pdf' },
			{ 'icon': 'delete.png', 'class': 'iconright', 'desc': 'Delete this note', 'func': 'delete_note' },
			{ 'icon': 'save.png', 'class': 'iconright', 'desc': 'Save Note', 'func': 'save_note' }
		]
	}
];

var iconSet = "assets/iconset3/";
var iconWidth = 25;
var iconHeight = 25;
var iconPadding = 5;
var mmlbox, notebooklist, notelist, previewpane, nbname, nbnameval, selli;

/* utils */
var paths, fs;
var unusables = ['/', '?', ':', '>', '<', '*', '`', '@', '!', '\\', '|'];

/* Global variables */
var HOME = "";
var MNOTESHOME = ".mNotes";
var MNOTES_NB_LIST_FILE = ".mNoteBookList.json";
var MNOTES_LIST_FILE_NAME;
var MNOTES_STYLE_FILE_NAME = "noteModifiers.json";
var MNOTES_DEFLIST_FILE_NAME = ".mNoteList.json";
var MNOTES_GLOBAL_SCRIPTS = "globalstyles.js";
var MNOTES_GLOBAL_STYLES = "globalstyles.css";
var MNOTES_BOOTSTRAP_FILE = "bootstrap.min.css";
var MNOTES_ASSETS_FOLDER = "assets";
var MNOTES_CUR_DIRECTORY = "";
var MNOTES_SELNOTE = "";
var MNOTES_SELNB = "";

/* GLOBAL TEXT DATA */
var MNOTES_NB_LIST = {};
var MNOTES_LIST = {};
var MNOTES_STYLES = {};

window.onload = function () {

	for (var j = 0; j < IconButtons.length; j++) {
		var panel = G(IconButtons[j].parent);
		for (var i = 0; i < IconButtons[j].icons.length; i++) {
			panel.innerHTML +=
				"<div class='" + IconButtons[j].icons[i].class + "' title='" + IconButtons[j].icons[i].desc + "' onclick='" + IconButtons[j].icons[i].func + "()'>" +
				"<img align='center' src='" + iconSet + IconButtons[j].icons[i].icon + "' height='" + iconHeight + "' width='" + iconWidth + "' />" +
				"</div>";
		}
	}
	mmlbox = G('mmlbox');
	previewpane = G("previewpane");
	notelist = G('notelist');
	notebooklist = G('notebooklist');
	nbname = G("nbname");
	nbnameval = G("nbnameval");

	/* do initialisation stuff here. */

	paths = require('path');
	fs = require('fs');
	const { ipcRenderer } = require('electron');

	ipcRenderer.on('asynchronous-reply', (event, arg) => {

		HOME = arg;
		MNOTESHOME = paths.join(HOME, MNOTESHOME);
		MNOTES_NB_LIST_FILE = paths.join(MNOTESHOME, MNOTES_NB_LIST_FILE);
		MNOTES_GLOBAL_SCRIPTS = paths.join(MNOTESHOME, MNOTES_GLOBAL_SCRIPTS);
		MNOTES_GLOBAL_STYLES = paths.join(MNOTESHOME, MNOTES_GLOBAL_STYLES);
		MNOTES_BOOTSTRAP_FILE = paths.join(MNOTESHOME, MNOTES_BOOTSTRAP_FILE);

		get_notes();
		get_styles();

	})
	ipcRenderer.send('asynchronous-message', ['home'])

}

function get_styles() {
	mreadfile(paths.join(MNOTESHOME, MNOTES_STYLE_FILE_NAME), (err, data) => {
		MNOTES_STYLES = JSON.parse(data);
	});
}

function mwritefile(filename, data) {
	fs.writeFile(filename, data, (err) => {
		console.log("Write Error occured => " + err);
	});
}

function mreadfile(filename, callback) {
	fs.readFile(filename, "UTF-8", callback);
}

function defcallback(err, data) {
	if (err) {
		mwritefile(filename, wrtdata);
	}
}

/* reading notebooks */
function addnotebook_toview(name) {
	notebooklist.innerHTML += `<li class='unselected' onclick='hc(this)' ondblclick='open_notebook(this.innerText)'>${name}</li>`;
}
function get_notes() {
	notebooklist.innerHTML = "";
	mreadfile(MNOTES_NB_LIST_FILE, (err, data) => {
		MNOTES_NB_LIST = JSON.parse(data);
		for (var key in MNOTES_NB_LIST) {
			addnotebook_toview(key);
		}
	});
}
function create_notebook() {	//verified works...
	openNav("notebooknameprompt");
}
function close_notebook() {  	//verified works....
	notebooklist.style.display = "block";
	notelist.style.display = "none";
	save_notebook();
	nbnameval.innerText = "";
	MNOTES_SELNB = "";
	MNOTES_SELNOTE = "";
}
function open_notebook(name) { 	//verified works....

	/* open the note here */
	MNOTES_SELNB = name;
	MNOTES_CUR_DIRECTORY = paths.join(MNOTESHOME, name);
	MNOTES_LIST_FILE_NAME = paths.join(MNOTES_CUR_DIRECTORY, MNOTES_DEFLIST_FILE_NAME);
	var data = mreadfile(MNOTES_LIST_FILE_NAME, (err, data) => {

		if (err != null) {
			MNOTES_LIST = {};
			save_notebook();
			return;
		}

		MNOTES_LIST = JSON.parse(data);
		notelist.innerHTML = "";

		add_notes_to_view();

		notebooklist.style.display = "none";
		notelist.style.display = "block";
	});
	nbnameval.innerText = name;
}

function add_notes_to_view() {
	notelist.innerHTML = "";
	for (var key in MNOTES_LIST) {
		addnote_toview(key);
	}
}

function save_notebook() {	//verified works...
	mwritefile(MNOTES_LIST_FILE_NAME, JSON.stringify(MNOTES_LIST));
}

function addnote_toview(name) { //verified works...
	notelist.innerHTML += `<li class='unselected' onclick='hc(this)' ondblclick='opennote(this)'>${name}</li>`
}
function create_note() {	//verified works....
	mprompt();
}
function save_note() {		//verified works....
	mwritefile(paths.join(MNOTES_CUR_DIRECTORY, MNOTES_SELNOTE + ".mml"), mmlbox.value);
}
function opennote(ele) {
	if (MNOTES_SELNOTE != "") {
		save_note(); /* save the current note */
	}
	MNOTES_SELNOTE = ele.innerText;
	mreadfile(paths.join(MNOTES_CUR_DIRECTORY, MNOTES_SELNOTE + ".mml"), (err, data) => {
		mmlbox.value = "";
		insertAtCursor(data);
		previewpane.srcdoc = parseNote(mmlbox.value);
		toggle_display("none", "block");
	});
}

function delete_note() {
	if (confirm("Are you sure to delete this note")) {
		delete MNOTES_LIST[MNOTES_SELNOTE];
		save_notebook();
		show_defnote();
		add_notes_to_view();
	}
}

function delete_notebook() {
	if (confirm("Are you sure to delete this notebook")) {
		delete MNOTES_NB_LIST[MNOTES_SELNB];
		close_notebook();
		mwritefile(MNOTES_NB_LIST_FILE, JSON.stringify(MNOTES_NB_LIST));
		get_notes();
	}
}

function show_defnote() {
	mmlbox.value = "";
	show_preview();
}

function get_default_note(note) {
	return `@header ${note.name} @br@ ${Date.parse(note.cdt).toLocaleString()} @br@ ${Date.parse(note.mdt).toLocaleString()} @`;
}

/* utils */
function show_invalid_name_message() {
	alert(`The notebook/note name cannot be\n 1. empty string\n 2. cannot contain [ ${unusables} ].`);
	nbname.focus();
}
function isvalidname(name) {
	if (name == "")
		return false;
	for (var i = 0; i < unusables.length; i++) {
		if (name.includes(unusables[i]))
			return false;
	}
	return true;
}

function show_aboutus() {
	openNav("aboutus");
}
function show_settings() {
}
function add_attachment() {

	const { dialog } = require('electron').remote;
	const fse = require('fs-extra');

	var files = dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
	var toins = "";
	for (var i = 0; i < files.length; i++) {
		var fnamesplits = files[i].split(paths.sep);
		var path = paths.join(MNOTES_CUR_DIRECTORY, MNOTES_ASSETS_FOLDER, fnamesplits[fnamesplits.length-1]);
		fse.copy(files[i], path);
		toins += `@img[src='${path}'] @\n`;
	}
	insertAtCursor(toins);
}
function show_preview(type) {

	if (mmlbox.style.display == "none") {
		toggle_display("block", "none");
		return;
	}
	previewpane.srcdoc = parseNote(mmlbox.value);
	toggle_display("none", "block");
}
function export_pdf() {
	const ipc = require('electron').ipcRenderer;
	ipc.on('wrote-pdf', function (event, path) {
		const message = `Wrote PDF to: ${path}`;
		alert(message);
	});
	var xpath = paths.join(MNOTESHOME, ".temp.html");
	mwritefile(xpath, parseNote(mmlbox.value));
	ipc.send('asynchronous-message', ['print-to-pdf', xpath]);
}

function export_html() {
	var html = parseNote(mmlbox.value);
	html = html.replace(/</g, "&lt;");
	html = html.replace(/>/g, "&gt;");
	previewpane.srcdoc = packpage(`${MNOTES_STYLES['code'].open} ${html} ${MNOTES_STYLES['code'].close}`);
	toggle_display("none", "block");
}

function toggle_display(formmlbox, forpreviewpane) {
	mmlbox.style.display = formmlbox;
	previewpane.style.display = forpreviewpane;
}
function G(name) {
	return document.getElementById(name);
}
function hc(cur) {
	if (selli != null) {
		selli.className = "unselected";
	}
	selli = cur;
	cur.className = "selected";
}
function insertAtCursor(itext) {
	//IE support
	if (document.selection) {
		mmlbox.focus();
		sel = document.selection.createRange();
		sel.text = itext;
	}
	// Microsoft Edge
	else if (window.navigator.userAgent.indexOf("Edge") > -1) {
		var startPos = mmlbox.selectionStart;
		var endPos = mmlbox.selectionEnd;

		mmlbox.value = mmlbox.value.substring(0, startPos) + itext
			+ mmlbox.value.substring(endPos, mmlbox.value.length);

		var pos = startPos + itext.length;
	}
	//MOZILLA and others
	else if (mmlbox.selectionStart || mmlbox.selectionStart == '0') {
		var startPos = mmlbox.selectionStart;
		var endPos = mmlbox.selectionEnd;
		mmlbox.value = mmlbox.value.substring(0, startPos)
			+ itext
			+ mmlbox.value.substring(endPos, mmlbox.value.length);
	} else {
		mmlbox.value += itext;
	}
	mmlbox.focus();
}

function mprompt() {
	openNav("notenameprompt");
}
function nbname_submit() {
	
	var newnbname = nbname.value;
	if (!isvalidname(newnbname)) {
		show_invalid_name_message();
		return;
	}

	/* create directory */
	var dpath = paths.join(MNOTESHOME, newnbname);
	var exists = null;
	fs.mkdir(dpath, (err) => { exists = err; });
	fs.mkdir(Paths.join(dpath, MNOTES_ASSET_FOLDER), (err) => { exists = err; });

	if (exists != null) {
		alert("NoteBook already exists!");
		return;
	}

	MNOTES_NB_LIST[newnbname] = { 'cdate': Date.now(), 'ldate': Date.now() };
	mwritefile(MNOTES_NB_LIST_FILE, JSON.stringify(MNOTES_NB_LIST));

	/* write the notelist file in directory with a null set. */
	MNOTES_LIST = {};
	mwritefile(paths.join(dpath, MNOTES_DEFLIST_FILE_NAME), JSON.stringify(MNOTES_LIST));

	/* add to view. */
	addnotebook_toview(newnbname);
	closeNav();
}
function notenamesubmit() {
	var name = G("notename").value;
	if (name != null && isvalidname(name)) {
		var newn = MNOTES_LIST[name] = { 'cdt': Date.now(), 'mdt': Date.now() };
		save_notebook();
		mwritefile(paths.join(MNOTES_CUR_DIRECTORY, name + ".mml"), get_default_note(name));
		addnote_toview(name);
	} else {
		show_invalid_name_message();
	}
	closeNav();
}

function openNav(opt) {
	var nav = G("myNav");
	var od = G(opt);
	od.style.display = "block";
	nav.style.display = "block";
	nav.style.height = "100%";
}
function closeNav() {
	var eles = document.getElementsByClassName("overlay-content");
	for (var i = 0; i < eles.length; i++) {
		eles[i].style.display = "none";
	}
	G("myNav").style.height = "0%";
}





/*************************** CORE THINK TWICE BEFORE YOU TOUCH ***********************/

/* splits at specified string only once reataining other part */
function msplitchar(str, at) {
	var ret = str.split(at, 1);
	ret.push(str.substr(str.indexOf(at) + at.length));
	return ret;
}
function msplit(str) {

	var i = 0;
	for (; i < str.length; i++)
		if (" \t\n\r".includes(str[i]))
			break;
	for (; i < str.length; i++)
		if (!" \t\n\r".includes(str[i]))
			break;
	var ret = str.split(/[ \t\n\r]/, 1);
	ret.push(str.substr(i));
	return ret;
}

function mreplace(str, find, rep) {
	return str.replace(new RegExp(find, 'g'), rep);
}

function parseNote(content = "") {

	content = content.replace(/\\@/g, "&at;");
	content = content.replace(/\\\\/g, "&slash;");
	content = mreplace(content, "<", "&lt;");
	content = mreplace(content, ">", "&gt;");

	var rawsplit = content.split("@");
	var ret = "";
	var stk = [];

	ret += rawsplit[0];

	for (var i = 1; i < rawsplit.length; i++) {

		if (rawsplit[i].trim() == "") {
			if (stk.length == 0) {
				break;
			}
			ret += handlepop(stk.pop());
			continue;
		}

		if (" \t\n\r".includes(rawsplit[i].charAt(0))) {
			ret += handlepop(stk.pop());
			ret += rawsplit[i];
			continue;
		}

		/* get the tag & attributes out */
		var tagcomps;
		var parindex = rawsplit[i].indexOf('[');
		var spaindex = msplit(rawsplit[i])[0].length;

		if (spaindex == -1 || parindex == -1) {
			if (spaindex != -1) {
				tagcomps = msplit(rawsplit[i]);
			} else {
				tagcomps = msplitchar(rawsplit[i], "]");
			}
		} else if (spaindex > parindex) {
			tagcomps = msplitchar(rawsplit[i], "]");
		} else {
			tagcomps = msplit(rawsplit[i]);
		}

		/* push the tag */
		var tagnattr = tagcomps[0].split("[", 2);

		stk.push(tagnattr[0]);
		ret += handlepush(tagnattr);

		ret += `<${tagnattr[0]}`;

		if (tagnattr.length > 1 && MNOTES_STYLES[tagnattr[0]] == null) {
			tagnattr[1] = tagnattr[1].replace("]", "");
			ret += ` ${tagnattr[1].trim()}`;
		}
		ret += ">";
		if (tagcomps.length > 1) {
			ret += tagcomps[1];
		}
	}

	while (stk.length != 0) {
		ret += handlepop(stk.pop());
	}

	ret = mreplace(ret, "&at;", "@");
	ret = mreplace(ret, "&slash;", "\\");

	for (var key in MNOTES_STYLES) {
		ret = mreplace(ret, `<${key}>`, "");
		ret = mreplace(ret, `</${key}>`, "");
	}

	return packpage(ret);
}

function packpage(ret) {
	return (
		`
<html>
	<head>
		<link rel='stylesheet' href='file://${MNOTES_BOOTSTRAP_FILE}'></link>
		<link rel="stylesheet" href='file://${MNOTES_GLOBAL_STYLES}'></link>
		<script src='file://${MNOTES_GLOBAL_SCRIPTS}'></script>
	</head>
	<body>
		${ret}
	</body>
</html>`
	);
}
function handlepop(val) {
	var ret = `</${val}>`;
	if (MNOTES_STYLES[val] != null) {
		ret += MNOTES_STYLES[val].close;
	}
	return ret;
}
function handlepush(val) {
	if (MNOTES_STYLES[val[0]] != null) {
		var attr = val.length == 2 ? val[1] : "";
		return MNOTES_STYLES[val[0]].open.replace("$", attr);
	}
	return "";
}
