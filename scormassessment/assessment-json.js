/* SCORM Assessment Engine v. 2.0            */
/* Copyright 2003-2011 Rustici Software, LLC  All Rights Reserved. */

/* REQUIRES jQuery 1.5+ */

/*******************************************************
 Globals
********************************************************/
var ENGINE_VERSION = '2.0'; //this has to match the version in the question file

var SCORMDriver = window.parent;
// Alias to the parent page which hosts the SCORMDriver methods - by default, this should be the RSECA/indexAPI.html page that is hosting assessment.html in a frameset.
var assessmentEngine = null;
var assessmentObjects = {};
// Holds an easy-access map of all question and answer objects.
var isInternetExplorer = document.all && window.ActiveXObject && navigator.userAgent.toLowerCase().indexOf("msie") > -1 && navigator.userAgent.toLowerCase().indexOf("opera") == -1;
var startTime = null;
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//show debug in console (must be 'false' for IE since there is no console)
//set this to false for production as it shows the correct answer in the console
var debug = true;

if (isInternetExplorer) {
    debug = false;
}

// Assessment Engine States
var INIT = 0; //show splash screen
var ASK_QUESTION = 1;
var SHOW_SINGLE_RESULT = 2;
var FINISHED = 3;
var NEXT_QUESTION = 4;

var currentState = '';
/*******************************************************
 Object Definitions
********************************************************/
function AssessmentEngine(data)
 {
	log('in assessmentEngine init',this,arguments);
    this.assessment = new Assessment(data);

    this.currentQuestionIndex = 0;
    this.score = null;
    this.state = INIT;
    this.numberOfAttempts = 0;
    this.missedQuestionCount = 0;
    this.currentLevel = 1;
	this.currentQuestionCount = 0;

	this.askedQuestions = []; //questions are added AFTER they are answered

    if (typeof(SCORMDriver.GetPreviouslyAccumulatedTime) == 'function')
    {
        this.totalPreviousMilliseconds = SCORMDriver.GetPreviouslyAccumulatedTime();
    }

    AssessmentEngine.prototype.initialize = AssessmentEngine_initialize;
    AssessmentEngine.prototype.recordCurrentInputs = AssessmentEngine_recordCurrentInputs;
    AssessmentEngine.prototype.recordQuestionInputs = AssessmentEngine_recordQuestionInputs;
    AssessmentEngine.prototype.checkTimeLimit = AssessmentEngine_checkTimeLimit;
    AssessmentEngine.prototype.next = AssessmentEngine_next;
    AssessmentEngine.prototype.back = AssessmentEngine_back;
    AssessmentEngine.prototype.render = AssessmentEngine_render;
    AssessmentEngine.prototype.renderExplanation = AssessmentEngine_renderExplanation;
    AssessmentEngine.prototype.saveState = AssessmentEngine_saveState;
    AssessmentEngine.prototype.loadState = AssessmentEngine_loadState;
    AssessmentEngine.prototype.finishQuiz = AssessmentEngine_finishQuiz;
    AssessmentEngine.prototype.renderSplashScreen = AssessmentEngine_renderSplashScreen;
    // For custom event handler functionality, default implementation does nothing.  The core
    // next/back functionality is performed regardless... this just allows for extra funcionality
    AssessmentEngine.prototype.handleBackClick = AssessmentEngine_handleBackClick;
    AssessmentEngine.prototype.handleNextClick = AssessmentEngine_handleNextClick;
}

function AssessmentEngine_checkTimeLimit()
 {
    var elapsedMillis = (new Date()).getTime() - (startTime - this.totalPreviousMilliseconds);
    var timeRemaining = this.assessment.timeLimit - (elapsedMillis / 1000);

    var timerCountdownSpan = document.getElementById("timerCountdown");
    var correctCount = 0;

    var i = 0;

    if (timeRemaining <= 0 && this.state !== FINISHED)
    {
        alert("The time limit for this assessment has been reached.");
        timerCountdownSpan.innerHTML = "00:00:00";
        assessmentEngine.state = FINISHED;

        correctCount = 0;
		//	TODO: FIX THIS with askedQuestions
		/*
        for (i = 0; i < assessmentEngine.assessment.questions.length; i++)
        {
            if (isCorrect(assessmentEngine.assessment.questions[i]))
            {
                correctCount++;
            }
        }
		*/
        // Record answers as interactions
        if (this.assessment.recordInteractions) {
            //this.recordCurrentInputs();
            recordAllAnswersAsInteractions();
        }

        // Set the score for the interface
        assessmentEngine.assessment.score = Math.round((correctCount / assessmentEngine.assessment.questions.length) * 100);

        if (this.assessment.mode === "test")
        {
            if (typeof(SCORMDriver.SetScore) == 'function')
            {
                // Send the score to the LMS
                SCORMDriver.SetScore(assessmentEngine.assessment.score, 100, 0);

                if (assessmentEngine.assessment.score >= assessmentEngine.assessment.passingScore)
                {
                    SCORMDriver.SetPassed();
                    SCORMDriver.SetReachedEnd();
                }
                else
                {
                    SCORMDriver.SetFailed();
                    SCORMDriver.SetReachedEnd();
                }
            }
        }
        else if (this.assessment.mode === "survey")
        {
            if (typeof(SCORMDriver.SetReachedEnd) == 'function')
            {
                // Tell the LMS that we've finished
                SCORMDriver.SetReachedEnd();
            }
        }

        if (typeof(SCORMDriver.SetDataChunk) == 'function')
        {
            // Since we're done, we no longer need the suspend data, so go ahead and clear it
            // and replace it with the attempt count.
            SCORMDriver.SetDataChunk(this.numberOfAttempts);
        }
        this.render();
    }
    else
    {
        // Only continue the countdown if not finished
        if (this.state !== FINISHED)
        {
            var formattedTime = String(new Date(0, 0, 0, 0, 0, timeRemaining)).match(/\S{8}/);
            timerCountdownSpan.innerHTML = formattedTime;
            setTimeout('assessmentEngine.checkTimeLimit()', 1000);
        }
    }
}

// User Functions that may be overridden to provide additional onclick functionality
function AssessmentEngine_handleNextClick() {}
function AssessmentEngine_handleBackClick() {}

function AssessmentEngine_recordCurrentInputs()
 {
	// Determine if we need to record inputs
    if ((this.state == ASK_QUESTION && (this.assessment.feedbackLevel !== "immediate" || this.assessment.feedbackLevel !== "both"))
    || this.state == SHOW_SINGLE_RESULT || this.state == FINISHED)
    {
	
		if (this.assessment.showAllQuestionsOnSinglePage)
		{
			
			for (var questionIdx = 0; questionIdx < this.assessment.questionBank[this.currentLevel].length; questionIdx++)
            {
				this.recordQuestionInputs(questionIdx);
			}
		}
		else
		{
			this.recordQuestionInputs(this.currentQuestionIndex);
		}
    }
}

function AssessmentEngine_recordQuestionInputs(questionIdx)
 {
	var qid = this.assessment.questionBank[this.currentLevel][questionIdx].id;
		// Clear out the previous response set (may exist if user hit "<< Previous")
	if(typeof(this.assessment.questionBank[this.currentLevel][questionIdx]) != 'undefined')
	{
       	this.assessment.questionBank[this.currentLevel][questionIdx].userResponses = [];
		if(typeof(this.assessment.questionBank[this.currentLevel]) != 'undefined'){
			if(this.assessment.questionBank[this.currentLevel].length>0)
       		{	
				this.assessment.questionBank[this.currentLevel][questionIdx].userResponses = [];
			}	
		}
	}
    
	// Evaluate the current inputs and set answers
	// We can do this by finding the id of all checked answers then looking
	// up the answer objects mapped to those id's.  We then add those answers to the userResponses.

	var answers = $("input[qid='" + qid + "']");
	//log('answers',answers);
	var matchingDropdowns = $("select[qid='" + qid + "']");
	//log('matchingDropdowns',matchingDropdowns);
	var longAnswers = $("textarea[qid='" + qid + "']");
	//log('longAnswers',longAnswers);

	var i = 0;
	var answerObj = null;
	if (answers.length > 0){

		for (i = 0; i < answers.length; i++)
		{
		   if (answers[i].type == "text")
		   // This is fill-in-the-blank
		   {
		       answerObj = assessmentObjects[answers[i].id];

		       // Make sure we're dealing with a valid answer input, otherwise it might be some other
		       // unrelated input tag
		       if (answerObj !== undefined && answerObj !== null) {
		           answerObj.userText = answers[i].value;
		           this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(answerObj);
		       }
		   }
		   else
		   {
		       if (answers[i].checked)
		       {
					//log('answers[i].value:'+answers[i].value);
					//log('assessmentObjects',assessmentObjects);
		           answerObj = assessmentObjects[answers[i].value];
					//log('answerObj',answerObj);
		           // Make sure we're dealing with a valid answer input, otherwise it might be some other
		           // unrelated input tag
		           if (answerObj !== undefined && answerObj !== null) {
		               this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(answerObj);
		           }
		       }
		   }
		}
		
		if (answerObj == null) {
			this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(answerObj);
		}
	}

	// Any select tags will correspond to matching statements
	for (i = 0; i < matchingDropdowns.length; i++)
	{
	   answerObj = assessmentObjects[matchingDropdowns[i].id];
	//log('answerObj',answerObj);
	   // Make sure we're dealing with a valid answer input, otherwise it might be some other
	   // unrelated select tag
	   if (answerObj !== undefined && answerObj !== null) {
	       answerObj.matchingSelection = matchingDropdowns[i].value;
	       if (matchingDropdowns[i].value == "none_selected") {
	           this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(null);
	       } else {
	           this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(assessmentObjects[matchingDropdowns[i].value]);
	       }
	   }
	}

	//TextArea Questions
	for (i = 0; i < longAnswers.length; i++)
	{
	   answerObj = assessmentObjects[longAnswers[i].id];
	   // Make sure we're dealing with a valid answer input, otherwise it might be some other
	   // unrelated select tag
	   if (answerObj !== undefined && answerObj !== null) {
	       answerObj.userText = longAnswers[i].value;
	       this.assessment.questionBank[this.currentLevel][questionIdx].userResponses.push(answerObj);
	   }
	}

	//	Add this question to the askedQuestions array
	this.askedQuestions.push(this.assessment.questionBank[this.currentLevel][questionIdx]);
	//log('askedQuestions',this.askedQuestions);

   
}

