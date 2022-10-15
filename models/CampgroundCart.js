module.exports = function CampgroundCart(oldcart){
 this.campground = oldcart.campground || {};
 this.duplicatecampground = oldcart.duplicatecampground || {};
 this.camps = oldcart.camps || [];
 this.duplicatecamps = oldcart.duplicatecamps || [];
 this.totalqty = oldcart.totalqty || 0;
 this.current = oldcart.current || 0;
 this.add = function(campgroundId,registerId,register){
    var storedItem = this.campground[campgroundId];
    if(!storedItem){
        storedItem = this.campground[campgroundId] = {
                                                       qty2:0,
                                                       campgroundid:campgroundId,
                                                        newregister:[],
                                                        register1:[]
                                                       
                                                            };
    }
    var size = this.campground[campgroundId].newregister.length;
    if(size>0){
        for(var i=0;i<size;i++){
            if(this.campground[campgroundId].newregister.indexOf(registerId)===-1){
                this.campground[campgroundId].newregister.push(registerId);
                this.campground[campgroundId].register1.push(register);
            }
        }
    }else{
        this.campground[campgroundId].newregister.push(registerId);
                this.campground[campgroundId].register1.push(register);
    }
    
    storedItem.qty2++;
    this.qty = storedItem.qty2;
    this.totalqty++;
 };
 this.duplicateadd = function(campgroundId,registerId,register){
    var storedItem = this.duplicatecampground[campgroundId];
    if(!storedItem){
        storedItem = this.duplicatecampground[campgroundId] = {
                                                       qty2:0,
                                                       campgroundid:campgroundId,
                                                        newregister:[],
                                                        register1:[]
                                                       
                                                            };
    }
    var size = this.duplicatecampground[campgroundId].newregister.length;
    if(size>0){
        for(var i=0;i<size;i++){
            if(this.duplicatecampground[campgroundId].newregister.indexOf(registerId)===-1){
                this.duplicatecampground[campgroundId].newregister.push(registerId);
                this.duplicatecampground[campgroundId].register1.push(register);
            }
        }
    }else{
        this.duplicatecampground[campgroundId].newregister.push(registerId);
                this.duplicatecampground[campgroundId].register1.push(register);
    }
    
    storedItem.qty2++;
    this.qty = storedItem.qty2;
    this.totalqty++;
 };
 
 this.idarray = function(campgroundId){
    var array = [];
    var size = this.camps.length;
    var storedItem = campgroundId;
    if(size>0){
        for(var i=0;i<size;i++){
            if(this.camps.indexOf(campgroundId)===-1){
                array.push(this.camps[i]);
                   return this.camps.push(campgroundId);
            }
        }
    }else{
        if(storedItem != this.current){
                this.camps.push(campgroundId);
                }
    }
    this.current = storedItem;
 };
 
 this.generatecampgroundids = function(){
     var arr = [];
     for(var id in this.camps){
         arr.push(this.camps[id]);
     }
     return arr;
 };
 
 this.acceptandreject = function(campgroundId,registerId){
    var size = this.campground[campgroundId].newregister.length;
    for(var i=0;i<size;i++){
        if(this.campground[campgroundId].newregister[i]==registerId){
        var arr = this.campground[campgroundId].newregister.splice(i,1);
        this.campground[campgroundId].register1.splice(i,1);
        }
    }
    return arr;
};
 this.generateArray = function(){
    var arr = [];
    for(var id in this.campground){
        arr.push(this.campground[id]);
    }
    return arr;
};
this.duplicategenerateArray = function(){
    var arr = [];
    for(var id in this.duplicatecampground){
        arr.push(this.duplicatecampground[id]);
    }
    return arr;
}

};