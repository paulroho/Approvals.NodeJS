var assert = require("assert");
var StringWriter = require("../lib/StringWriter.js");
var File = require("file-utils").File;
var fs = require('fs');


// Write out contest to file (leveraging the Namer)
// Responsible for 'type' of the file.


describe('StringWriter', function () {

	describe('', function () {
		it('should default to type of txt', function () {
			var stringWriter = new StringWriter("HELLO");
			assert.equal(stringWriter.getFileExtension(), "txt");
		});

		it('should allow type to be specified', function () {
			var stringWriter = new StringWriter("HELLO", "html");
			assert.equal(stringWriter.getFileExtension(), "html");
		});

		it('should write out file', function (done) {
			var stringWriter = new StringWriter("HELLO");

			var settings = {
				prefix: "foo",
				suffix: "bar",
				directory: __dirname
			};

			File.createTempFile(settings, function (error, file) {
if(error) throw error;
				var filePath = file.getPath();

				stringWriter.write(filePath);

				fs.readFile(filePath, 'utf8', function (err, data) {
					assert.equal(data, "HELLO");
					done();
				});
			});
		});
	});
});