// This function will handle a "submit" done by the learner.  It will retrieve and save any answers
// given by the learner and proceed to display the next question or invoke final processing.  This
// fucntion serves largely as the "controller" for the application.	
function AssessmentEngine_next()
 {
	//$("#nextButton").hide();
	//$("#prevButton").hide();
	if (this.state != NEXT_QUESTION){
		this.recordCurrentInputs();
		
	} else {
		this.state = ASK_QUESTION;
	}
	
	//check to see if they have hit the totalMissedQuestionThreshold
	if (this.state != SHOW_SINGLE_RESULT && (this.assessment.totalMissedQuestionThreshold > 0 && this.missedQuestionCount >= this.assessment.totalMissedQuestionThreshold)) {
		log('missed too many ('+this.missedQuestionCount+'). exiting...',this,arguments);
	    this.state = FINISHED;
	    this.finishQuiz();
	    this.render();
	    return;
	}

    if (this.state == ASK_QUESTION)
    {
		if (this.assessment.showAllQuestionsOnSinglePage)
		{
			
			for (var questionIdx = 0; questionIdx < this.assessment.questionBank[this.currentLevel].length; questionIdx++)
            {
				if (isCorrect(this.assessment.questionBank[this.currentLevel][questionIdx]))
	            {
					this.assessment.questionBank[this.currentLevel][questionIdx].isCorrect = true;
				}else{
					if(this.assessment.questionBank[this.currentLevel][questionIdx].isCorrect != true)
					{
						this.assessment.questionBank[this.currentLevel][questionIdx].isCorrect = false;
					}
				}
				this.assessment.questionBank[this.currentLevel][questionIdx].beenAsked = true;
			}
			this.state = FINISHED;
            this.finishQuiz();
            this.render();
			
		}
		else
		{
        	if (!isAllLevelsComplete())
        	{
				// all levels have not been completed
	            if (this.assessment.questionLevels[this.currentLevel-1].override == true)
	            {
					// are we in an override? YES - this is a special question that can advance the level
	                if (isCorrect(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex]))
	                {
					
	                    //this was a correct answer on a level override, so increment the level and proceed
	                    //but first, reset the level override
	                    this.assessment.questionLevels[this.currentLevel-1].override = false;
	                    this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
						this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = true;
					
	                    this.currentLevel++;
						//log('currentLevel raised to '+this.currentLevel);
	                    //get the next unanswered question from the next level
	                    nextIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
	                    //need to check for 'false' here... that means there are no more available questions in the current level
	                    if (nextIndex == false)
	                    {
	                        //for now, if we run out of questions for the level, just increment the level and move on.
	                        this.currentLevel++;
							//log('currentLevel raised to '+this.currentLevel);
	                        nextIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
	                    }
	                    //also check for undefined, but this should not happen
	                    if (nextIndex != undefined)
	                    {
	                        this.currentQuestionIndex = nextIndex;
	                    }
	                } else {
	                    //override question was incorrect...
	                    this.missedQuestionCount++;
						this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
						if(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect != true)
						{
							this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = false;
						}
						//need to load up the next question here
						//log('missed override question - currentLevel still at '+this.currentLevel);
	                    //get the next unanswered question from the next level
	                    nextIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
	                    //need to check for 'false' here... that means there are no more available questions in the current level
	                    if (nextIndex == false)
	                    {
	                        //for now, if we run out of questions for the level, just increment the level and move on.
	                        this.currentLevel++;
							//log('out of questions at that level - currentLevel raised to '+this.currentLevel);
	                        nextIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
	                    }
	                    //also check for undefined, but this should not happen
	                    if (nextIndex != undefined)
	                    {
	                        this.currentQuestionIndex = nextIndex;
	                    }
	                }

	            }
	            else if (!isCurrentLevelComplete())
	            {
					//current level not completed yet
	                if (!isCorrect(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex]))
	                {
	                    if (this.currentLevel > 1)
	                    {
	                        this.currentLevel--;
							//log('currentLevel decreased to '+this.currentLevel);
	                        this.assessment.questionLevels[this.currentLevel-1].override = true;
	                    }
	                    this.missedQuestionCount++;
						if(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect != true)
						{
							this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = false;
						}
	                }else{
						this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = true;
					}
					
					if (this.assessment.randomizequestionsequence)
					{
	                	this.currentQuestionIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
		                if (this.currentQuestionIndex != 'false' && this.currentQuestionIndex != false)
		                {
		                    this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
		                } else {
		                    this.currentQuestionIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
		                    //this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
		                }
					} else {
						if (this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex + 1] != undefined && this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex + 1] != null){
							this.currentQuestionIndex = this.currentQuestionIndex + 1;
							this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
						}
					}
	            }
	            else
	            {
					//current Level complete, but not all levels
	                if (isCorrect(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex]))
	                {
						this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = true;
	                    if (this.currentLevel >= this.assessment.questionLevels.length)
	                    {
							//log('this.currentlevel ('+this.currentLevel+') >= this.assessment.questionLevels.length-1 ('+(this.assessment.questionLevels.length - 1)+')');
	                        this.state = FINISHED;
	                        this.finishQuiz();
	                        this.render();
	                        return;
	                    } else {
	                        this.currentLevel++;
							//log('currentLevel raised to '+this.currentLevel);
	                    }
	                } else {
	                    if (this.currentLevel > 1)
	                    {
	                        this.currentLevel--;
	                        this.assessment.questionLevels[this.currentLevel-1].override = true;
	                        //I dont' think we ever care about setting this back to false once it's flipped
	                    }
	                    this.missedQuestionCount++;
						if(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect != true)
						{
							this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = false;
						}
	                }
					
					if (this.assessment.randomizequestionsequence)
					{
	                	this.currentQuestionIndex = getRandomUnaskedQuestionIndexFromCurrentLevel();
						//log('new level - first question index:'+this.currentQuestionIndex);
		                if (this.currentQuestionIndex != 'false' && this.currentQuestionIndex != false)
		                {
		                    this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
		                } else {
							//log('this.currentQuestionIndex=false');
		                    this.state = FINISHED;
		                    this.finishQuiz();
		                    this.render();
		                }
					} else {
						if (this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex + 1] != undefined && this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex + 1] != null){
							this.currentQuestionIndex = this.currentQuestionIndex + 1;
							this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
						} else {
							//log('this.currentQuestionIndex=false');
		                    this.state = FINISHED;
		                    this.finishQuiz();
		                    this.render();
		                }
					}
	                
					
	            }
	        } else {
				//grade the final question and mark it beenAsked
				if (isCorrect(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex]))
	            {
					this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = true;
				}else{
					if(this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect != true)
					{
						this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].isCorrect = false;
					}
				}
				this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
			
	            this.state = FINISHED;
	            this.finishQuiz();
	            this.render();
	        }
		}

        if (this.state == FINISHED)
        {
            if (typeof(SCORMDriver.SetDataChunk) == 'function')
            {
                // Since we're done, we no longer need the suspend data, so go ahead and clear it
                // and replace it with the attempt count.
                SCORMDriver.SetDataChunk(this.numberOfAttempts);
            }
        }
        else
        {
            // Save state to the LMS
            this.saveState();
        }
		
		//check to see if they have hit the totalMissedQuestionThreshold
		if (this.assessment.totalMissedQuestionThreshold > 0 && this.missedQuestionCount >= this.assessment.totalMissedQuestionThreshold){
			log('missed too many ('+this.missedQuestionCount+'). exiting...',this,arguments);
			this.state = FINISHED;
			this.finishQuiz();
			this.render();
			return;
		}else{
			// Render the Assessment in it's current state
			this.render();
		}
    }
    else if (this.state == SHOW_SINGLE_RESULT)
    {
        this.render();
    }
	else if (this.state == FINISHED)
    {
		if (typeof(SCORMDriver.ConcedeControl) == 'function')
		{
			log('conceding control');
			SCORMDriver.ConcedeControl();
		}
	}
}

function AssessmentEngine_back()
 {
    if (assessmentEngine.assessment.questionBank[this.currentLevel][this.currentQuestionIndex - 1] !== undefined)
    {
		//this.recordCurrentInputs();
        assessmentEngine.currentQuestionIndex--;
        this.render();
    }
    else
    {
        alert("Can not move back, already at first question");
    }
}

function AssessmentEngine_finishQuiz()
 {
    var correctCount = 0;
    var askedQuestionCount = 0;
    for (var i = 0; i < this.askedQuestions.length; i++)
    {
		
        if (this.askedQuestions[i].beenAsked)
        {
            askedQuestionCount++;

            if (this.askedQuestions[i].isCorrect)
            {
                correctCount++;
            }
        }
    }

    // Record answers as interactions
    if (this.assessment.recordInteractions) {
        recordAllAnswersAsInteractions();
    }

    // Set the score for the interface
    this.assessment.score = Math.round((correctCount / askedQuestionCount) * 100);

    if (this.assessment.mode === "test")
    {
        if (typeof(SCORMDriver.SetScore) == 'function')
        {
            // Send the score to the LMS
            SCORMDriver.SetScore(this.assessment.score, 100, 0);

            if (this.assessment.score >= this.assessment.passingScore)
            {
                SCORMDriver.SetPassed();
            }
            else
            {
                SCORMDriver.SetFailed();
            }
        }
    }
    else if (this.assessment.mode === "survey")
    {
        if (typeof(SCORMDriver.SetReachedEnd) == 'function')
        {
            // Tell the LMS that we've finished
            SCORMDriver.SetReachedEnd();
        }
    }

    return true;
}

