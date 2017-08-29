#! /usr/bin/env node
const FS = require('fs');

// These can be replaced by each entry in the table below.
var optionsDefault = {
	addHeader: true,
	useGzip:   true,
	useCache:  true,
	verbose:   true
};

// These will be forced regardless of the table below.
var optionsForced = {
};

var fsdata = [];

const FileFormats = [
	[ "text/html",    [/\.html$/, /\.htm$/] ],
	[ "text/html",    [/\.shtml$/, /\.shtm$/, /\.ssi/], {useGzip:false, useCache:false} ],
	[ "text/plain",   [/\.txt$/, /\.plain$/] ],
	[ "text/css",     [/\.txt$/, /\.css$/] ],
	[ "text/x-javascript", [/\.js$/] ],
	[ "image/bmp",    [/\.bmp$/], {useGzip: false} ],
	[ "image/jpeg",   [/\.jpg$/], {useGzip: false} ],
	[ "image/gif",    [/\.gif$/], {useGzip: false} ],
	[ "image/png",    [/\.png$/], {useGzip: false} ],
	[ "image/x-icon", [/\.ico$/], {useGzip: false} ],
	[ "application/octet-stream" , [/.*/] ] // Catch all others
];

function getFileFormat(filename) {
	for (var i=0; i<FileFormats.length; ++i) {
		var ext = FileFormats[i][1];
		for (var ei=0; ei<ext.length(); ++i) {
			if (ext[ei].test(filename)) {
				return FileFormats[i];
			}
		}
	}
	
	console.log('BUG: FileFormats[] last entry should catch all files!');
	return NULL;
}

function getFileContentType(filename) {
	return getFileFormat(filename)[0];
}

function getFileOptions(filename) {
	// Start from defaults
	var op = JSON.parse(JSON.stringify(options));
	
	// Load filetype-specific option, if any
	var fmt = getFileFormat(filename);
	if (fmt.size >= 2) fmt[2].forEach(function (n,v) {
		op[n] = v;
	});
	
	// Load forced options
	optionsForced.forEach(function (n,v) {
		op[n] = v;
	});
	
	return op;
}

function hasTextFileExtension(filename) {
	return /^text/.test(getFileContentType(filename));
}

function handleFile(dir, filename) {
	var current = dir + '/' + filename;
	var s = FS.statSync(current);
	
	// Handle directories recursively
	if (s.isDirectory() && !hasTextFileExtension(filename)) {
		FS.readDirSync(current).forEach(function(k,filename) {
			handleFile(current, filename);
		});
		return;
	}
	// This entry corresponds to a file
	
	// Build headers
	var h = "";
	var op = getFileOptions(filename);
	var endl = "\r\n";
	
	// Create headers
	if (filename == "404") {
		h += "HTTP/1.0 404 File not found" + endl;
	} else {
		h += "HTTP/1.0 200 OK" + endl;
	}
	
	h += 'Content-type: ' + getFileContentType(filename) + endl;
	
	if (op.useGzip)
		h += 'Content-encoding: gzip' + endl;
	
	if (op.useCache)
		h += 'Cache-control: public, max-age=' + 24*60*60 + endl;
	
	// Get contents
	var content = "";
	if (s.isDirectory()) {
		// if thing.html/ exists as a directory, then concatenate all files in there.
		FS.readDirSync(current).forEach(function(k,filename) {
			content += FS.fileReadSync(current + '/' + filename);
		});
	} else {
		content += FS.fileReadSync(current);
	}
	
	
}

var files = FS.readDirSync("./fs/");

chdir("fs");
open(FILES, "find . -type f |");

