(function ($) {



 if($(window).width() <= 600) 
 {  
    $(".menu-action-text").hide();
    $("#logo").css("width", "225px");
    $("#logo").removeClass("left-adj");
    $("#top-menu-block").css("visibility", "hidden");
    $(".searchTerm").css("width", "100%");
    $("footer").css("width", "100%");
    $("footer").css("margin-left", "0", "!important");

    $("#login-form").css("width","90%");
    $("#registration-form").css({padding: "20px 0px",width: "100%"});
    $("#registration-form input").css("width", "85%");
    $("#registration-form .form-footer").css({width: "65%", margin: "0 auto" });
    $("#registration-form .form-errors").css("padding", "0 10px");

    $("#main").removeClass("all-open-main");
    $("#main").addClass("all-closed-main");
    $("main").css("width", "100%");
    $("main").css("padding-top", "0");
    $("main h1").css("margin", "0");

    $("#close-left-nav").addClass("hidden ");
    $("#open-left-nav").removeClass("hidden ");
    $("#close-right-nav").addClass("hidden ");
    $("#open-right-nav").removeClass("hidden ");

    /* open and close side navigation menue*/

    $( "#open-left-nav" ).on( "click", function() {
        $("#left-nav").removeClass("col-s-2");
        $("#left-nav").addClass("full-width");
     });
     
       $( "#open-right-nav" ).on( "click", function() {
         $("#right-nav").removeClass("col-s-2");
         $("#right-nav").addClass("full-width");

     });

     $( "#close-left-nav" ).on( "click", function() {
        $("#left-nav").addClass("closed-nav");
        $("#left-nav").removeClass("full-width");

     });
     
       $( "#close-right-nav" ).on( "click", function() {
         $("#right-nav").addClass("closed-nav");
         $("#right-nav").removeClass("full-width");
     });
} else if($(window).width() <= 600){

    
    $( "#open-left-nav" ).on( "click", function() {
        // $("#left-nav").removeClass("col-s-2");
        $("#left-nav").addClass("half-width");
     });
     
       $( "#open-right-nav" ).on( "click", function() {
        //  $("#right-nav").removeClass("col-s-2");
         $("#right-nav").addClass("half-width");

     });

     $( "#close-left-nav" ).on( "click", function() {
        // $("#left-nav").addClass("closed-nav");
        $("#left-nav").removeClass("half-width");

     });
     
       $( "#close-right-nav" ).on( "click", function() {
        //  $("#right-nav").addClass("closed-nav");
         $("#right-nav").removeClass("half-width");
     });
} else if($(window).width() <= 768){
    $( "#close-left-nav" ).on( "click", function() {
        $("#left-nav").addClass("closed-nav");
        $("#close-left-nav").addClass("hidden ");
        $("#open-left-nav").removeClass("hidden ");
     });
     
       $( "#close-right-nav" ).on( "click", function() {
         $("#right-nav").addClass("closed-nav");
         $("#close-right-nav").addClass("hidden ");
         $("#open-right-nav").removeClass("hidden ");
     });
     
     $( "#open-left-nav" ).on( "click", function() {
         $("#left-nav").removeClass("closed-nav");
         $("#open-left-nav").addClass("hidden ");
         $("#close-left-nav").removeClass("hidden ");
      });
      
        $( "#open-right-nav" ).on( "click", function() {
          $("#right-nav").removeClass("closed-nav");
          $("#open-right-nav").addClass("hidden ");
          $("#close-right-nav").removeClass("hidden ");
      });
    }else if($(window).width() <= 1200){
        $( "#close-left-nav" ).on( "click", function() {
            $("#left-nav").addClass("closed-nav");
            $("#close-left-nav").addClass("hidden ");
            $("#open-left-nav").removeClass("hidden ");
         });
         
           $( "#close-right-nav" ).on( "click", function() {
             $("#right-nav").addClass("closed-nav");
             $("#close-right-nav").addClass("hidden ");
             $("#open-right-nav").removeClass("hidden ");
         });
         
         $( "#open-left-nav" ).on( "click", function() {
            $("#left-nav").removeClass("half-width");
             $("#left-nav").removeClass("closed-nav");
             $("#open-left-nav").addClass("hidden");
             $("#close-left-nav").removeClass("hidden ");
             
          });
          
            $( "#open-right-nav" ).on( "click", function() {
              $("#right-nav").removeClass("closed-nav");
              $("#open-right-nav").addClass("hidden ");
              $("#close-right-nav").removeClass("hidden ");
          });
} else {
    $( "#close-left-nav" ).on( "click", function() {
        $("#left-nav").addClass("closed-nav");
        $("#close-left-nav").addClass("hidden ");
        $("#open-left-nav").removeClass("hidden ");
     });
     
       $( "#close-right-nav" ).on( "click", function() {
         $("#right-nav").addClass("closed-nav");
         $("#close-right-nav").addClass("hidden ");
         $("#open-right-nav").removeClass("hidden ");
     });
     
     $( "#open-left-nav" ).on( "click", function() {
         $("#left-nav").removeClass("closed-nav");
         $("#open-left-nav").addClass("hidden ");
         $("#close-left-nav").removeClass("hidden ");
      });
      
        $( "#open-right-nav" ).on( "click", function() {
          $("#right-nav").removeClass("closed-nav");
          $("#open-right-nav").addClass("hidden ");
          $("#close-right-nav").removeClass("hidden ");
      });
}
console.log($(window).width())
})(window.jQuery);
// $( "#target" ).on( "click", function() {
//     alert( "Handler for `click` called." );
//   } );

//   $( "#other" ).on( "click", function() {
//     $( "#target" ).trigger( "click" );
//   } );

// {{!-- <script>
//     function openNav() {
//     document.getElementById("leftSidenav").style.width = "250px";
//     document.getElementById("main").style.marginLeft = "250px";
//     document.getElementById("second-menu").style.marginRight = "0px";
//     return "open";
//     }


//     function closeNav() {
//     document.getElementById("leftSidenav").style.width = "0";
//     document.getElementById("main").style.marginLeft= "0";
//     document.getElementById("rightSidenav").style.marginLeft = "0";
//     }

//     let leftMenu = document.getElementById("mySidenav");
//     let main = document.getElementById("main");
//     let rightMenu =document.getElementById("rightSidenav")
//     </script> --}}

/*{ <div id="left-nav" class="sidenav left-side-nav col-s-2 menu"> }*/
/*{ <div id="main" class="all-open-main main-left main-right"></div>} */
/* {<div id="right-nav" class="sidenav right-side-nav col-s-2 menu"> }*/


    /* For tablets: */
//     .col-s-1 {width: 8.33%;}
//     .col-s-2 {width: 16.66%;}
//     .col-s-3 {width: 25%;}
//     .col-s-4 {width: 33.33%;}
//     .col-s-5 {width: 41.66%;}
//     .col-s-6 {width: 50%;}
//     .col-s-7 {width: 58.33%;}
//     .col-s-8 {width: 66.66%;}
//     .col-s-9 {width: 75%;}
//     .col-s-10 {width: 83.33%;}
//     .col-s-11 {width: 91.66%;}
//     .col-s-12 {width: 100%;}
//   }
// all-open-main main-left main-right
  
// .closed-nav {
//     width: 0;
// }

// .all-closed-main {

//     margin: 0;
// }

// .all-open-main {

//     margin: 0 16.33%;
// }


// .left-nav-closed-main {
//     margin-left: 0;
// }

// .right-nav-closed-main {
//     margin-right: 0;
// }