function AssessmentEngine_initialize() {

    if (ENGINE_VERSION != this.assessment.engineVersion) {
        throw new Error('Versions dont match');
    }

    // Set up the basic screen
    if (this.assessment.stylesheetUrl !== null && this.assessment.stylesheetUrl.length > 0)
    {
        applyStylesheet(this.assessment.stylesheetUrl);
    }

	// Clear the current view
    $("#assessment").html('');

    // Build the basic structure and submit button inside the pre-existing assessment <div>
    var assessmentForm = $("#assessment");

    if (this.assessment.displayTitle) {
        $("#assessment").append("<div id='title'>" + this.assessment.title + "</div>");
    }

    // Create the prev/next controls along with the "question 1 of 3" type counter
    var controls = $('<table id="controls"></table>');
    var controlRow = $('<tr></tr>');
    controlRow.append("<td><input class='btn' style='display: none' onclick='assessmentEngine.back();assessmentEngine.handleBackClick();' title='Previous' id='prevButton' type='button' value='" + assessmentEngine.assessment.backButtonCaption + "'></td>");
    controlRow.append("<td><span id='questionCount'></span></td>");

    if (this.assessment.timeLimit != null && this.assessment.timeLimit > 0)
    {
        controlRow.append("<td><span id='timerCountdown'></span></td>");
    }

    controlRow.append("<td><input class='btn' onclick='assessmentEngine.next();assessmentEngine.handleNextClick()' title='" + assessmentEngine.assessment.nextButtonCaption + "' id='nextButton' type='button' value='" + assessmentEngine.assessment.nextButtonCaption + "'></td>");

    controls.append(controlRow);

    // By default, prev/next controls are placed at the top of the quiz, however if a pre-defined <div> named 'controlSection'
    // is found in the hosting page, buttons will added there.
    var controlSection = $("#controlSection");
    if (controlSection != null)
    {
        controlSection.append(controls);
    }
    else
    {
        assessmentForm.append(controls);
    }

    assessmentForm.append($('<div id="assessmentSection"></div>'));

    var numberOfAttempts = 0;

    if (typeof(SCORMDriver.GetDataChunk) == 'function')
    {
        numberOfAttempts = SCORMDriver.GetDataChunk();
    }

    if (numberOfAttempts.length > 0 && numberOfAttempts.length < 5)
    {
        this.numberOfAttempts = numberOfAttempts;
    }

    if (typeof(SCORMDriver.GetStatus) == 'function')
    {

        var status = SCORMDriver.GetStatus();
        if (status === SCORMDriver.LESSON_STATUS_PASSED ||
        status === SCORMDriver.LESSON_STATUS_COMPLETED ||
        status === SCORMDriver.LESSON_STATUS_FAILED)
        {
            if (this.assessment.allowRetakeWhenFailed && status === SCORMDriver.LESSON_STATUS_FAILED
            && this.numberOfAttempts < this.assessment.maxNumberOfAttempts
            )
            {
                // Ask the user if he would like to retake
                if (confirm("You have previously completed this assessment.  To retake click \"OK\", otherwise click \"Cancel\""))
                {
                    SCORMDriver.SetDataChunk("");
                    SCORMDriver.ResetStatus();
                }
                else
                {
                    this.state = FINISHED;
                    SCORMDriver.ConcedeControl;
                }
            }
            else
            {
                // Write a message to the screen and set state to FINISHED and render and exit button
                var msg = $("<div id='message'></div>");

                if (status === SCORMDriver.LESSON_STATUS_FAILED && this.numberOfAttempts >= this.assessment.maxNumberOfAttempts)
                {
                    msg.html("<p>You have reached the maximum number of attempts allowed on this assessment.  Please exit by clicking \"Exit\".</p>");
                }
                else
                {
                    msg.html("<p>You have already completed this assessment.  Please exit by clicking \"Exit\".</p>");
                }

                $('#assessmentSection').append(msg);

                this.state = FINISHED;
            }
        }
    }
    // If not finished, check the time limit
    if (this.totalTime > this.assessment.timeLimit) {
        if (this.totalTime >= this.assessment.timeLimit)
        {
            msg = document.createElement("div");
            msg.align = "center";
            msg.innerHTML = "<p>You have reached the time limit allowed for this assessment.  Please exit by clicking \"Exit\" above.</p>";
            assessmentSection.appendChild(msg);
            this.state = FINISHED;
        }
    }

    if (this.state === FINISHED)
    {
        // Change the "next" button to an "exit" button
        $("#nextButton").val('Exit');
        $("#nextButton").attr('title', 'Exit');
        $("#nextButton").click(function() {
            if (typeof(SCORMDriver.ConcedeControl) == 'function')
            {
				log('conceding control');
                SCORMDriver.ConcedeControl();
            }
        });

        //This may also need to go back to the top here...
    }

    return;
}

function AssessmentEngine_saveState()
 {
   currentState = JSON.stringify(this);
	//log('state',currentState,arguments);
    if (typeof(SCORMDriver.SetDataChunk) == 'function')
    {
        //SCORMDriver.SetDataChunk(currentState);
    }
}

function AssessmentEngine_loadState() {

    // Attempt to retrieve state data from the LMS
    currentState = SCORMDriver.GetDataChunk();

    var i = 0;

    // If no state was found, this must be the first time in, so don't load anything...
    // If the length is less than 5, the state is holding the number of attempts
    if (currentState === null || currentState === "" || currentState.length < 5) {
        return;
    }else{
		aeState = JSON.parse(currentState);
		this.assessment = aeState.assessment;
		this.score = aeState.score;
		this.state - aeState.state;
	}
}

function AssessmentEngine_renderSplashScreen()
 {
    ae = this;
    // get a reference to the AssessmentEngine here
    $("#controlSection").css('display', 'none');
    $("#assessmentSection").append('<div id="splashscreen">' + this.assessment.splashPageTemplate + '<div id="startbutton">' + this.assessment.startButtonCaption + '<div></div');
    $("#startbutton").click(function() {
        ae.state = ASK_QUESTION;
        ae.render();
    });
}

function buildAnswersHtml(currentQuestion) {
	var answers = document.createElement("div");
    answers.className = "answers";

    var answer = null;

    if (currentQuestion.type == "fill in the blank")
    {
        answer = document.createElement("div");
        answer.className = "answer";
        if (currentQuestion.answers[0].userText !== undefined && currentQuestion.answers[0].userText.length > 0)
        {
            if (currentQuestion.multiline == "true")
            {
                answer.innerHTML = "<textarea qid='" + currentQuestion.id + "' id='" + currentQuestion.answers[0].id + "'  rows='" + currentQuestion.rows + "' cols='" + currentQuestion.cols + "' name='answers' >" + currentQuestion.answers[0].userText + "</textarea>";
            } else {
                answer.innerHTML = "<input qid='" + currentQuestion.id + "' type='text' id='" + currentQuestion.answers[0].id + "' size='" + currentQuestion.textBoxSize
                + "' name='answers' value='" + currentQuestion.answers[0].userText + "'>";
            }
        }
        else
        {
            if (currentQuestion.multiline == "true")
            {
                answer.innerHTML = "<textarea qid='" + currentQuestion.id + "' id='" + currentQuestion.answers[0].id + "'  rows='" + currentQuestion.rows + "' cols='" + currentQuestion.cols + "' name='answers' ></textarea>";
            } else {
                answer.innerHTML = "<input qid='" + currentQuestion.id + "' type='text' id='" + currentQuestion.answers[0].id + "' name='answers' size='" + currentQuestion.textBoxSize + "'>";
            }
        }
        answers.appendChild(answer);
    }
    else if (currentQuestion.type == "matching")
    {
        var matchingChoices = document.createElement("div");
        matchingChoices.className = "answers";
        var choicesTable = "<table style='margin-bottom: 10px' width='60%' cellspacing='0' cellpadding='0'>";
        var rowClass = "";
        for (var choiceCounter = 0; choiceCounter < currentQuestion.answers.length; choiceCounter++)
        {
            if (choiceCounter % 4 == 0) {
                rowClass += "matchingStatement";
            } else {
                rowClass += "matchingStatementAlt";
            }

            if (choiceCounter % 2 == 0) choicesTable += "<tr class='" + rowClass + "'>";

            var nextListBullet = ALPHABET.charAt(choiceCounter) + ". ";
            choicesTable += "<td class='answer'>" + nextListBullet + currentQuestion.answers[choiceCounter].text + "</td>";
            if (choiceCounter % 2 == 1) choicesTable += "</tr>";
        }
        choicesTable += "</table>";
        matchingChoices.innerHTML = choicesTable;
        answers.appendChild(matchingChoices);


        var matchingStatements = document.createElement("div");
        matchingStatements.className = "answers";
        var statementsTable = "<table width='95%' cellspacing='0' cellpadding='0'>";
        rowClass = "";

		//setup the matchingStatements arrary
		currentQuestion.matchingStatements = [];
		//log('currentQuestion.answers',currentQuestion.answers);
		for(var i=0;i<currentQuestion.answers.length;i++) {
			if(typeof(currentQuestion.answers[i])!='undefined') {
				currentQuestion.matchingStatements.push({"matchingStatement":currentQuestion.answers[i].matchingStatement,"id":currentQuestion.answers[i].id});
			}
		}
		currentQuestion.matchingStatements.sort(function() {return 0.5 - Math.random();});
		
        for (var statementCounter = 0; statementCounter < currentQuestion.matchingStatements.length; statementCounter++)
        {
            if (statementCounter % 2 == 0) {
                rowClass = "matchingStatement";
            } else {
                rowClass = "matchingStatementAlt";
            }
            statementsTable += "<tr class='" + rowClass + "'>";
            nextListBullet = (statementCounter + 1) + ". ";
            statementsTable += "<td class='answer'>" + nextListBullet + currentQuestion.matchingStatements[statementCounter].matchingStatement + "</td>";
            statementsTable += "<td  align='right' class='answer'>" + createMatchingDropdown(currentQuestion.answers, currentQuestion.matchingStatements[statementCounter].id, currentQuestion.matchingStatements[statementCounter].matchingSelection,currentQuestion.id) + "</td>";
            statementsTable += "</tr>";

        }
        statementsTable += "</table>";
        matchingStatements.innerHTML = statementsTable;
        answers.appendChild(matchingStatements);

    }
    else if (currentQuestion.type == "slide")
    {
        // nothing.... don't show any anwers (only valid in survey mode)
        }
    else
    // multiple choice or true/false
    {

        for (i = 0; i < currentQuestion.answers.length; i++) {
            answer = document.createElement("div");
            answer.className = "answer";

            // Determine next buttlet and override bullet for true/false which should have none
            if (currentQuestion.type == "true/false") {
                nextListBullet = "";
            } else if (assessmentEngine.assessment.answerListBullet == "numeric") {
                nextListBullet = (i + 1) + ") ";
            } else if (assessmentEngine.assessment.answerListBullet == "alphabetic") {
                nextListBullet = ALPHABET.charAt(i) + ") ";
            } else {
                nextListBullet = "";
            }

            // Set checked to "checked" if this answer was one selected by the user (for use when rendered
            // by the "back" button)
            var checked = "";
            for (var j = 0; j < currentQuestion.userResponses.length; j++) {
                if (currentQuestion.answers[i] == currentQuestion.userResponses[j])
                {
                    checked = "checked";
                    break;
                }
            }

            if (currentQuestion.type == "multiple choice multiple answer")
            // Define the choice as a checkbox
            {
                answer.innerHTML = "<input qid='" + currentQuestion.id + "' " + checked + " type='checkbox' id='answer_" + currentQuestion.answers[i].id + "' name='answers_" + currentQuestion.id + "' value='" + currentQuestion.answers[i].id + "'> "
                + "<span style='cursor: hand' onclick='javascript:toggleCheck(\"answer_" + currentQuestion.answers[i].id + "\");'>" + nextListBullet + currentQuestion.answers[i].text + "</span>";
            }
            else
            // Define the choice as a radio button
            {
				switch(i){
					case 0:
						accesskey = 'a';
						break;
					case 1:
						accesskey = 'b';
						break;
					case 2:
						accesskey = 'c';
						break;
					case 3:
						accesskey = 'd';
						break;
					default:
						accesskey = '';
						break;
				}
				
                answer.innerHTML = "<input qid='" + currentQuestion.id + "' " + checked + " accesskey='" + accesskey + "' type='radio' id='answer_" + currentQuestion.answers[i].id + "' name='answers_" + currentQuestion.id + "' value='" + currentQuestion.answers[i].id + "'> "
                + "<span style='cursor: hand' onclick='javascript:toggleCheck(\"answer_" + currentQuestion.answers[i].id + "\");'>" + nextListBullet + currentQuestion.answers[i].text + "</span>";
            }

            answers.appendChild(answer);
        }
    }
	//log('currentQuestion',currentQuestion);
	for(i=0;i<currentQuestion.answers.length;i++)
	{
		if(currentQuestion.answers[i].isCorrect)
		{
			//log('correct answer', currentQuestion.answers[i].text);
		}
	}
	
	return answers;
}