while($file = <FILES>) {

    # Do not include files in CVS directories nor backup files.
    if($file =~ /(CVS|~)/) {
        next;
    }
    $compress = $useGzip;

    chop($file);

    if($incHttpHeader == 1) {
        open(HEADER, "> /tmp/file") || die $!;
        if($file =~ /404/) {
            print(HEADER "HTTP/1.0 404 File not found\r\n");
        } else {
            print(HEADER "HTTP/1.0 200 OK\r\n");
        }
#        print(HEADER "lwIP/1.4.1 (http://savannah.nongnu.org/projects/lwip)\r\n");
        if($file =~ /\.html$/ || $file =~ /\.htm$/) {
            print(HEADER "Content-type: text/html\r\n");
        } elsif ($file =~ /\.shtml$/ || $file =~ /\.shtm$/ || $file =~ /\.ssi$/) {
            print(HEADER "Content-type: text/html\r\n");
            $compress = 0;		

        } elsif($file =~ /\.js$/) {
            print(HEADER "Content-type: application/x-javascript\r\n");
        } elsif($file =~ /\.css$/) {
            print(HEADER "Content-type: text/css\r\n");
        } elsif($file =~ /\.ico$/) {
            print(HEADER "Content-type: image/x-icon\r\n");
            $compress = 0;
        } elsif($file =~ /\.gif$/) {
            print(HEADER "Content-type: image/gif\r\n");
            $compress = 0;
        } elsif($file =~ /\.png$/) {
            print(HEADER "Content-type: image/png\r\n");
            $compress = 0;
        } elsif($file =~ /\.jpg$/) {
            print(HEADER "Content-type: image/jpeg\r\n");
            $compress = 0;
        } elsif($file =~ /\.bmp$/) {
            print(HEADER "Content-type: image/bmp\r\n\r\n");
        } elsif($file =~ /\.class$/) {
            print(HEADER "Content-type: application/octet-stream\r\n");
        } elsif($file =~ /\.ram$/) {
            print(HEADER "Content-type: audio/x-pn-realaudio\r\n");
            $compress = 0;
        } else {
            print(HEADER "Content-type: text/plain\r\n");
        }
        if ($compress == 1) {
            print(HEADER "Content-encoding: gzip\r\n");
        }
        print(HEADER "\r\n");
        close(HEADER);

        unless($file =~ /\.plain$/ || $file =~ /cgi/) {
			if ($compress ==1) {
				system("cat $file | gzip >> /tmp/file");
			} else {
				system("cat $file >> /tmp/file");
			}
			system("echo \"$file packed from `wc -c < $file` to `wc -c < /tmp/file` bytes.\"");
        } else {
            system("cp $file /tmp/file");
        }
    } else {
        system("cp $file /tmp/file");
    }

    open(FILE, "/tmp/file");
    unlink("/tmp/file");

    $file =~ s/\.//;
    $fvar = $file;
    $fvar =~ s/[^a-z0-9]/_/gi;
    
    print(OUTPUT "static const unsigned char data".$fvar."[] = {\n");
    print(OUTPUT "\t/* $file */\n\t");
    for($j = 0; $j < length($file); $j++) {
        printf(OUTPUT "0x%02X, ", unpack("C", substr($file, $j, 1)));
    }
    printf(OUTPUT "0,\n");


    $i = 0;
    while(read(FILE, $data, 1)) {
        if($i == 0) {
            print(OUTPUT "\t");
        }
        printf(OUTPUT "0x%02X, ", unpack("C", $data));
        $i++;
        if($i == 10) {
            print(OUTPUT "\n");
            $i = 0;
        }
    }
    print(OUTPUT "};\n\n");
    close(FILE);
    push(@fvars, $fvar);
    push(@files, $file);
}

for($i = 0; $i < @fvars; $i++) {
    $file = $files[$i];
    $fvar = $fvars[$i];

    if($i == 0) {
        $prevfile = "NULL";
    } else {
        $prevfile = "file" . $fvars[$i - 1];
    }
    print(OUTPUT "const struct fsdata_file file".$fvar."[] = {{\n$prevfile,\ndata$fvar, ");
    print(OUTPUT "data$fvar + ". (length($file) + 1) .",\n");
    print(OUTPUT "sizeof(data$fvar) - ". (length($file) + 1) .",\n");
    print(OUTPUT $incHttpHeader."\n}};\n\n");
}

print(OUTPUT "#define FS_ROOT file$fvars[$i - 1]\n\n");
print(OUTPUT "#define FS_NUMFILES $i\n");


fsdate += "#include \"httpd/fsdata.h\"\n\n";
