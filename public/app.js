// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var newCard = document.createElement('div');
    newCard.className = "card";
    newCard.id = "card-" + i;

    var newCardBody = document.createElement('div');
    newCardBody.className = "card-body";
    newCardBody.id = "card-body-" + i;

    var newContent = document.createElement('div');
    newContent.className = "card-content";
    newContent.id = "card-content-" + i;

    $("#articles").append(newCard);
    $("#card-"+i).append(newCardBody);
    $("#card-body-"+i).append("<p data-id='" + data[i]._id + "'>" + data[i].title + "</p>")
    $("#card-body-"+i).append("<a href='" + data[i].link + "'>Link to Story!</a>")



  }
});


$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#comments").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#comments").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Note</button>");
      // If there's a note in the article
      if (data.comments) {
        // Place the title of the comments in the title input
        $("#titleinput").val(data.comments.title);
        // Place the body of the comments in the body textarea
        $("#bodyinput").val(data.comments.body);
      }
    });
});
// When you click the savenote button
$(document).on("click", "#savecomment", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
