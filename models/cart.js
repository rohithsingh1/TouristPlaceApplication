module.exports = function Cart(oldCart){
    this.registers = oldCart.registers || {};
    this.totalQty = oldCart.totalQty || 0;
    this.users = oldCart.users || [];
    this.current = oldCart.current || 0;
    this.add = function(newregister,newregisterId, campgroundId){
        var storedItem = this.registers[newregisterId];
        if(!storedItem){
            storedItem = this.registers[newregisterId] = {
                                                           qty:0,
                                                           campgroundid:campgroundId,
                                                           newuser:newregister
                                                                };
        }
        storedItem.qty++;
        this.totalQty++;
    };
    this.useridarray = function(userId){
        var array = [];
        var size = this.users.length;
        var storedItem = userId;
        if(size>0){
            for(var i=0;i<size;i++){
                if(this.users.indexOf(userId)===-1){
                    array.push(this.users[i]);
                       return this.users.push(userId);
                }
            }
        }else{
            if(storedItem != this.current){
                    this.users.push(userId);
                    }
        }
        this.current = storedItem;
     };
     this.userids = function(){
        var arr = [];
        for(var id in this.users){
            arr.push(this.users[id]);
        }
        return arr;
    };
    this.acceptandreject = function(registerId){
        delete this.registers[registerId];
        var size = this.users.length;
        for(var i=0;i<size;i++){
            if(this.users[i]==registerId){
            var arr = this.users.splice(i,1);
            }
        }
        return arr;
    };
    this.generateArray = function(){
        var arr = [];
        for(var id in this.registers){
            arr.push(this.registers[id]);
        }
        return arr;
    };
};