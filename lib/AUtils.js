var fs = require('fs');
var path = require('path');
var shell = require('shelljs');
var osTools = require('./osTools');

if (!global.Approvals) global.Approvals = {};
if (!global.Approvals._cachedProgramLookups) global.Approvals._cachedProgramLookups = {};

var createEmptyFileIfNotExists = function (file) {
	if (!fs.existsSync(file)) {
		fs.writeFileSync(file, "");
	}
};

var assertFileExists = function (file) {
	if (!fs.existsSync(file)) {
		throw "File not found: " + file;
	}
};

// copied and modified from http://stackoverflow.com/questions/10225399/check-if-a-file-is-binary-or-ascii-with-node-js
var isBinaryFile = function (buffer) {

	var charCode, contentStartBinary, contentStartUTF8, i, _i, _ref;
	contentStartBinary = buffer.toString('binary', 0, 24);
	contentStartUTF8 = buffer.toString('utf8', 0, 24);

	for (i = _i = 0, _ref = contentStartUTF8.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
		charCode = contentStartUTF8.charCodeAt(i);
		if (charCode === 65533 || charCode <= 8) {
			return true;
		}
	}
	return false;
};

var findProgramOnPath = function (programName) {

	if (global.Approvals._cachedProgramLookups[programName]) {
		return global.Approvals._cachedProgramLookups[programName];
	}
	var output = shell.exec(osTools.findProgramPathCommand + " " + programName, { silent: true }).output;

	var result = null;
	if (output) {
		var file = output.split("\n")[0].trim();

		var fixedFile = fixFilePathSlashes(file);
		if (fs.existsSync(fixedFile)) {
			result = fixedFile;
		}
	}

	global.Approvals._cachedProgramLookups[programName] = result;
	return result;
};

var findWindowsExecutable = function (folderInProgramInFiles, fileName) {

	if (arguments.length === 1) {
		fileName = folderInProgramInFiles;
		folderInProgramInFiles = null;
	}

	var programOnPath = findProgramOnPath(fileName);
	if (programOnPath) {
		return programOnPath;
	}

	var searchedInPaths = [];

	//TODO: find a way to get at the environment variables for ProgramFiles and ProgramFiles(x86)
	// for now hard code it...

	function findInPath(root, dir, file) {
		var fullPath = path.join(root, dir, file);
		var fixedFullPath = fixFilePathSlashes(fullPath);

		searchedInPaths.push(fixedFullPath);

		if (fs.existsSync(fixedFullPath)) {
			return fixedFullPath;
		}
		return null;
	}

	function lookInProgramFiles(fileName) {
		var tryVar = findInPath("C:/Program Files", folderInProgramInFiles, fileName);
		if (tryVar) {
			return tryVar;
		}

		tryVar = findInPath("C:/Program Files (x86)", folderInProgramInFiles, fileName);
		if (tryVar) {
			return tryVar;
		}

		return null;
	}

	var fileFound = lookInProgramFiles(fileName);
	if (fileFound) {
		return fileFound;
	}

	var suffix = ".exe";
	if (fileName.indexOf(suffix, fileName.length - suffix.length) === -1) {
		fileFound = lookInProgramFiles(fileName + ".exe");
		if (fileFound) {
			return fileFound;
		}
	}

	console.log(searchedInPaths);

	return null;
};

var fixFilePathSlashes = function (path) {
	return (path || '').replace(/\\/g, '/');
};


module.exports = {
	createEmptyFileIfNotExists: createEmptyFileIfNotExists,
	assertFileExists: assertFileExists,
	isBinaryFile: isBinaryFile,
	findProgramOnPath: findProgramOnPath,
	findWindowsExecutable: findWindowsExecutable,
	fixFilePathSlashes: fixFilePathSlashes
};


