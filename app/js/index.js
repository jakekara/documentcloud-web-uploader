"use strict";

const documentcloud = require("documentcloud");
var client;

function setUploadsDisabled(tf){
    var upload = document.getElementById("upload");
    upload.disabled = tf;
}

function enableUploads(){
    setUploadsDisabled(false);
}

function disableUploads(){
    setUploadsDisabled(true);
}

function setConnectionStatus(status_code){

    var connection = document.getElementById("connection-status");
    var msg = "";
    
    switch(status_code){
    case 200:
	msg = "Connected :)";
	enableUploads();
	break;
    default:
	msg = "Connection failed :("
	disableUploads();
	break;
    }

    connection.innerHTML = msg;
    
}

function populateProjects(projects){

    var selector = document.getElementById("project");    

    function addItem(id, title){
	var new_opt = document.createElement("option");
	new_opt.innerHTML = title;
	new_opt.value = id;
	selector.appendChild(new_opt);
    }

    selector.innerHTML = "";

    addItem(null, "None");

    projects.forEach(function(p){
	addItem(p["id"], p["title"]);
    });
}

function connectToDocumentCloud(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    client = new documentcloud(username, password);

    client.projects.list(function(x, y, z){
	setConnectionStatus(y["status_code"]);

	if (y["status_code"] == 200){
	    populateProjects(y["response"]["projects"]);
	}
	
    });
}

function getSelectedProject(){

    var selector = document.getElementById("project")
    var i = selector.selectedIndex;
    var proj = selector.options[i];

    return proj;
}

function getSelectedProjectId(){

    var ret = Number(getSelectedProject().value);
    if ( ret > 0){ return ret; }
    return null;
}

function setUploadStatus(obj){

    var div = document.getElementById("upload-status");
    div.innerHTML = "";    
    
    var status_code = obj["status_code"];

    if (status_code != 200){
	div.innerHTML = "Upload failed :(";
	return;
    }

    var can_url = obj["response"]["canonical_url"];

    var msg = document.createElement("a")
    msg.innerHTML = "Uploaded document URL: " + can_url
    div.appendChild(msg);

}

function uploadDocument(){

    connectToDocumentCloud();

    var url = validateUrl();
    var title = document.getElementById("title").value;
    var description = document.getElementById("description").value;
    var opts = {
	"description":description
    };

    var proj_id = getSelectedProjectId();
    if ( Number(proj_id) > 0 ){ opts["project"] = proj_id; }


    if (url == null){ return; }

    client.documents.upload(url, title, opts, function(x, y, z){
	setUploadStatus(y);
    });
    
}

function validateUrl(){
    var url = document.getElementById("url");
    return url.value;
}

// bind connect button
document.getElementById("connect").addEventListener("click", connectToDocumentCloud);

// bind upload button
document.getElementById("upload").addEventListener("click", uploadDocument);

// set up empty project list
populateProjects([]);

disableUploads();
