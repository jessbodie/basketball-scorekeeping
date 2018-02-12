// Data Controller
var dataController = (function() {

    // Flag for which team is active 
    var activeTeam = "home";

    // Data structure for summarizing data
    var summary = {
        game: 
            {
            gameID: "TODOLATER",
            period: "Q1",
            homeSummary: {
                score: 0,
                fouls: 0,
                timeouts: 0,
                techs: 0,
                teamID:""
            },
            guestSummary: {
                score: 0,
                fouls: 0,
                timeouts: 0,
                techs: 0,
                teamID: ""
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
                activityType: "",
                overwrite: ""
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

    // Define foul limits which vary by league
    var bonus = {
        single: 6,
        double: 10
    }

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

        // Return the game's summary data for the active team
        getTeamSummary: function(team) {
            String(team);
            var summaryString = "summary.game." + String(team) + "Summary";
            return (eval(summaryString));
        },

        // Return which team is currently active / which tab is in foreground
        getActiveTeam: function(team) {
            if (team) {
                activeTeam = team;
            }
            return activeTeam;
        },

        // Return Bonus object (largely static) 
        getBonus: function() {
            return bonus;
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
        saveActivity: function(newActiv, val) {
            var activCurrLength = activity.activities.length;
            var newActivityObj = {
                id:((activity.activities[activCurrLength - 1].id) + 1),
                period: summary.game.period,
                teamID: newActiv[0],
                playerID: newActiv[1],
                activityType: newActiv[2],
                overwrite: val
            };
            activity.activities.push(newActivityObj);
            console.log(newActivityObj);

            return activity.activities;
        },

        // Update the team IDs for home and guest in the data summary object
        updateSummaryIDs: function(homeTeamID, guestTeamID) {
           summary.game.homeSummary.teamID = homeTeamID;
           summary.game.guestSummary.teamID = guestTeamID;
        },

        // Update the team IDs for home and guest in the data summary object
        updateSummaryFouls: function() {
            summary.game.homeSummary.fouls = 0;
            summary.game.guestSummary.fouls = 0;
         },

         // Depending on activity type and team, 
        // update data summary object and
        // return new corresponding summary amount and element
        updateSummary: function(team, type, changeVal) {
            for (let t of activityLookUp) {
                if (type === t[0]) {
                    // Check if overwrite (from text input field), use change in value
                    if (isNaN(changeVal)) {
                        var amt = (t[1].increment);
                    } else {
                        var amt = changeVal;
                    }

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

        updatePeriod: function(per) {
            summary.game.period = per;
        },

        // Depending on activity type, 
        // return new corresponding amount to display in player field
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
            var row = table.insertRow(table_len).outerHTML="<tr class='sk__player sk__player--animate' id='"+id+"'><td class='sk__player--name' id='name-"+id+"'></td><td class='sk__player--number' id='num-"+id+"'></td><td class='sk__player--edit'><form ><input type='number' id='"+id+"-fg-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fg-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form ><input type='number' id='"+id+"-3p-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-3p-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form ><input type='number' id='"+id+"-fs-in' name ='' value='' class='field-edit'><input type='button' id='"+id+"-fs-btn' name ='' value='+' class='btn-edit'/></form></td><td class='sk__player--edit'><form ><input type='number' id='"+id+"-pf-in' name ='' value=' ' class='field-edit'><input type='button' id='"+id+"-pf-btn' name ='' value='+' class='btn-edit'/></form></td></tr>";
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
                document.querySelector(".container").style.background = "linear-gradient(#E59F71, #889fb3 25%)";
                document.getElementById("sk").classList.add("sk--home");
                document.getElementById("sk").classList.remove("sk--guest");
                document.getElementById("sk__table--home").style.display = "block";
                document.getElementById("sk__table--guest").style.display = "none";

            } else if (tab === "guest") {
                document.getElementById("sb_period").style.gridColumn = "sb-home-start / sb-home-end";
                document.getElementById("sb_period").style.backgroundColor = "#889fb3";
                document.getElementById("sb__to-tech--guest").style.visibility = "visible";
                document.getElementById("sb__to-tech--home").style.visibility = "hidden";
                document.querySelector(".container").style.background = "linear-gradient(#dbe2e8, #BA5A31 25%)";
                document.getElementById("sk").classList.add("sk--guest");
                document.getElementById("sk").classList.remove("sk--home");
                document.getElementById("sk__table--guest").style.display = "block";
                document.getElementById("sk__table--home").style.display = "none";
            }
        },

        // Remove animation of Score Keeping rows 
        removeSKAnimation: function() {
            var allPlayerRows = document.querySelectorAll(".sk__player");
            for (i = 0; i < allPlayerRows.length; i++) {
                allPlayerRows[i].classList.remove("sk__player--animate");
            }
        },

        // Prevent splash animations from showing if page previously loaded
        splashAnimation: function() {
            var loadedBefore = sessionStorage.getItem("loaded");
            if (!loadedBefore) {
                // Clear flag (loadedBefore) and reset to true for 
                // future page loads
                sessionStorage.clear();
                sessionStorage.setItem("loaded", "true");
            } else if (loadedBefore === "true") {
                // Remove Splash basketball animation
                document.getElementById("splash__ball").setAttribute("style", "display: none");
                // Remove Splash title animation
                document.getElementById("splash__title").classList.remove("splash__title--anim");
    
                // Remove container for splash animations so layers underneath can be accessed
                document.getElementById("splash__anim").setAttribute("style", "display: none");
    
                // Remove table row animation
                UIController.removeSKAnimation();
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

        dataCtrl.updateSummaryIDs(basic.teamHome.id, basic.teamGuest.id);


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

        // Reset splash animation so it only shows on first load
        UICtrl.splashAnimation();
    }


    // Event listeners
    var setupEventListeners = function() {

        // When Home or Guest tab is clicked, update flag and UI
        document.getElementById("sb__tab--home").addEventListener("click", function() {
            toggleHomeGuest("home");
        });
        document.getElementById("sb__tab--guest").addEventListener("click", function() {
            toggleHomeGuest("guest");
        });

        // When Period clicked, add Period to Activity object and update UI
        periodsList = document.querySelectorAll(".period__num");
        for (let i = 0; i < periodsList.length; i++) {

            periodsList[i].children[1].addEventListener("click", function(e) {
                dataCtrl.updatePeriod(e.currentTarget.textContent);
            });
        };

        // When Period 3 is clicked, reset Team Fouls and Bonus Indicators
        document.getElementById("period__num--3").addEventListener("click", function() {
            dataCtrl.updateSummaryFouls();
            UICtrl.showDisplayText("sb__bb--home", "");
            UICtrl.showDisplayText("sb__bb--guest", "");
            UICtrl.showDisplayText("sb__fouls--home", "");
            UICtrl.showDisplayText("sb__fouls--guest", "");
        });
    }   
        
    // Listen for button clicks in Score Keeping and send the input for processing
    // Called after JSON loaded
    function SKEventListeners() {
        // Listen for Plus Button clicks, then process that Input
        var btnList = document.querySelectorAll(".btn-edit");
        for (let i = 0; i < btnList.length; i++) {
            btnList[i].addEventListener("click", function() {
                process(btnList[i].id);
            });
        }

        // Listen for Edit Field updates, then process that Input
        var editFieldList = document.querySelectorAll(".field-edit");
        for (let i = 0; i < editFieldList.length; i++) {
            var prevValue;

            editFieldList[i].addEventListener("click", function() {
                // Select and focus where user taps
                editFieldList[i].select();
                editFieldList[i].focus();
                // Capture current value
                prevValue = editFieldList[i].value;

            });

            // Process after field is blurred
            editFieldList[i].addEventListener("blur", function() {
                process(editFieldList[i].id, editFieldList[i].value, prevValue);
            });

            // Process after press Enter key
            editFieldList[i].addEventListener("keypress", function(e) {
                if ((e.keyCode === 13) || (e.keyCode === 9)) {
                    e.preventDefault();
                    process(editFieldList[i].id, editFieldList[i].value, prevValue);
                    prevValue = editFieldList[i].value;
                    editFieldList[i].blur();
                }
            });

        }

        // Remove animation after it loads once for Home and Guest Tabs
        document.getElementById("sb__tab--guest").addEventListener("click", UICtrl.removeSKAnimation);

    }

    // Core function to process the inputs from buttons and text fields
    // overWriteValue and prevValue needed for text input fields only
    function process(input, overWriteValue, prevValue) {
        // Change input activity to an array
        var newActivityArr = input.split("-");
        // console.log(newActivityArr);
                
        // 1 - Save each individual activity
        var allActivities = dataCtrl.saveActivity(newActivityArr, overWriteValue);
        // console.log(allActivities);
        var activityType = newActivityArr[2];
        var playerID = newActivityArr[1];
        var team = newActivityArr[0];
        var changeInValue = overWriteValue - prevValue;

        // 2 - For each activity, update Score Board Summary data and Score Board UI
        var activityOutput = dataCtrl.updateSummary(team, activityType, changeInValue); 
        var amtSB = activityOutput[0];
        var elSB = activityOutput[1];
        if ((activityType == "fg") || (activityType == "3p") ||
            (activityType == "fs") || (activityType == "pf")) {
            UICtrl.showDisplayText(elSB, amtSB);
        };

        // 2B - For each foul, check and update Score Board Bonus Indicator
        if (activityType == "pf") {
            updateBB();
        };


        // 3 - If button clicked and not overwrite from text input,
        // for each activity, update corresponding player's edit field
        if (overWriteValue === undefined) {
            var elPlayerActivity = input.replace("btn", "in");
            var amtPlayerActivity = dataCtrl.updatePlayerActivity(activityType, elPlayerActivity); 
            amtPlayerActivity = parseInt(amtPlayerActivity, 10);
            UICtrl.showFieldText(elPlayerActivity, amtPlayerActivity);
        }
    }

    // Check and update Score Board Bonus Indicator
    function updateBB() {
            // Get the number of team fouls for the active team
            var t = dataCtrl.getActiveTeam();
            var teamSummary = dataCtrl.getTeamSummary(t);

            // Get bonus limits
            var b = dataCtrl.getBonus();

            // Bonus displays for the not active team
            if (t === "home") {
                var bbDisplay = "guest"; 
            } else {
                var bbDisplay = "home";
            }
            //  If over first bonus limit display B for Bonus situation
            if (teamSummary.fouls === b.single) {
                UICtrl.showDisplayText("sb__bb--"+bbDisplay, "B");
            }
            //  If over second bonus limit display BB for Double Bonus
            if (teamSummary.fouls === b.double) {
                UICtrl.showDisplayText("sb__bb--"+bbDisplay, "BB");
            }
    
            // reset at half time, overtime
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

            return allJSONData;
        }    
    }    

})(UIController, dataController);

controller.init();
