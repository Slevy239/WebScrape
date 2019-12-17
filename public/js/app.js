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
    var id = $(this).attr("data-id");
    var commentText = $("#commentInput").val();
    if (!$("#commentInput").val()) {
        alert("please enter a comment to save")
    } else {
        console.log($("#commentInput").val())
        $.ajax({
            method: "POST",
            url: "/saved/comments/" + id,
            data: {
                comment: commentText
            }
        }).done(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            // $("#noteText" + thisId).val("");
            // $(".modalNote").modal("hide");
            window.location = "/saved"
        });
    }
});


//Handle Delete Note button
$(".deleteNote").on("click", function () {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function (data) {
        console.log(data)
        $(".modalNote").modal("hide");
        window.location = "/saved"
    })
});
