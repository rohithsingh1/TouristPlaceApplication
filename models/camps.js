module.exports = function Camps(oldcart){
    this.camps = oldcart.camps || [];
    this.keys = function(campgroundid){
      var storedItem = camps.push(campgroundid);
      if(!storedItem){
          storedItem = camps[campgroundid];
      }
    };
}