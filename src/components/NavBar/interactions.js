import $ from "jquery";
import logo from "../../images/logo/logo_transparent.png";
import logo2 from "../../images/logo/logo2.png";

$(document).ready(function() {
    var scroll_pos = 0;
    scroll_pos = $(this).scrollTop();
        if (scroll_pos > 650) {
            $(".navbar-logo").attr("src", logo2);
            $('.logo-li').css("border-bottom-color", 'white');

        } else {
            $(".navbar-logo").attr("src", logo);
            $('.logo-li').css("border-bottom-color", 'black');
        }
    $(document).scroll(function() {
        scroll_pos = $(this).scrollTop();
        if (scroll_pos > 650) {
            $(".navbar-logo").attr("src", logo2);
            $('.logo-li').css("border-bottom-color", 'white');

        } else {
            $(".navbar-logo").attr("src", logo);
            $('.logo-li').css("border-bottom-color", 'black');
        }
    });
});