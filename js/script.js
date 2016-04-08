$(document).ready(function(){
    $(".navBtn").click(function(){
        $("nav").show();
        $("nav").animate({right: '0px'});
        $(".cd-section").animate({left: '-250px'});
    });
     $(".close").click(function(){
        $("nav").animate({right: '-250px'});
        $(".cd-section").animate({left: '0px'});
//        $("nav").hide();
    });
});