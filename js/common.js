$(document).ready(function(){$(".level-bar-inner").css("width","0"),$(window).on("load",function(){$(".level-bar-inner").each(function(){var e=$(this).data("level");$(this).animate({width:e},800)})}),$(".level-label").tooltip(),GitHubActivity.feed({username:"toyrik",selector:"#feed",limit:7})});