var PORT = 11250;



var http = require('http');
var fs = require("fs");//file system
var url = require("url");//url module
var mime = require("./mime").types;
var config = require("./config");
var path = require('path');

var server = http.createServer(function(request, response) {
    
    var pathname = url.parse(request.url).pathname;
    var real_pathname = __dirname + '/files' + pathname;
    
  
	fs.exists(real_pathname,function(exist){
		if(!exist){
			console.log(real_pathname + ' is not found');
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.write("This request URL " + pathname + " was not found on this server.");
		 
			response.end();
			return;
		}//end if
		else {
			//get file type
                	var extend = path.extname(real_pathname);
                	
                	//any unknown file type is considered to be text/plain type
                	extend = extend ? extend.slice(1) : 'unknown';
                	
                	var contentType = mime[extend] || "text/plain";
                	
                	//-----response part------------------------------------
                    response.setHeader('Content-Type', contentType);
                    response.setHeader("Server", "Node.js/V5");
                    

			 fs.stat(real_pathname, function (err, stat) {
			 
			 
			 	var lastModified = stat.mtime.toUTCString();

                var ifModifiedSince = "If-Modified-Since".toLowerCase();
                //need to compare 
                response.setHeader("Last-Modified", lastModified);
                
                
                
                if (extend.match(config.Expires.fileMatch)) {

                    var expires = new Date();

                    expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);

                    response.setHeader("Expires", expires.toUTCString());

                    response.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

                }//end if extend match 
                
                if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {

                    response.writeHead(304, "Not Modified");

                    response.end();

                }//end if If_Modified_Since
                
                else {
	                //file exist, try to read a file
			fs.readFile(real_pathname,"binary", function(err, file) {
	
				if (err) {
					console.log(real_pathname + ' can not read the file');
                    response.writeHead(500, "Internal Server Error",{'Content-Type': 'text/plain'});

                    response.end(err);
                    return;

                } else {
                	
                	//-----response part------------------------------------
                    response.writeHead(200, "OK");

                    response.write(file, "binary");

                    response.end();

                }
			});	//end readFile
                
                }//end else 
                
                
			 });
			
		}// end else 
		
	});//end fs.exist
	
  
});

server.listen(PORT);