// Handles all User Interface rendering by manipulating the browsers Document Object Model
function AssessmentEngine_render()
 {
	//log(this.assessment);
    var i = 0;

    if (this.state == INIT)
    {
        this.numberOfAttempts++;
        //this.state = ASK_QUESTION;
        this.renderSplashScreen();

        // Start the timer here since we're now rendering... don't want to start the timer until right before
        // the user can enter input.
        startTime = (new Date()).getTime();
        if (this.assessment.timeLimit != null && this.assessment.timeLimit > 0) {
            assessmentEngine.checkTimeLimit();
        }
    }


    // Conditionally show the "previous/back" button
    if (this.assessment.showBackButton && this.state != FINISHED && this.askedQuestions.length > 1 && this.currentQuestionIndex > 0)
    {
        $('#prevButton').css('display', 'none');
    }
    else
    {
        $('#prevButton').css('display', 'none');
    }

	//$("#nextButton").hide();


    if (this.state == ASK_QUESTION)
    {
		//$("#nextButton").hide();
        //show the controlSection
        $("#controlSection").css('display', 'block');

        // Clear the current view
        $("#assessmentSection").html('');

        if (!this.assessment.showAllQuestionsOnSinglePage)
        {
			assessmentEngine.currentQuestionCount++;
            var currentQuestion = this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex];
            this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex].beenAsked = true;
			
            // Show "Question x of total
            var questionCount = $("#questionCount");

            // If a title is given to the question, use that instead of the generic question count
            if (currentQuestion.title != null) {
                $("#questionCount").html(currentQuestion.title);
            } else {
                //$("#questionCount").html("Question " + assessmentEngine.currentQuestionCount + " of " + assessmentEngine.assessment.questionBank[this.currentLevel].length);
                }

            // Show the next question
            var question = document.createElement("div");
            question.className = "question";

            var questionPrefix = document.createElement("span");
            questionPrefix.innerHTML = assessmentEngine.assessment.questionPrefix;
            question.appendChild(questionPrefix);
			
			var questionText = document.createElement("div");
            questionText.className = "questionText";
            question.appendChild(questionText);

            $("#assessmentSection").append(question);
			
			if (this.assessment.showquestionnumber){
				questionText.innerHTML = assessmentEngine.currentQuestionCount  + ". " + currentQuestion.text;
			} else {
				questionText.innerHTML = currentQuestion.text;
			}
            
            if (currentQuestion.type == "multiple choice multiple answer" && currentQuestion.showNumberOfCorrectChoices)
            {
                var numOfCorrectChoices = 0;
                for (i = 0; i < currentQuestion.answers.length; i++)
                {
                    if (currentQuestion.answers[i].isCorrect) numOfCorrectChoices++;
                }
                questionText.innerHTML += "<div class='numOfCorrectChoices'> [Choose " + numOfCorrectChoices + "]</div>";
            }

            var questionSuffix = document.createElement("span");
            questionSuffix.innerHTML = assessmentEngine.assessment.questionSuffix;
            question.appendChild(questionSuffix);

            var answerPrefix = document.createElement("span");
            answerPrefix.innerHTML = assessmentEngine.assessment.answerPrefix;
            question.appendChild(answerPrefix);



            question.appendChild(buildAnswersHtml(currentQuestion));

            var answerSuffix = document.createElement("span");
            answerSuffix.innerHTML = assessmentEngine.assessment.answerSuffix;
            question.appendChild(answerSuffix);
        }
        else
        // Show All Questions for currentLevel on Single Page
        {
            for (var questionIdx = 0; questionIdx < this.assessment.questionBank[this.currentLevel].length; questionIdx++)
            {
				assessmentEngine.currentQuestionCount++;
	
                // Show the next question
                question = document.createElement("div");
                question.className = "question";

                questionPrefix = document.createElement("span");
                questionPrefix.innerHTML = assessmentEngine.assessment.questionPrefix;
                question.appendChild(questionPrefix);
				
				questionText = document.createElement("div");
                questionText.className = "questionText";
                question.appendChild(questionText);
                $("#assessmentSection").append(question);

                currentQuestion = this.assessment.questionBank[this.currentLevel][questionIdx];
				if (this.assessment.showquestionnumber){
					questionText.innerHTML = assessmentEngine.currentQuestionCount  + ". " + currentQuestion.text;
				} else {
					questionText.innerHTML = currentQuestion.text;
				}
                if (currentQuestion.type == "multiple choice multiple answer" && currentQuestion.showNumberOfCorrectChoices)
                {
                    numOfCorrectChoices = 0;
                    for (i = 0; i < currentQuestion.answers.length; i++)
                    {
                        if (currentQuestion.answers[i].isCorrect) numOfCorrectChoices++;
                    }
                    questionText.innerHTML += "<div class='numOfCorrectChoices'> [Choose " + numOfCorrectChoices + "]</div>";
                }

                questionSuffix = document.createElement("span");
                questionSuffix.innerHTML = assessmentEngine.assessment.questionSuffix;
                question.appendChild(questionSuffix);

                answerPrefix = document.createElement("span");
                answerPrefix.innerHTML = assessmentEngine.assessment.answerPrefix;
                question.appendChild(answerPrefix);

                question.appendChild(buildAnswersHtml(currentQuestion));

                answerSuffix = document.createElement("span");
                answerSuffix.innerHTML = assessmentEngine.assessment.answerSuffix;
                question.appendChild(answerSuffix);

            }

            // Since we've printed all of the questions one one screen, set the currentIndex to the end
            this.currentQuestionIndex = this.assessment.questionBank[this.currentLevel].length - 1;
        }

        // if we're going to show results per answer, switch the state to SHOW_SINGLE_RESULT
        if (this.assessment.feedbackTime === "immediate" || this.assessment.feedbackTime === "both")
        {
            this.state = SHOW_SINGLE_RESULT;
        }
    }
    else if (this.state == SHOW_SINGLE_RESULT)
    {
        currentQuestion = this.assessment.questionBank[this.currentLevel][this.currentQuestionIndex];
    	//currentQuestion = this.askedQuestions[this.askedQuestions.length - 1];
        // Show explanations for failures
        //var explanations = document.createElement("div");
        //explanations.id = "explanations";
        $("#assessmentSection").append($("<div>").attr('id',"explanations"));
        
        
        this.renderExplanation(currentQuestion);

        // Toggle back to question mode now that we've shown the result
        this.state = NEXT_QUESTION;
    }
    else if (this.state == FINISHED)
    {
        // Clear the current view
        $("#assessmentSection").html('');

        // Hide the timer
        var timerCountdownSpan = document.getElementById("timerCountdown");
        if (timerCountdownSpan != null)
        {
            timerCountdownSpan.style.visibility = "hidden";
        }

        // Clear the question count
        questionCount = document.getElementById("questionCount");
        questionCount.innerHTML = "";

        var result = document.createElement("div");
        result.id = "finalReport";

        // Perform substitutions on the template
        var report = this.assessment.finalReportTemplate;
        if (typeof(SCORMDriver.GetStudentName) == 'function')
        {
            report = report.replace("\$STUDENT_NAME", convertToFirstLast(SCORMDriver.GetStudentName()));
        }
        report = report.replace("\$SCORE", this.assessment.score);
        report = report.replace("\$SUCCESS_STATUS",
        (this.assessment.score >= this.assessment.passingScore ? this.assessment.passedstatustext: this.assessment.failedstatustext));

        result.innerHTML = report;
        $("#assessmentSection").append(result);

        if ((this.assessment.feedbackTime === "end state" || this.assessment.feedbackTime === "both")
        && this.assessment.feedbackLevel !== "nothing")
        {
        	explanations = document.createElement("div");
            explanations.id = "explanations";
            $("#assessmentSection").append(explanations);

            for (i = 0; i < this.askedQuestions.length; i++)
            {
                if (this.askedQuestions[i].beenAsked)
                {
                    this.renderExplanation(this.askedQuestions[i], i + 1);
                }
            }
        }

        // Change the "next" button to an "exit" button
        var button = document.getElementById("nextButton");
        button.value = "Exit";
        button.title = "Exit";
        button.onclick = SCORMDriver.ConcedeControl;

    }
	/*
	$("input").live('click',function(){
		$("#nextButton").show();
	});
	$("label").live('click',function(){
		$("#nextButton").show();
	});
	*/
}

