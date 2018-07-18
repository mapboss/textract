var path = require( 'path' )
  , exec = require( 'child_process' ).exec
  , extract = require( 'pdf-extract' )
  ;

function extractText( filePath, options, cb ) {
  // See https://github.com/dbashford/textract/issues/75 for description of
  // what is happening here
  var pdfExtractOptions = options.pdfExtractOptions || { type: 'ocr',
    clean: false,
    ocr_flags: [
      '-psm 1',       // automatically detect page orientation
      '-l eng+tha',       // use a custom language file
    ]
  }
  , processor;
  pdfExtractOptions.ocr_flags = pdfExtractOptions.ocr_flags || options.pdfExtractOptions.ocr_flags;
  processor = extract( filePath, pdfExtractOptions, function( error ) {
    if ( error ) {
      error = new Error( 'Error extracting PDF text for file at [[ ' +
        path.basename( filePath ) + ' ]], error: ' + error.message );
      cb( error, null );
      return;
    }
  });

  processor.on( 'complete', function( data ) {
    cb( null, data.text_pages.join( ' ' ) );
  });
  processor.on( 'error', function( err ) {
    console.log( err, 'error while extracting pages' );
  });
}

function testForBinary( options, cb ) {
  exec( 'pdftotext -v',
    function( error, stdout, stderr ) {
      var msg;
      if ( stderr && stderr.indexOf( 'pdftotext version' ) > -1 ) {
        cb( true );
      } else {
        msg = 'INFO: \'pdftotext\' does not appear to be installed, ' +
         'so textract will be unable to extract PDFs.';
        cb( false, msg );
      }
    }
  );
}

module.exports = {
  types: ['application/pdf'],
  extract: extractText,
  test: testForBinary
};
