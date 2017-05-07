// http://stackoverflow.com/questions/3396088/how-do-i-remove-an-object-from-an-array-with-javascript
Array.prototype.remove = function(v) {
   let idx = -1;
   if ((idx = this.indexOf(v)) != -1) {
      this.splice(idx, 1);
      return true;
   }
   return false;
}

Array.prototype.removeByIndex = function(i) {
   return this.splice(idx, 1);
}