function AssessmentEngine_renderExplanation(currentQuestion, idx)
 {
	//log('rendering Explanation',currentQuestion, idx);
    //log('current question isCorrect',currentQuestion.isCorrect);
    //log('current question iscorrect',currentQuestion.iscorrect);

	    var explanations = document.getElementById("explanations");

	    var newExplanation = document.createElement("div");

	    var answerPrefix = document.createElement("span");
	    
	    var questionCorrect = ((currentQuestion.isCorrect != undefined && (currentQuestion.isCorrect == true || currentQuestion.isCorrect == 'true')) || isCorrect(currentQuestion));
	    
	    answerPrefix.innerHTML = assessmentEngine.assessment.answerPrefix;
	    newExplanation.appendChild(answerPrefix);

	    if (this.assessment.mode === "survey")
	    {
	        newExplanation.className = "notGradedQuestion";
	    }
	    else if (questionCorrect)
	    {
	        newExplanation.className = "correctQuestion";
	    }
	    else
	    {
	        newExplanation.className = "incorrectQuestion";
	    }

	    var result = document.createElement("div");
	    var responseHtml = "";

	    // If we got an index, this means we're rendering multiple questions so include the index number
	    // and repeat the question text
	    if (currentQuestion.type == "matching") {
	        responseHtml = idx + ". \"" + currentQuestion.text + "\"<br><br><div class='userResponseSection'><ol type='a'>";

	        // List the statements
	        var statements = "";
	        for (var x = 0; x < currentQuestion.matchingStatements.length; x++) {
	            statements += "<li>" + currentQuestion.matchingStatements[x].matchingStatement;
	        }
	        responseHtml += statements + "</ol>You answered: <span class='userResponse'>" + formatResponses(currentQuestion.userResponses) + "</span>";
	    } else if (idx !== null && idx !== undefined) {
	        responseHtml = idx + ". \"" + currentQuestion.text + "\"<div class='userResponseSection'>You answered: <span class='userResponse'>" + formatResponses(currentQuestion.userResponses) + "</span>";
	    } else {
	        responseHtml = "<div class='userResponseSection'>You answered: <span class='userResponse'>" + formatResponses(currentQuestion.userResponses) + "</span>";
	    }

	    if (questionCorrect)
	    {
	        //log('current question is correct');
	        responseHtml += " <span class='correct'>correct</span></div>";
	    }
	    else
	    {
	        //log('current question is incorrect');
	        responseHtml += " <span class='incorrect'>incorrect</span></div>";

	        var correctResponses = new Array();
	        for (var idxAns = 0; idxAns < currentQuestion.answers.length; idxAns++)
	        {
	            if (currentQuestion.type == "matching") {
	                correctResponses[correctResponses.length] = currentQuestion.matchingStatements[idxAns];
	            } else {
	                if (currentQuestion.answers[idxAns].isCorrect == true || currentQuestion.answers[idxAns].isCorrect == 'true') //be lenient on the data file
	                {
	                    correctResponses[correctResponses.length] = currentQuestion.answers[idxAns];
	                }
	            }
	        }

	        responseHtml += "<div class='correctResponseSection'>Correct answer: <span class='correctResponse'>" + formatResponses(correctResponses, true) + "</span></div>";
	    }

	    result.innerHTML = responseHtml;
	    newExplanation.appendChild(result);

	    // Print out the explanation(s) for this question if configured to do so
	    if (this.assessment.feedbackLevel === "correct answer and explanation")
	    {
	        var explanation = document.createElement("div");
	        explanation.className = "explanationText";
	        var explanationCount = 0;
	        if (this.assessment.showExplanations === "incorrect only"
	        && (questionCorrect))
	        {
	            // Don't print any explanations because this answer is correct and we're only supposed
	            // to print explanations to incorrect answers.
	            }
	        else
	        {
	            if (this.assessment.explanationLevel === "answer")
	            {
	                for (var i = 0; i < currentQuestion.userResponses.length; i++)
	                {
	                    var r = currentQuestion.userResponses[i];
	                    if (r !== null && r !== undefined && r.explanation !== null && r.explanation !== undefined)
	                    {
	                        explanation.innerHTML += r.explanation + " ";
	                        explanationCount++;
	                    }
	                }
	            }

	            // Show the question level explanation if the level is set to all, or if
	            // we haven't gotten any explanations.   The count will be zero if the
	            // level is "question" or if it's "answer" and no answer-level explanation
	            // was defined in the xml
	            if (this.assessment.explanationLevel === "all" || explanationCount == 0)
	            {
	                if (currentQuestion.explanation !== null)
	                {
	                    explanation.innerHTML += " " + currentQuestion.explanation + explanation.innerHTML;
	                    explanationCount++;
	                }
	            }

	            if (this.assessment.explanationLevel === "all")
	            {
	                for (i = 0; i < currentQuestion.answers.length; i++)
	                {
	                    r = currentQuestion.answers[i];
	                    if (r.explanation !== undefined && r.explanation !== null)
	                    {
	                    	var explText = "<div>";
	                    	if (currentQuestion.type == "true/false") {
	                    		explText += r.text + " : ";
	                        } else if (assessmentEngine.assessment.answerListBullet == "numeric") {
	                        	explText += (i + 1) + ") ";
	                        } else if (assessmentEngine.assessment.answerListBullet == "alphabetic") {
	                        	explText += ALPHABET.charAt(i) + ") ";
	                        } else {
	                        	explText += "";
	                        }
	                    	explText += r.explanation + "</div>";
	                    	
	                        explanation.innerHTML += explText;
	                        explanationCount++;
	                    }
	                }
	            }
	        }

	        if (explanationCount > 0)
	        {
	            newExplanation.appendChild(explanation);
	        }
	    }

	    var answerSuffix = document.createElement("span");
	    answerSuffix.innerHTML = assessmentEngine.assessment.answerSuffix;
	    newExplanation.appendChild(answerSuffix);

	    explanations.appendChild(newExplanation);

}

/*
*
*	Objects
*
*/


// Assessment object definition
function Assessment(data)
 {
	log('in assessment creation',this,arguments);
	this.engineVersion = data.assessment.engineversion;
    this.randomizeQuestionSequence = data.assessment.randomizequestionsequence === "true";
	this.randomizeAnswerSequence = data.assessment.randomizeanswersequence === "true";
	this.showquestionnumber = data.assessment.showquestionnumber === "true";
	this.recordInteractions = data.assessment.recordinteractions === "true";
	this.allowRetakeWhenFailed = data.assessment.allowretakewhenfailed === "true";
    this.maxNumberOfAttempts = data.assessment.maxnumberofattempts;
    this.showAllQuestionsOnSinglePage = data.assessment.showallquestionsonsinglepage === "true";
    this.showBackButton = data.assessment.showbackbutton === "true";
    this.displayTitle = data.assessment.displaytitle === "true";
    this.showExplanations = data.assessment.showexplanations;
    this.explanationLevel = data.assessment.explanationlevel;
    this.feedbackTime = data.assessment.feedbacktime;
    this.feedbackLevel = data.assessment.feedbacklevel;
    this.title = data.assessment.title;
    this.passingScore = data.assessment.passingscore - 0.0;
    this.splashPageTemplate = data.assessment.splashpagetemplate;
    this.finalReportTemplate = data.assessment.finalreporttemplate;
    this.stylesheetUrl = data.assessment.stylesheeturl;
    this.mode = data.assessment.mode;
    this.timeLimit = data.assessment.timelimit;
    this.answerListBullet = data.assessment.answerlistbullet;
    this.totalMissedQuestionThreshold = data.assessment.totalmissedquestionthreshold;

    this.startButtonCaption = data.assessment.startbuttoncaption;
    this.nextButtonCaption = data.assessment.nextbuttoncaption;
    this.backButtonCaption = data.assessment.backbuttoncaption;
    this.questionPrefix = data.assessment.questionprefix;
    this.questionSuffix = data.assessment.questionsuffix;
    this.answerPrefix = data.assessment.answerprefix;
    this.answerSuffix = data.assessment.answersuffix;
	this.passedstatustext = data.assessment.passedstatustext;
	this.failedstatustext = data.assessment.failedstatustext;

    // Set defaults and alter incompatable settings...
    if (this.maxNumberOfAttempts === null)
    {
        this.maxNumberOfAttempts = 99999;
        // High number = no limit on retakes if not specified
    }

    if (this.mode === null)
    {
        this.mode = "test";
        // Can be "test" or "survey"... default to "test"
    }

    // Immediate feedback is incompatable when all questions are shown/answered at once.  Force this to end state.
    if (this.showAllQuestionsOnSinglePage)
    {
        this.feedbackTime = "end state";
    }

    // Immediate feedback is incompatiable with a feedback level of "nothing"
    if (this.feedbackLevel === "nothing")
    {
        this.feedbackTime = "end state";
    }

    // The back button (prev) is incompatable with immediate feedback.  Since each question is immediate
    // scored, the user can't change his mind.
    if (this.feedbackTime === "immediate" || this.feedbackTime === "both")
    {
        this.showBackButton = false;
    }

    if (this.answerListBullet === null)
    {
        this.answerListBullet = "none";
    }


    // load the questions into Question objects
    this.questions = new Array();

	//log('loading questions',this,arguments);

	this.questions = data.assessment.questions;

	//log('questions',this.questions);
	
	/**************************************************************/
    // Randomize the answers if each question if desired
	/**************************************************************/
	var i = 0;
    if (this.randomizeAnswerSequence)
    {
		//log('randomizing answers');
        for (i = 0; i < this.questions.length; i++)
        {
            // The particular question can suppress the answer randomization so be
            // sure to check this
			//log('checking suppressAnswerRandomization',this.questions[i].suppressanswerrandomization);
            if (this.questions[i].suppressanswerrandomization == "false")
            {
				//log('really randomizing answers');
				skipRandomizeIndexes = [];
				skipRandomizeItems = [];
				doRandomizeIndexes = [];
				tempAnswers = this.questions[i].answers;
				for(a = 0; a < this.questions[i].answers.length; a++)
				{
					if(this.questions[i].answers[a].shuffle==false) {
						skipRandomizeIndexes.push(a);
						skipRandomizeItems.push(this.questions[i].answers[a]);
						tempAnswers.splice(a,1);
					}
				}
				//log('shuffling '+tempAnswers.length+' answers');
                tempAnswers = randomizeArray(tempAnswers);
				
				for(a = 0; a < skipRandomizeIndexes.length; a++)
				{
					tempAnswers.splice(skipRandomizeIndexes[a],0,skipRandomizeItems[a]);
				}
				
				this.questions[i].answers = tempAnswers;
				//this.questions[i].answers = randomizeArray(this.questions[i].answers);
            }
        }
    }

    // If this is matching, we ALWAYS want to create a randomized array for the statements
    // and since the statements are actually part of the answer, we need a separate
    // randomized array for the statements.
    for (i = 0; i < this.questions.length; i++)
    {
        if (this.questions[i].type == "matching") {
            this.questions[i].matchingStatements = randomizeArray(this.questions[i].answers);
        }
    }
	/**************************************************************/
    // Now randomize the questions if necessary
	/**************************************************************/
    if (this.randomizeQuestionSequence)
    {
        this.questions = randomizeArray(this.questions);
	}
	
	/**************************************************************/
    // Now convert the JSON questions to Question Objects
	/**************************************************************/
	var questionObjects = new Array();
	for (i = 0; i < this.questions.length; i++)
	{
		questionObjects.push(new Question(this.questions[i]));
	}
	//reset the questions to the questionObjects
	this.questions = questionObjects;
	
	//build the questionLevels
    this.questionLevels = [];
    j = 0;
    //qLevels = this.questionLevels;
    //need this for scope
    for(j=0;j<data.assessment.questionlevels.length;j++) {
        this.questionLevels.push(new QuestionLevel(data.assessment.questionlevels[j]));
    }
	
	/**************************************************************/
    //	Build the questionBank to separate the levels of questions
	/**************************************************************/
    this.questionBank = new Array();
	//loop through all the questions
    for (i = 0; i < this.questions.length; i++)
    {
        var questionLevel = this.questions[i].level;
        if (this.questionBank[questionLevel] != undefined)
        {
            //this array already exists - add the question to it
            //check to make sure we limit the number of questions as desired
			//if(this.questionBank[questionLevel].length < this.questionLevels[questionLevel-1].numberOfQuestionsToShow)
			//{
            	this.questionBank[questionLevel].push(this.questions[i]);
			//}
        } else {
            //array doesn't exist yet... new level found
            var newLevelArray = new Array();
            //add the current question
            newLevelArray.push(this.questions[i]);
            //add this new array to the questionBank
            this.questionBank[questionLevel] = newLevelArray;
        }
    }

	this.questions = null;



}


