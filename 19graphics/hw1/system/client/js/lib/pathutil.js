"use strict";

window.MY_ROOT_PATH = "";
function getPath(path) {
  	if (!path || path.length < 1) {
    	return;
  	}

  	return MY_ROOT_PATH + path;
}
window.getPath = getPath;
function setPath(path) {
  	MY_ROOT_PATH = path;
}
window.setPath = setPath;

function getCurrentPath(path) {
    let slashIdx = path.lastIndexOf('/');
    if (slashIdx === -1) {
        slashIdx = path.lastIndexOf('\\');
    }

    return path.substring(0, slashIdx + 1);
}
window.getCurrentPath = getCurrentPath;
