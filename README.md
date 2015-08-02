Welcome

this is a test of Local View Html Wiki Github you can find it in https://github.com/erikhu/Local-View-Html-Wiki-Github

in this test just change the line 18 in js/personalizacion.js
	-http.open("GET" ,"file:///home/erik/apis/wikiLibgdx/libgdx.wiki/"+e.getAttribute("direccion"),false);

	by:
	
	http.open("GET" ,"file://complete path dir wiki"+e.getAttribute("direccion"),false);

i just test in Gnu/linux Debian


