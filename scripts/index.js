// Data Controller
var dataController = (function() {

    // Data structure for summarizing data
    var summary = {
        game: 
            {
            gameID: "",
            period: "",
            homeSummary: {
                score: 0,
                fouls: 0,
                timeout: 0,
                techs: 0
            },
            guestSummary: {
                score: 0,
                fouls: 0,
                timeout: 0,
                techs: 0
            }
        }
    }

    var activity = {
        gameID: "TODOLATER",
        activities: [
            {
                id:0,
                period: "",
                teamID: "",
                playerID: "",
                activityType: ""
            },
        ]
    }

    var activityLookUp = [
        ["fg", { increment: 2, summaryField: "score", summaryDOMid: "sb__score--guest" }],
        ["3p", { increment: 3, summaryField: "score", summaryDOMid: "sb__score--guest" }],
        ["fs", { increment: 1, summaryField: "score", summaryDOMid: "sb__score--guest" }],
        ["pf", { increment: 1, summaryField: "fouls", summaryDOMid: "sb__fouls--guest" }],
        ["tech", 1],
        ["to", 1]
    ]

    // Get the basic data (roster and teams) from JSON
    var dataJSON;
    function getJSON(ctrl) {
        // var requestURL = 'http://127.0.0.1:8080/data/data.json';
        var requestURL = 'http://www.panix.com/~ianr/basketball-scorekeeping/data/data.json';
        var request = new XMLHttpRequest();
        request.open('GET', requestURL);
        request.responseType = 'json';
        request.send();

        // Wait for JSON to load 
        request.onload = function() {
            dataJSON = request.response;
            console.log(dataJSON); // WORKS
            ctrl.dataReady();
            };
   
    }


   
    return {
        // Start to get the JSON file with team and roster info
        startGetData: function(ctrl) {
            return getJSON(ctrl);
        },


        // When JSON loaded, return the JSON
        getData: function() {
            // console.log(dataJSON);
            return dataJSON;
        },

        // Return the activityLookUp
        getActivityLookUp: function() {
            console.log(activityLookUp);
            return activityLookUp;
        },

        // Get and return number in input field
        getFieldNum: function (elementID) {
            var el = document.getElementById(elementID);
            curAmt = Number(el.value);
            if (isNaN(curAmt)) {
                curAmt = 0;
                curAmt = parseInt(curAmt, 10);
            } else {
                curAmt = parseInt(curAmt, 10);
            }
            return curAmt;
        },
        
        
        // Add each new activity to activity object
        // Take ID from button, convert to array and then object
        saveActivity: function(newActiv) {
            var activCurrLength = activity.activities.length;
            var newActivityObj = {
                id:((activity.activities[activCurrLength - 1].id) + 1),
                period: "TODOLATER",
                teamID: newActiv[0],
                playerID: newActiv[1],
                activityType: newActiv[2]
            };
            activity.activities.push(newActivityObj);

            return activity.activities;
        },

        // Depending on activity type, return  new corresponding summary amount and element
        updateSummary: function(team, type) {
            for (let t of activityLookUp) {
                if (type === t[0]) {
                    let amt = (t[1].increment);
                    var sumField = (t[1].summaryField);
                    var sumDOM = (t[1].summaryDOMid);
                    summary.game[team][sumField] = summary.game[team][sumField] + amt;
                 }   
            }
            return [summary.game[team][sumField], sumDOM];
        },

        // Depending on activity type, return new corresponding amount to display in player field
        updatePlayerActivity: function(type, el) {
            var curAmt = dataController.getFieldNum(el);
            for (let t of activityLookUp) {
                if (type === t[0]) {
                    let amt = (t[1].increment);
                    var newAmt = curAmt + amt;
                    }   
            }
            return newAmt;
        }  
    }    

})();