// Question object definition
function Question(data)
 {
    this.id = data.id;
    this.type = data.type;
    this.suppressAnswerRandomization = data.suppressanswerrandomization === "true";
    this.showNumberOfCorrectChoices = data.shownumberofcorrectchoices === "true";
    this.text = data.text;
	this.matchingStatement = data.statement;
    this.textBoxSize = data.textboxsize;
    this.level = data.level;
    this.beenAsked = false;

    if (this.textBoxSize === null || this.textBoxSize === undefined)
    {
        this.textBoxSize = 20;
        // default value
    }

    //*******  Multiline feature for FITB questions *********
    this.multiline = data.multiline;

    if (this.multiline === null || this.multiline === undefined)
    {
        this.multiline = false;
        // default value
    }

    this.rows = data.rows;
    if (this.rows === null || this.rows === undefined)
    {
        this.rows = 5;
        //defaults
    }

    this.cols = data.cols;
    if (this.multiline === null || this.multiline === undefined)
    {
        this.cols = 40;
        //defaults
    }

    //*******************************************************
    if (data.explanation)
    {
        this.explanation = data.explanation;
    }
    else
    {
        this.explanation = null;
    }

    if (data.title)
    {
        this.title = data.title;
    }
    else
    {
        this.title = null;
    }

    this.userResponses = [];
    this.answers = [];

    var answerNodes = data.answers;
    var answerCount = 0;

    for (var i = 0; i < answerNodes.length; i++)
    {
        this.answers[this.answers.length] = new Answer(answerNodes[i]);
        //this.answers[this.answers.length - 1].question = this;
    }

	//TODO:move this out of here
    assessmentObjects[this.id] = this;
}

// Answer object definition
function Answer(data)
 {
    this.id = data.id;
    this.shortId = data.shortId;
    this.explanation = data.explanation;
	if(data.iscorrect === "true" || data.iscorrect === true || data.isCorrect === "true" || data.isCorrect === true){
		this.isCorrect = "true";
	}else{
		this.isCorrect = "false";
	}
    
    this.text = data.text;
    this.matchingStatement = data.statement;
    this.userText = "";
    this.regex = data.regex;
    this.fillInTheBlankEvaluationMethod = data.fillintheblankevaluationmethod;
	//for qti-lite
	this.shuffle = false;
	//TODO:move this out of here
    assessmentObjects[this.id] = this;
}

// QuestionLevel object definition
function QuestionLevel(data)
{
	//log('creating QuestionLevel',data.level,data.numberofquestionstoshow,data);
    this.level = data.level;
    this.numberOfQuestionsToShow = data.numberofquestionstoshow;
    this.isComplete = false;
    this.override = false;
}

/*******************************************************
 UTILITY FUNCTIONS
********************************************************/

function isAllLevelsComplete()
 {	
	//log('assessmentEngine.assessment.questionBank',assessmentEngine.assessment.questionBank);
    var result = true;

    for (var iLevel = 1; iLevel < assessmentEngine.assessment.questionBank.length; iLevel++)
    {
        if (typeof(assessmentEngine.assessment.questionBank[iLevel]) != 'undefined')
        {
            for (var i = 0; i < assessmentEngine.assessment.questionBank[iLevel].length; i++)
            {
                if (assessmentEngine.assessment.questionBank[iLevel][i].beenAsked == false)
                {
					//log('level '+iLevel+' not complete');
                    //if any one of the questions are beenAsked=false, then it's not complete
                    result = false;
                }
            }
        }else{
			log('questionBankNotFound iLevel:'+iLevel);
		}
    }

	//log('isAllLevelsComplete returning ' + result,this,arguments);

    return result;
}

function isCurrentLevelComplete()
 {
	
    //check for override and just return false if overriden (missed a question in the next bank)
    if (assessmentEngine.assessment.questionLevels[assessmentEngine.currentLevel-1].override == true)
    {
        return false;
    }
    var result = true;
    var counter = 0;

    for (var i = 0; i < assessmentEngine.assessment.questionBank[assessmentEngine.currentLevel].length; i++)
    {
        if (assessmentEngine.assessment.questionBank[assessmentEngine.currentLevel][i].beenAsked == false)
        {
            //if any one of the questions are beenAsked=false, then it's not complete
            result = false;
        } else {
            counter++;
            //check the numberToDisplay for this level and return true if we have asked that many questions
            if (counter >= assessmentEngine.assessment.questionLevels[assessmentEngine.currentLevel-1].numberOfQuestionsToShow)
            {
                return true;
            }
        }
    }
	//log('isCurrentLevelComplete - returning '+result,this,arguments);
    return result;
}


function getRandomUnaskedQuestionIndexFromCurrentLevel()
 {
	//log('getRandomUnaskedQuestionIndexFromCurrentLevel currentLevel:'+assessmentEngine.currentLevel);
    if (!isCurrentLevelComplete())
    {
        var len = assessmentEngine.assessment.questionBank[assessmentEngine.currentLevel].length;
		//log('searching '+len+' questions at level ' + assessmentEngine.currentLevel);
        var rand = Math.floor((len) * Math.random());

        if (assessmentEngine.assessment.questionBank[assessmentEngine.currentLevel][rand].beenAsked == false)
        {
			//log('ranQuestion-returning:'+rand);
            return rand;
        } else {
			//log('ranQuestion-recurse');
            return getRandomUnaskedQuestionIndexFromCurrentLevel();
            //recurse and find an unasked one...
        }
    } else {
		//log('CurrentLevel ('+assessmentEngine.currentLevel+') is complete getRandomUnaskedQuestionIndexFromCurrentLevel returning ' + false);
        return false;
    }
}

function randomizeArray(arr)
 {
	var reorderedArray = new Array();
	if(arr!=null && arr.length>0)
	{
    	var iRandomIndexes = createRandomIndexes(arr.length);

    	for (var i = 0; i < arr.length; i++)
    	{
        	reorderedArray[i] = arr[iRandomIndexes[i]];
    	}
	}
	return reorderedArray;
}


// Return an random array of index integers for an array of the given size.
//   ex: createRandomIndexes(5) might return [3,4,0,2,1]
function createRandomIndexes(arraySize) {

    var randomIndexes = new Array();

    for (var i = 0; i < arraySize; i++)
    {
        // Find a new random integer between 0 and arraySize-1
        // that isn't already in the randomIndexes array	
        var newIndexFound = false;
        while (!newIndexFound)
        {
            var index = Math.floor(Math.random() * arraySize);
            if (!arrayContains(randomIndexes, index))
            {
                newIndexFound = true;
            }
        }

        randomIndexes[i] = index;
    }

    return randomIndexes;
}

// Returns true if given array contains the given object
function arrayContains(arr, obj)
 {
    var result = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == obj) {
            result = true;
            break;
        }
    }
    return result;
}

// Simple helpe function that is used so that users can click the text of a checkbox and achieve
// the same effect as clicking the checkbox istelf

//replace this with .toggle()?
function toggleCheck(inputId)
 {
    var input = document.getElementById(inputId);
    if (input !== null)
    {
        if (input.checked)
        input.checked = false;
        else
        input.checked = true;
    }
}

// Used to create an array of SCORMDriver Response Identifiers representing a set of user responses
function wrapUserResponses(arr)
 {
    var wrappedResponses = new Array();
    if (typeof(SCORMDriver.CreateResponseIdentifier) == 'function')
    {
        for (var i = 0; i < arr.length; i++)
        {
            if (arr[i] !== undefined && arr[i] !== null) {
				//log(arr[i].shortId, arr[i].text);
                wrappedResponses[wrappedResponses.length] = SCORMDriver.CreateResponseIdentifier(arr[i].shortId, arr[i].shortId);
            } else {
                wrappedResponses[wrappedResponses.length] = SCORMDriver.CreateResponseIdentifier("u", "unanswered");
            }
        }
    }
    return wrappedResponses;
}

// Used to create an array of SCORMDriver Response Identifiers representing a set of correct responses
// given an array of ALL answers to a question
function wrapCorrectResponses(arr)
 {
    var wrappedResponses = new Array();

    for (var i = 0; i < arr.length; i++)
    {
        if (arr[i].isCorrect)
        {
            if (typeof(SCORMDriver.CreateResponseIdentifier) == 'function')
            {
                wrappedResponses[wrappedResponses.length] = SCORMDriver.CreateResponseIdentifier(arr[i].shortId, arr[i].shortId);
            }
        }
    }

    return wrappedResponses;
}

