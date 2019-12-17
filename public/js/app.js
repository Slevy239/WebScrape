//Handle Scrape button
$("#scrape").on("click", function () {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function (data) {
        console.log(data)
        window.location = "/"
    })
});

//Set clicked nav option to active
$(".navbar-nav li").click(function () {
    $(".navbar-nav li").removeClass("active");
    $(this).addClass("active");
});

//Handle Save Article button
$(".save").on("click", function () {
    var thisId = $(this).attr("data-id");
    alert("Article Saved!")
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function (data) {
        window.location = "/"
    })
});

//Handle Delete Article button
$(".delete").on("click", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/delete/" + thisId
    }).done(function (data) {
        window.location = "/saved"
    })
});

//Handle Save comment button
$(".saveComment").on("click", function () {
    let id = $(this).attr("data-id");
    let text = $("#commentText"+id).val();
    $.ajax({
        method: "POST",
        url: "/saved/comments/"+id,
        data: {
            comment: text
        }
    }).done(function(data){
        console.log(data)
        window.location = "/saved"
    })
})







//DELETE COMMENT FROM MODAL
$(".deleteComment").on("click", function () {
    var id = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "delete/comments/" + id
    }).done(function (data) {
        console.log(data)
        window.location = "/saved"
    })
});