// UI Controller
var UIController = (function() {

    return {
        // Add/update display text to a node
        showDisplayText: function (elementID, text) {
            var displayTeam = document.getElementById(elementID);
            displayTeam.textContent = text;
        },

        // Add/update display value of an input element
        showFieldText: function (elementID, amt) {
            var displayTeam = document.getElementById(elementID);
            amt = parseInt(amt, 10);
            displayTeam.value = amt;
        },

        // Add row for each player
        addPlayerRow: function(id, first, last, num) {
            // Set display name for roster column
            var firstInitial = first.substring(0, 1);
            var displayName = last + ", " + firstInitial + ".";

            // Display the row in the table, with IDs for elements
            var table=document.getElementById("sk__table");
            var table_len=(table.rows.length);
            var row = table.insertRow(table_len).outerHTML="<tr class='sk__player' id='"+id+"'><td class='sk__player--name' id='name-"+id+"'></td><td class='sk__player--number' id='num-"+id+"'></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-fg-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fg-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-3p-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-3p-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-fs-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fs-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-pf-in' name ='' value=' ' class='field-edit'><input type='button' id='"+id+"-pf-btn' name ='' value='+' class='btn-edit'/></form></td></tr>";
            // Display player name and number
            document.getElementById("name-"+id).textContent = displayName;
            document.getElementById("num-"+id).textContent = num;

        }

    }
})();

// Global App Controller
var controller = (function(UICtrl, dataCtrl) {

    var setupEventListeners = function() {
        // console.log('Event Listeners');
        
        document.addEventListener("DOMContentLoaded", function() {
        });
        
        window.onload = function() {
                };
        }

    // Show basic data (Team Name, Roster) pulled from JSON    
    var showBasicData = function(basic) {
        // Display Home Team Name
        UICtrl.showDisplayText("team-name--home", basic.teamHome.name);
        UICtrl.showDisplayText("team-name--guest", basic.teamGuest.name);

        // Display Team Rosters
        function showRoster (teamID, teamRoster) {
            for (i = 0; i < teamRoster.length; i++ ) {
                var playerID = teamRoster[i][0];
                var playerFirst = teamRoster[i][1].fName;
                var playerLast = teamRoster[i][1].lName;
                var playerNumber = teamRoster[i][1].number;

                // Define ID appended to all fields in each row
                var id = teamID + "-" + playerID;

                UICtrl.addPlayerRow(id, playerFirst, playerLast, playerNumber);
            }
        }

        showRoster(basic.teamGuest.id, basic.teamGuest.roster);
        showRoster(basic.teamHome.id, basic.teamHome.roster);

        SKEventListeners();
    }

    // Listen for button clicks and send the input for processing
    function SKEventListeners() {
        var btnList = document.querySelectorAll(".btn-edit");
        for (let i = 0; i < btnList.length; i++) {
            // console.log(btnList[i]);
            btnList[i].addEventListener("click", function() {
                process(btnList[i].id);
                // dataCtrl.process(btnList[i].id);
            });
        }
    }

    // 
    function process(input) {
        // Change input activity to an array
        var newActivityArr = input.split("-");
        // console.log(newActivityArr);
        // 1 - Save each activity
        var allActivities = dataCtrl.saveActivity(newActivityArr);
        console.log(allActivities);
        var activityType = newActivityArr[2];
        var playerID = newActivityArr[1];
        var team = newActivityArr[0];

        // 2 - For each activity, increment Score Board Summary data and UI
        var activityOutput = dataCtrl.updateSummary("guestSummary", activityType); //TODO PASS TEAM VAR
        var amtSB = activityOutput[0];
        var elSB = activityOutput[1];
        UICtrl.showDisplayText(elSB, amtSB);

        // 3 - For each activity, update corresponding player's edit field
        // Get current value of field and replace with updated value
        var elPlayerActivity = input.replace("btn", "in");
        var amtPlayerActivity = dataCtrl.updatePlayerActivity(activityType, elPlayerActivity); 
        amtPlayerActivity = parseInt(amtPlayerActivity, 10);
        UICtrl.showFieldText(elPlayerActivity, amtPlayerActivity);
    }
    

    return {
        init: function() {
            dataCtrl.startGetData(controller);
            // dataCtrl.startGetData();
             setupEventListeners();
            },

        dataReady: function() {
            // console.log('DATAREADY function');
            var allJSONData = dataCtrl.getData();
            // console.log(allJSONData);
            showBasicData(allJSONData);

            return allJSONData;
        }    
    }    

})(UIController, dataController);

controller.init();
