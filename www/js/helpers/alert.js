window.alert = function(title, message, callback) {
    var $alert = $("<div>", {"id": "alert"});
    $alert.on("touchstart", function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    });

    var $body = $("<div>");
    $body.appendTo($alert);
   
    var $title = $("<h1>");
    $title.text(title);
    $title.appendTo($body);
    
    var $message = $("<p>");
    $message.text(message);
    $message.appendTo($body);
    
    var $button = $("<button>");
    $button.appendTo($body);
    $button.text("OK");
    $button.on("tapone", function() {
        $alert.remove();
        if (callback)
            callback();
    });
   
    $alert.appendTo($("body"));
    $body.css("margin-top", "-" + $body.height() / 2 + "px");
};