// Used to create an array of SCORMDriver Matching Responses epresenting a set of user responses
function wrapMatchingResponses(answers, correctAnswers)
 {
    var wrappedResponses = new Array();

    for (var i = 0; i < answers.length; i++)
    {
        if (typeof(SCORMDriver.MatchingResponse) == 'function')
        {
            wrappedResponses[wrappedResponses.length] = new SCORMDriver.MatchingResponse(answers[i], correctAnswers[i]);
        }
    }

    return wrappedResponses;
}


function recordAllAnswersAsInteractions() {

    if (typeof(SCORMDriver.RecordTrueFalseInteraction) == 'function')
    {

        for (var iLevel = 1; iLevel < assessmentEngine.assessment.questionBank.length; iLevel++)
        {
            for (var i = 0; i < assessmentEngine.assessment.questionBank[iLevel].length; i++)
            {
                var q = assessmentEngine.assessment.questionBank[iLevel][i];
                if (q.beenAsked)
                {
                    if (q.type == "true/false") {
                        var blnResponse = null;
                        if (q.userResponses.length > 0 && q.userResponses[0] != null) {
                            blnResponse = q.userResponses[0].text.toLowerCase() === "true";
                        } else {
                            blnResponse = null;
                        }

                        for (var ansCnt = 0; ansCnt < q.answers.length; ansCnt++) {
                            if (q.answers[ansCnt].isCorrect) {
                                var blnCorrectResponse = q.answers[ansCnt].text.toLowerCase() == "true";
                                break;
                            }
                        }
                        SCORMDriver.RecordTrueFalseInteraction(q.id, blnResponse, (blnResponse == blnCorrectResponse), blnCorrectResponse,q.text);
                    } else if (q.type == "fill in the blank") {

                        SCORMDriver.RecordFillInInteraction(q.id, q.userResponses[0].userText, isCorrect(q), q.answers[0].text,q.text);

                    } else if (q.type == "matching") {

                        var userResponses = new Array();
                        for (var j = 0; j < q.answers.length; j++) {
                            if (q.answers[j].matchingSelection == "none_selected") {
                                userResponses[userResponses.length] = null;
                            } else {
                                userResponses[userResponses.length] = assessmentObjects[q.answers[j].matchingSelection];
                            }
                        }

                        var correctResponses = new Array();
                        for (j = 0; j < q.answers.length; j++) {
                            correctResponses[correctResponses.length] = q.answers[j];
                        }
                        SCORMDriver.RecordMatchingInteraction(q.id, wrapMatchingResponses(wrapUserResponses(userResponses), wrapUserResponses(correctResponses)), isCorrect(q), wrapMatchingResponses(wrapUserResponses(correctResponses), wrapUserResponses(correctResponses)),q.text);
                    } else {
						var correctResponses = new Array();
						for (var k = 0; k < q.answers.length; k++) {
							if (q.answers[k].isCorrect === true || q.answers[k].isCorrect === "true") {
								correctResponses[correctResponses.length] = q.answers[k];
							}
						}
                        SCORMDriver.RecordMultipleChoiceInteraction(q.id, wrapUserResponses(q.userResponses), isCorrect(q), wrapCorrectResponses(correctResponses),q.text);

                    }
                }
            }
        }
    }
}

// Determines if a question is "correct" based on the current state of its corresponding user responses
function isCorrect(question)
 {
    var result = false;
    var i = 0;
    var j = 0;

    if (question.type === "fill in the blank")
    {
        for (i = 0; i < question.answers.length; i++)
        {
            if (question.userResponses[0] == null || question.userResponses[0].userText.length == 0)
            {
                break;
            }
            else if (question.answers[i].fillInTheBlankEvaluationMethod === "exactly")
            {
                if (question.userResponses[0].userText.toLowerCase() === question.answers[i].text.toLowerCase())
                {
                    result = true;
                    break;
                }
            }
            else if (question.answers[i].fillInTheBlankEvaluationMethod === "contains")
            {
                if (question.userResponses[0].userText.toLowerCase().indexOf(question.answers[i].text.toLowerCase()) > -1)
                {
                    result = true;
                    break;
                }
            }
            else if (question.answers[i].fillInTheBlankEvaluationMethod === "starts with")
            {
                if (question.userResponses[0].userText.toLowerCase().indexOf(question.answers[i].text.toLowerCase()) == 0)
                {
                    result = true;
                    break;
                }
            }
            else if (question.answers[i].fillInTheBlankEvaluationMethod === "ends with")
            {
                if (question.userResponses[0].userText.toLowerCase().indexOf(question.answers[i].text.toLowerCase()) > -1
                && (question.userResponses[0].userText.toLowerCase().indexOf(question.answers[i].text.toLowerCase())
                === (question.userResponses[0].userText.length - question.answers[i].text.length)))
                {
                    result = true;
                    break;
                }
            }
            else if (question.answers[i].fillInTheBlankEvaluationMethod === "regular expression")
            {
                var regExToEval = question.answers[i].regex;
                var userText = question.userResponses[0].userText;

                var regEx = new RegExp(regExToEval, "i");
                result = regEx.test(userText);
            }
        }
    }
    else if (question.type === "matching")
    {
        result = true;

        for (i = 0; i < question.answers.length; i++)
        {
            // For matching questions, the id of teh answer will match
            // the matchingSelection
            if (question.answers[i].id !== question.answers[i].matchingSelection)
            {
                result = false;
                break;
            }
        }
    }
    else
    // multiple choice or true/false
    {
        var correctCount = 0;
        var expectedCorrectCount = 0;

        for (i = 0; i < question.answers.length; i++)
        {
            // For each correct answer, make sure the user chose it
            if (question.answers[i].isCorrect == true || question.answers[i].isCorrect == "true") //be lenient on the data file
            {
                expectedCorrectCount++;
                for (j = 0; j < question.userResponses.length; j++)
                {
                    if (question.userResponses[j] === question.answers[i])
                    {
                        correctCount++;
					}
                }
            }
        }

        result = (correctCount === expectedCorrectCount);
    }

	//log('isCorrect returning ' + result,this,arguments);

    return result;
}

//testConvertToFirstLast
// Helper function to convert "Blow, Joe" to "Joe Blow"
function convertToFirstLast(lastFirst) {

    var nameArray = lastFirst.split(',');
    if (nameArray.length === 2)
    return trim(nameArray[1]) + " " + trim(nameArray[0]);
    else
    return lastFirst;
}

// This method will take an array of question ID's or answer ID's and return an array of objects
// represented by those ID's.  This is useful when deserializing the quiz state.
function convertToAssessmentObjects(arr)
 {
    var inflatedArray = new Array();

    // Now that we've got the data, rearrange the layout in memory
    for (var i = 0; i < arr.length; i++)
    {
        if (arr[i].indexOf("*") > 0)
        {
            var fillInTheBlankResponse = arr[i].split("\*");
            inflatedArray[inflatedArray.length] = assessmentObjects[fillInTheBlankResponse[0]];
            inflatedArray[inflatedArray.length - 1].userText = fillInTheBlankResponse[1];
        }
        else if (arr[i].indexOf("$") > 0)
        {
            var matchingResponse = arr[i].split("\$");
            inflatedArray[inflatedArray.length] = assessmentObjects[matchingResponse[0]];
            inflatedArray[inflatedArray.length - 1].matchingSelection = matchingResponse[1];
        }
        else
        {
            inflatedArray[inflatedArray.length] = assessmentObjects[arr[i]];
        }
    }

    return inflatedArray;
}

// This function will dynamically apply a stylesheet ot the page given a URL
function applyStylesheet(stylesheetUrl)
 {
    if (document.createStyleSheet)
    {
        // IE-only Method
        document.createStyleSheet(stylesheetUrl);
    }
    else
    {
        // Loading by this method requires a full url, so build it if
        // we only have a relative url
        if (stylesheetUrl.toLowerCase().indexOf("http") < 0) {
            var loc = document.location.toString();
            var currentLocationBase = loc.substr(0, loc.lastIndexOf("/") + 1);
            stylesheetUrl = currentLocationBase + stylesheetUrl;
        }

        var styles = "@import url('" + stylesheetUrl + "');";
        var newSS = document.createElement('link');
        newSS.rel = "stylesheet";
        newSS.href = "data:text/css," + escape(styles);
        $("head").append(newSS);
    }
}

// This function simply formats an array as a comma-delimited list of strings
function formatResponses(responses, showCorrectResponse)
 {
    var s = "";

    for (var i = 0; i < responses.length; i++)
    {
        if (i > 0) s += ", ";

        // If userText is defined, this is a fill-in-the-blank question and
        // we should give what the user entered.
		if (responses[i] != null){
			if (responses[i].userText !== undefined && (responses[i].fillInTheBlankEvaluationMethod != undefined || responses[i].userText.length > 0) && !showCorrectResponse)
	        s += "\"" + responses[i].userText + "\"";
	        else if (responses[i].matchingStatement !== undefined)
			s += "\"" + responses[i].matchingStatement + "\"";
			else
	        s += "\"" + responses[i].text + "\"";
		} else {
			s += " (no answer) ";
		}
    }

    if (s === "") {
        s = "''";
    }


    return s;
}

function createMatchingDropdown(answers, statementId, selectedAnswerId, currentQuestionId)
 {
    var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    var choicesDropdown = "<select qid='" + currentQuestionId + "' id='" + statementId + "' name='" + statementId + "'>";
    choicesDropdown += "<option value='none_selected'>-</option>";

    for (var choiceCounter = 0; choiceCounter < answers.length; choiceCounter++)
    {
        var SELECTED = "";
        if (answers[choiceCounter].id == selectedAnswerId) {
            SELECTED = " SELECTED ";
        } else {
            SELECTED = "";
        }

        choicesDropdown += "<option" + SELECTED + " value='" + answers[choiceCounter].id + "'>" + ALPHABET.charAt(choiceCounter) + "</option>";

    }
    choicesDropdown += "</select>";
    return choicesDropdown;
}

//testTrim
// Takes out the starting and trailing whitespace from a string
function trim(str)
 {
    return str.replace(/^\s*|\s*$/g, "");
}

