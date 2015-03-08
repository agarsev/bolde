function init_gutters () {
    var gutr = document.getElementById('gutter_r');
    gutr.onmousedown=function(oe) {
        var targ = document.querySelector('main section:last-child');
        document.onmousemove=function(e){
            targ.style.width = (document.body.clientWidth-e.clientX)+"px";
        };
        document.onmouseup=function(){
            document.onmousemove=null;
        };
        return false;
    };
    var gutl = document.getElementById('gutter_l');
    gutl.onmousedown=function(oe) {
        var targ = document.querySelector('main section:first-child');
        document.onmousemove=function(e){
            targ.style.width = e.clientX+"px";
        };
        document.onmouseup=function(){
            document.onmousemove=null;
        };
        return false;
    };
}
