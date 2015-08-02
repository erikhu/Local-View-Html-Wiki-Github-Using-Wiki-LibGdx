 /**

 * @fileoverview  Visor Docs Github 

 *

 * @version                               1.0

 *

 * @author                 Erik Alexander Gonzalez Cardona <erikhuboy@gmail.com >

 * @copyleft         eriksoft.co

 **/
	function presionLink(e){		
		var http = new XMLHttpRequest();
		http.open("GET" ,"file:///home/erik/apis/wikiLibgdx/libgdx.wiki/"+e.getAttribute("direccion"),false);
		http.send(null);
		if(http.status == 200){
			var convertidor = new showdown.Converter();
			var html = convertidor.makeHtml(http.responseText);
			document.getElementById("contenido").innerHTML = html ; 
		}
	}

	function cargarArchivo(e){
		var archivo = e.target.files[0];
		if(archivo){
			var lector = new FileReader();
			lector.readAsText(archivo);
			lector.onload = function(ev){
				var objeto = JSON.parse(ev.target.result)
				document.getElementById("titulo").innerHTML = objeto[0].name;
				function recursividad(lista , arreglo){	
					for(var it = 0 ; it < arreglo.length ; it++){
						if(arreglo[it].type=="directory"){
							
							var l = document.createElement("ul");
							l.setAttribute("class", "list-group");
							var fila = document.createElement("li");
							var titulo = document.createElement("h4");
							
							/*Coloca el titulo de forma apropiada dentro de la lista nueva*/
							var cant = arreglo[it].name.split("/").length;
							titulo.textContent = arreglo[it].name.split("_").join(" ");	
							if(cant >1){
								titulo.textContent = arreglo[it].name.split("/")[cant-1].split("_").join(" ");	
							}
							
							fila.appendChild(titulo);
							l.appendChild(titulo);
							recursividad(l , arreglo[it].contents);
							lista.appendChild(l);
						}
						if(arreglo[it].type=="file"){
							var fila = document.createElement("li");
							fila.setAttribute("type","button");
							fila.setAttribute("class","list-group-item")
							var enlace = document.createElement("a");
							enlace.setAttribute("onclick","presionLink(this)");
							var direccion = document.createAttribute("direccion");
							enlace.innerHTML = arreglo[it].name;
							direccion.value  = enlace.textContent;	
							enlace.setAttributeNode(direccion);
							
							var cant = arreglo[it].name.split("/").length;
							
							var nombre = arreglo[it].name.split("/")[cant-1]
							enlace.innerHTML = nombre.substr(0,nombre.length-3).split("-").join(" ");
							
							fila.appendChild(enlace);
							lista.appendChild(fila);
						}
					}
				}	

				var li  = document.createElement("ul");
				li.setAttribute("class", "list-group");
				recursividad(li,objeto[0].contents);
				presionLink(li.getElementsByTagName("a")[0]);
				document.getElementById("index").appendChild(li);
			};
		}
	}

	

	document.getElementById("archivo").addEventListener('change',cargarArchivo,false);