//var xml = null; // Hold in window as a global
// This is the main function which should be called within the body's onload event on the hosting html page.
function initializeAssessment(url,datatype)
 {
	log('loading assessment datafile from '+url);
	switch(datatype){
		case 'json':
			$.ajax({
		        type: "GET",
		        url: url,
		        dataType: 'json',
		        success: function(data) {
		            buildAssessment(data);
		        },
		        error: function(xhr, ajaxOptions, thrownError) {
		            log('error loading data',this,arguments);
		        }
		    });
			break;
		case 'legacy-xml':
			break;
		case 'qti-lite':
			$.ajax({
		        type: "GET",
		        url: url,
		        dataType: 'xml',
		        success: function(data) {
		            buildAssessment(window.QtiLiteParser.ParseQtiLite(data));
		        },
		        error: function(xhr, ajaxOptions, thrownError) {
		            log('error loading data',this,arguments);
		        }
		    });
			break;
	}
   
/*
	$(document).keypress(function(event) {
	  	if (event.which == '13') {
	     	//event.preventDefault();
			writeToConsole('return clicked');
			$('#nextButton').click();
	   	}
		//if (event.which == '97') { //a
			$('.answer').each(function(){
				writeToConsole($(this).children(':first').attr("id"));
				
			});
		//}
	  	writeToConsole(event.which);
		writeToConsole(String.fromCharCode(event.which));
	});
	*/
}

function buildAssessment(data)
 {
	//log(data);
    // Construct the AssessmentEngine and hold a reference to it within the window as "a"
    assessmentEngine = new AssessmentEngine(data);
    assessmentEngine.initialize();
    if (assessmentEngine.state != FINISHED)
    {
        //need to fix this loadState since adding Levels
        //assessmentEngine.loadState();
        assessmentEngine.render();
    }
}

function writeToConsole(valueToWrite) {
    if (this.debug == true) {
        log(arguments.callee.caller.name + ' said ' + valueToWrite);
    }
    return;
}




window.QtiLiteParser = (function($) {
	var qlp = {};
	qlp.ParseQtiLite = function(xmlString) {
		parser=new DOMParser();
		xml=parser.parseFromString(xmlString,"text/xml");
		var assessment = {};
		
		
		assessment.engineversion = "2.0";
		assessment.randomizequestionsequence = $(xmlString).find('settings randomizequestionsequence').text();
	    assessment.randomizeanswersequence = $(xmlString).find('settings randomizeanswersequence').text();
	    assessment.recordinteractions = $(xmlString).find('settings recordinteractions').text();
	    assessment.allowretakewhenfailed = $(xmlString).find('settings allowretakewhenfailed').text();
	    assessment.maxnumberofattempts = $(xmlString).find('settings maxnumberofattempts').text();
	    assessment.showallquestionsonsinglepage = $(xmlString).find('settings showallquestionsonsinglepage').text();
	    assessment.showbackbutton = $(xmlString).find('settings showbackbutton').text();
	    assessment.displaytitle = $(xmlString).find('settings displaytitle').text();
	    assessment.showexplanations = $(xmlString).find('settings showexplanations').text();
	    assessment.explanationlevel = $(xmlString).find('settings explanationlevel').text();
	    assessment.feedbacktime = $(xmlString).find('settings feedbacktime').text();
	    assessment.feedbacklevel = $(xmlString).find('settings feedbacklevel').text();
		assessment.title = $(xmlString).find('settings title').text();
	  	assessment.passingscore = $(xmlString).find('settings passingscore').text();
	    assessment.numofquestionstouse =  $(xmlString).find('settings numberofquestionstoshow').text();//numberofquestionstoshow for question levels
	    assessment.splashpagetemplate = $(xmlString).find('settings splashpagetemplate').text();
	    assessment.finalreporttemplate = $(xmlString).find('settings finalreporttemplate').text();
	    assessment.stylesheeturl = $(xmlString).find('settings stylesheeturl').text();
	    assessment.mode = $(xmlString).find('settings mode').text();
	    assessment.timelimit = $(xmlString).find('settings timelimit').text();
	    assessment.answerlistbullet = $(xmlString).find('settings answerlistbullet').text();
	    assessment.totalmissedquestionthreshold = $(xmlString).find('settings totalmissedquestionthreshold').text();

	    assessment.startbuttoncaption = $(xmlString).find('settings startbuttoncaption').text();
	    assessment.nextbuttoncaption = $(xmlString).find('settings nextbuttoncaption').text();
	    assessment.backbuttoncaption = $(xmlString).find('settings backbuttoncaption').text();
	    assessment.questionprefix = "";
	    assessment.questionsuffix = "";
	    assessment.answerprefix = "";
	    assessment.answersuffix = "";
	    assessment.passedstatustext = $(xmlString).find('settings passedstatustext').text();
   	    assessment.failedstatustext = $(xmlString).find('settings failedstatustext').text();
	    
		// load the questions into Question objects
		log('processing questions');
	    assessment.questions = new Array();
	    var questionNodes = $(xmlString).find('item');

	    questionNodes.each(function()
	    {
			q = new Question({	"id" : $(this).attr("ident"),
								"title" : $(this).attr("title"),
								"text" : qlp.ParseQtiMaterialToHtml($(this).find('presentation material:first')),
								"answers" : [],
								"level" : 1
			});

			
			//randonmize answers for this question?
			$(this).find('response_lid render_choice').each(function(){
				if($(this).attr('shuffle')!=null && $(this).attr('shuffle').toLowerCase() == 'yes'){
					q.suppressanswerrandomization = 'false';
				}else{
					q.suppressanswerrandomization = 'true';
				}
			});


			//process the correct answers - do this first so we know it when we need to
			/*<resprocessing>
				<outcomes>
					<decvar vartype = "Integer" defaultval = "0"/>
				</outcomes>
				<respcondition title = "Correct">
					<conditionvar>
						<varequal respident = "MCb_01">B</varequal>
					</conditionvar>
					<setvar action = "Set">1</setvar>
					<displayfeedback feedbacktype = "Response" linkrefid = "Correct"/>
				</respcondition>
				<respcondition title = "Incorrect">
					<conditionvar>
						<not>
							<varequal respident = "MCb_01">B</varequal>
						</not>
					</conditionvar>
					<setvar action = "Set">-1</setvar>
					<displayfeedback feedbacktype = "Response" linkrefid = "Incorrect"/>
				</respcondition>
			</resprocessing>
			*/
			var defaultval = $(this).find('resprocessing outcomes:first').children(':first').attr('defaultval')!=null ? $(this).find('resprocessing outcomes:first').children(':first').attr('defaultval') : '0';

			var responseIdent = $(this).find("resprocessing respcondition[title='Correct'] conditionvar").children('varequal').attr('respident');
			
			// future - check for 'not' and 'unanswered' in addition to 'varequal'
			var correctIdent;
			var responses = $(this).find("resprocessing respcondition").each(function(){
				//find the correct one
				
				if($(this).children('setvar:first').text()!='0'){
					correctIdent = $(this).find('conditionvar').children('varequal:first').text();
				}
				
			});
			
			//process item feedback now so we have it when we create the question
			/*
			<itemfeedback ident = "Correct" view = "Candidate">
				<material>
					<mattext>Yes, you are right.</mattext>
				</material>
			</itemfeedback>
			<itemfeedback ident = "Incorrect" view = "Candidate">
				<material>
					<matemtext>No.</matemtext>
					<mattext>The right answer is B.</mattext>
				</material>
			</itemfeedback>
			*/
			var itemFeedback = [];
			$(this).find('itemfeedback').each(function(){
				itemFeedback[$(this).attr('ident')] = qlp.ParseQtiMaterialToHtml($(this).children(':first'));
			});
			

			$(this).find('response_lid').each(function(){
				q.response_lid = $(this).attr('ident');
				//set the question type here based on rcardnality
				if($(this).attr("rcardinality").toLowerCase()=='single')
				{
					//this is also t/f and likert types
					q.type = 'multiple choice single answer';
				}else if($(this).attr("rcardinality").toLowerCase()=='multiple')
				{
					q.type = 'multiple choice multiple answer';					
				}
				
				//is it timed?
				if($(this).attr("rtiming")!=null){
					q.timed = $(this).attr("rtiming").toLowerCase() == 'yes' ? 'true' : 'false';
				}
			
				// loop responses and build answers
				$(this).find('response_label').each(function(){
					a = new Answer({"id" : q.id + '-' + $(this).attr('ident'),
									"shortId" : $(this).attr('ident'),
									"text" : qlp.ParseQtiMaterialToHtml($(this).children(':first'))
					});
				
					if($(this).attr('rshuffle')!=null){
						a.shuffle = $(this).attr('rshuffle').toLowerCase() == 'no' ? false : true;
						//for now override the question answer shuffle
						//q.suppressanswerrandomization = 'true';
					}else{
						a.shuffle = true;
					}
					
					if(a.shortId == correctIdent){
						a.isCorrect = 'true';
						a.explanation = itemFeedback['Correct'];							
					}else{
						a.isCorrect = 'false';
						a.explanation = itemFeedback['Incorrect'];
					}
					
					//add it to the answers array
					q.answers.push(a);
				});
			});

			//objectives
			/*
			<objectives view = "Candidate">
				<material>
					<mattext>To test your understanding of LAN standards.</mattext>
				</material>
			</objectives>   
			*/
			q.objectives = {};
			$(this).find('objectives').each(function(){
				q.objectives[$(this).attr('view')] = qlp.ParseQtiMaterialToHtml($(this).children(':first'));
			});
			
			
			
			/*<rubric view = "Candidate">
				<material>
					<mattext>Attempt all questions.</mattext>
				</material>
			</rubric>   
			<rubric view = "Scorer">
				<material>
					<mattext>Negative marking is employed.</mattext>
				</material>
			</rubric>*/
			q.rubric = {};
			$(this).find('rubric').each(function(){
				q.rubric[$(this).attr('view')] = qlp.ParseQtiMaterialToHtml($(this).children(':first'));
			});

			assessment.questions.push(q);
	        //assessment.questions.push(new Question(questionNodes[i]));
		
	    });
		
	    assessment.questionlevels = new Array();
		assessment.questionlevels.push(new QuestionLevel({'level':1, "numberofquestionstoshow":assessment.numofquestionstouse}));
		
		
		return {"assessment":assessment};

	};
	
	qlp.ParseQtiMaterialToHtml = function(Material) {
		var htmlResult = '';
		$(Material).children().each(function(){
			switch($(this)[0].nodeName){
				case "mattext":
					htmlResult += $(this).text();
					break;
				case "matemtext":
					htmlResult += '<em>'+$(this).text()+'</em>';
					break;
				case "matimage":
					htmlResult += '<img>'+$(this).text()+'</img>';
					break;
				case "matref":
					htmlResult += $(this).text();
					break;
				default:
					//htmlResult += $(this).text();
					break;
			}
		});
		return htmlResult;
	};
	
	return qlp;
})(jQuery);