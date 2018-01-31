// Data Controller
var dataController = (function() {

    // Flag for which team is active 
    var activeTeam = "home";

    // Data structure for summarizing data
    var summary = {
        game: 
            {
            gameID: "",
            period: "",
            homeSummary: {
                score: 0,
                fouls: 0,
                timeouts: 0,
                techs: 0
            },
            guestSummary: {
                score: 0,
                fouls: 0,
                timeouts: 0,
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
        ["fg", { increment: 2, summaryField: "score", summaryDOMid: "sb__score--" }],
        ["3p", { increment: 3, summaryField: "score", summaryDOMid: "sb__score--" }],
        ["fs", { increment: 1, summaryField: "score", summaryDOMid: "sb__score--" }],
        ["pf", { increment: 1, summaryField: "fouls", summaryDOMid: "sb__fouls--" }],
        ["tech", { increment: 1, summaryField: "techs", summaryDOMid: "sb__tech--" }],
        ["to", { increment: 1, summaryField: "timeouts", summaryDOMid: "sb__to--" }]
    ]

    // Get the basic data (roster and teams) from JSON
    var dataJSON;
    var homeTeam;
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
            homeTeam = dataJSON.teamHome.id;
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

        // 
        getActiveTeam: function(team) {
            activeTeam = team;
            return activeTeam;
        },

        // DELETE?
        // getHomeTeamID: function() {
        //     return homeTeam;
        // },

        
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

        // Depending on activity type and team, 
        // return new corresponding summary amount and element
        updateSummary: function(team, type) {
            for (let t of activityLookUp) {
                if (type === t[0]) {
                    let amt = (t[1].increment);
                    var sumField = (t[1].summaryField);
                    var sumDOM = (t[1].summaryDOMid);
                    var sumTot;
                    if (team === homeTeam) {
                        summary.game.homeSummary[sumField] = summary.game.homeSummary[sumField] + amt;
                        sumTot = summary.game.homeSummary[sumField];
                        sumDOM = sumDOM + "home";
                    } else {
                        summary.game.guestSummary[sumField] = summary.game.guestSummary[sumField] + amt;
                        sumTot = summary.game.guestSummary[sumField];
                        sumDOM = sumDOM + "guest";
                    }
                }   
            }
            // DEBUG
            // console.log(summary.game.homeSummary);
            // Return new sum total and the corresponding DOM element
            return [sumTot, sumDOM];
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
        addPlayerRow: function(teamToggle, teamID, playerID, first, last, num) {

            // Set display name for roster column
            var firstInitial = first.substring(0, 1);
            var displayName = last + ", " + firstInitial + ".";

            // Define ID appended to all fields in each row
            var id = teamID + "-" + playerID;

            // HOME - Display the row in the table, with IDs for elements
            var table=document.getElementById("sk__table--"+teamToggle);
            var table_len=(table.rows.length);
            var row = table.insertRow(table_len).outerHTML="<tr class='sk__player' id='"+id+"'><td class='sk__player--name' id='name-"+id+"'></td><td class='sk__player--number' id='num-"+id+"'></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-fg-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fg-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-3p-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-3p-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-fs-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fs-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form action=''><input type='number' id='"+id+"-pf-in' name ='' value=' ' class='field-edit'><input type='button' id='"+id+"-pf-btn' name ='' value='+' class='btn-edit'/></form></td></tr>";
            // Display player name and number
            document.getElementById("name-"+id).textContent = displayName;
            document.getElementById("num-"+id).textContent = num;

        },

        // Update various parts of UI based on top tab selection
        toggleTabs: function(tab) {
            if (tab === "home") {
                document.getElementById("sb_period").style.gridColumn = "sb-guest-start / sb-guest-end";
                document.getElementById("sb_period").style.backgroundColor = "#BA5A31";
                document.getElementById("sb__to-tech--home").style.visibility = "visible";
                document.getElementById("sb__to-tech--guest").style.visibility = "hidden";
                document.querySelector(".container").style.backgroundColor = "#E59F71";
                document.getElementById("sk").classList.add("sk--home");
                document.getElementById("sk").classList.remove("sk--guest");
                document.getElementById("sk__table--home").style.display = "block";
                document.getElementById("sk__table--guest").style.display = "none";

            } else if (tab === "guest") {
                document.getElementById("sb_period").style.gridColumn = "sb-home-start / sb-home-end";
                document.getElementById("sb_period").style.backgroundColor = "#77828C";
                document.getElementById("sb__to-tech--guest").style.visibility = "visible";
                document.getElementById("sb__to-tech--home").style.visibility = "hidden";
                document.querySelector(".container").style.backgroundColor = "#C6D1DB";
                document.getElementById("sk").classList.add("sk--guest");
                document.getElementById("sk").classList.remove("sk--home");
                document.getElementById("sk__table--guest").style.display = "block";
                document.getElementById("sk__table--home").style.display = "none";
            }
        }
    
    }
})();

// Global App Controller
var controller = (function(UICtrl, dataCtrl) {

    function toggleHomeGuest(team) {
        UICtrl.toggleTabs(team);
        dataCtrl.getActiveTeam(team);
    }

    // Show "basic" data (Team Name, Roster) pulled from JSON    
    var showBasicData = function(basic) {
        // Display Home Team Name
        UICtrl.showDisplayText("team-name--home", basic.teamHome.name);
        UICtrl.showDisplayText("team-name--guest", basic.teamGuest.name);

        // Display Rosters and table rows for Home and Guest teams
        function showRoster (teamToggle, teamID, teamRoster) {
            for (i = 0; i < teamRoster.length; i++ ) {
                var playerID = teamRoster[i][0];
                var playerFirst = teamRoster[i][1].fName;
                var playerLast = teamRoster[i][1].lName;
                var playerNumber = teamRoster[i][1].number;

                UICtrl.addPlayerRow(teamToggle, teamID, playerID, playerFirst, playerLast, playerNumber);
            }
        }

        showRoster("home", basic.teamHome.id, basic.teamHome.roster);
        showRoster("guest", basic.teamGuest.id, basic.teamGuest.roster);


        // Update Scoreboard elements with team-specific IDs
        document.getElementById("-home-to-in").id = basic.teamHome.id + "-home-to-in";
        document.getElementById("-home-to-btn").id = basic.teamHome.id + "-home-to-btn";
        document.getElementById("-home-tech-in").id = basic.teamHome.id + "-home-tech-in";
        document.getElementById("-home-tech-btn").id = basic.teamHome.id + "-home-tech-btn";
        document.getElementById("-guest-to-in").id = basic.teamGuest.id + "-guest-to-in";
        document.getElementById("-guest-to-btn").id = basic.teamGuest.id + "-guest-to-btn";
        document.getElementById("-guest-tech-in").id = basic.teamGuest.id + "-guest-tech-in";
        document.getElementById("-guest-tech-btn").id = basic.teamGuest.id + "-guest-tech-btn";


        // Score Keeping Buttons/Inputs  Event Listeners
        SKEventListeners();
    }
    
    // Event listeners
    var setupEventListeners = function() {

        // When tab is clicked, update flag and UI
        document.getElementById("sb__tab--home").addEventListener("click", function() {
            toggleHomeGuest("home");
        });
        document.getElementById("sb__tab--guest").addEventListener("click", function() {
            toggleHomeGuest("guest");
        });
    }    
        
    // Listen for button clicks in Score Keeping and send the input for processing
    function SKEventListeners() {
        var btnList = document.querySelectorAll(".btn-edit");
        for (let i = 0; i < btnList.length; i++) {
            // console.log(btnList[i]);
            btnList[i].addEventListener("click", function() {
                console.log(btnList[i].id);
                process(btnList[i].id);
            });
        }
    }

    // 
    function process(input) {
        // Change input activity to an array
        var newActivityArr = input.split("-");
        console.log(newActivityArr);
        // 1 - Save each activity
        var allActivities = dataCtrl.saveActivity(newActivityArr);
        // console.log(allActivities);
        var activityType = newActivityArr[2];
        var playerID = newActivityArr[1];
        var team = newActivityArr[0];

        // 2 - For each activity, increment Score Board Summary data and UI
        var activityOutput = dataCtrl.updateSummary(team, activityType); 
        var amtSB = activityOutput[0];
        var elSB = activityOutput[1];
        if ((activityType == "fg") || (activityType == "3p") ||
            (activityType == "fs") || (activityType == "pf")) {
            UICtrl.showDisplayText(elSB, amtSB);
        };


        // 3 - For each activity, update corresponding player's edit field
        // Get current value of field and replace with updated value
        var elPlayerActivity = input.replace("btn", "in");
        var amtPlayerActivity = dataCtrl.updatePlayerActivity(activityType, elPlayerActivity); 
        amtPlayerActivity = parseInt(amtPlayerActivity, 10);
        UICtrl.showFieldText(elPlayerActivity, amtPlayerActivity);
    }
    

    return {
        init: function() {
            // Initiate getting data from JSON
            dataCtrl.startGetData(controller);
            setupEventListeners();

            // Reset the values for the Score Board Time Out and Techs
            document.getElementById("-home-to-in").value="";
            document.getElementById("-home-tech-in").value="";
            document.getElementById("-guest-to-in").value="";
            document.getElementById("-guest-tech-in").value="";
    
    
            // Set Home as default on start
            toggleHomeGuest("home");
            },

        // When data is pulled in from JSON, make available
        dataReady: function() {
            var allJSONData = dataCtrl.getData();
            // console.log(allJSONData);
            showBasicData(allJSONData);

            // Update Scoreboard with team IDs
            // dataCtrl.updateSBTeamIDs(allJSONData);

            return allJSONData;
        }    
    }    

})(UIController, dataController);

controller.init();
