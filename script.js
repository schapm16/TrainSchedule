/* global $ firebase moment*/

var database = firebase.database();
var dbRef = database.ref();

// Global function to perform time math and print data to screen.
  function postData(trainName, trainDestination, firstTrainTime, trainFrequency, currentTime, periodic = false) {
    var timeUntilNext;
    var nextArrival;
    
    firstTrainTime = moment(firstTrainTime, "HH:mm");
    
    var difference =(currentTime.diff(firstTrainTime,"minutes"));
    
    if (difference < 0) {
      timeUntilNext =  Math.abs(difference);
      nextArrival = firstTrainTime;
      
    }  else { 
    
      timeUntilNext = trainFrequency - difference % trainFrequency;
      nextArrival = currentTime.add(timeUntilNext,"minutes");
    }
    
    if (periodic === false) {
      $(".table").append($("<tr>").addClass(trainName));
      
      $("tr:last").append("<td>" + trainName + "</td>");
      $("tr:last").append("<td>" + trainDestination + "</td>");
      $("tr:last").append("<td>" + trainFrequency + "</td>");
      $("tr:last").append("<td>" + nextArrival.format("HH:mm") + "</td>");
      $("tr:last").append("<td>" + timeUntilNext + "</td>");
    }
    
    if (periodic === true) {
      $("." + trainName + " td").eq(3).text(nextArrival.format("HH:mm"));
      $("." + trainName + " td").eq(4).text(timeUntilNext);
    }
  }



$(function() {
  
  //Function to pull data from database and update current time stamp on initial page load.
  dbRef.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      
      dbRef.child(childSnapshot.key).update({timeStamp: firebase.database.ServerValue.TIMESTAMP});
      
      var trainName = childSnapshot.val().trainName;
      var trainDestination = childSnapshot.val().trainDestination;
      var firstTrainTime = childSnapshot.val().firstTrainTime;
      var trainFrequency = childSnapshot.val().trainFrequency;
      var currentTime = moment(childSnapshot.val().timeStamp);
      
      postData (trainName, trainDestination, firstTrainTime, trainFrequency, currentTime);
      
    });
  });
  
  // Click listener that adds a new train to the data on screen and to the database.
  $("#addTrain").click(function() {
    var currentTime;
    var trainName = $("#trainName").val();
    var trainDestination = $("#trainDestination").val();
    var firstTrainTime = $("#firstTrainTime").val();
    var trainFrequency = parseInt($("#trainFrequency").val());
    
    dbRef.push({
      trainName: trainName,                     
      trainDestination: trainDestination,
      firstTrainTime: firstTrainTime,
      trainFrequency: trainFrequency,
      timeStamp: firebase.database.ServerValue.TIMESTAMP
    });
        
    dbRef.once("child_added", function(snapshot) {
      currentTime = moment(snapshot.val().timeStamp);
    });
    
    postData (trainName, trainDestination, firstTrainTime, trainFrequency, currentTime);
    
  });
  
  function periodicUpdate() {
    dbRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        
        var periodic = true;
        
        dbRef.child(childSnapshot.key).update({timeStamp: firebase.database.ServerValue.TIMESTAMP});
        
        var trainName = childSnapshot.val().trainName;
        var trainDestination = childSnapshot.val().trainDestination;
        var firstTrainTime = childSnapshot.val().firstTrainTime;
        var trainFrequency = childSnapshot.val().trainFrequency;
        var currentTime = moment(childSnapshot.val().timeStamp);
        
        postData (trainName, trainDestination, firstTrainTime, trainFrequency, currentTime, periodic);
        
      });
    });
  }
  
  //Set interval for periodic data update
  setInterval(periodicUpdate, 30000);
  
});



