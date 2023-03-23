class BoggleGame{
    
  constructor(boardID, timeLimit = 60){
    this.timeLimit = timeLimit;
    this.showTimer();
    
    this.board = $(`#${boardID}`);
    this.word_list = new Set();
    this.score = 0;

    //Count down every 1 second, until 0
    this.timer = setInterval( async ()=>{

      this.timeLimit -= 1;
      this.showTimer();
      
      if(this.timeLimit <= 0){
          clearInterval(this.timer);
          // Display score at end of game
          await this.scoreGame();
      }
    }, 1000);

    //Handle form submission clicked
    $('#guess-form', this.board).on('submit', this.handleSubmit.bind(this))
  }

  // Handle form submission, attempting to guess a word
  async handleSubmit(evt){
    evt.preventDefault();
    //Retrieve form input element
    const $word = $(".guess-word", this.board);
    //Get input value from input element
    let word = $word.val().toLowerCase()
    // Empty/No input given
    if(!word){
        return;
    }
    //Word has been input before already
    if(this.word_list.has(word)){
        this.showMessage(`Already used ${word.toUpperCase()}!`, 'bad');
        $word.val("").focus();
        return;
    }
    //Have server check that the word is valid
    const resp = await axios.get(
        "/validate-word", 
        {params:{ word: word }});
    //Show user a message if the word is NOT valid
    if(resp.data.result === "not-word"){
        this.showMessage(`${word.toUpperCase()} is not a real word!`, 'bad');
    }
    else if(resp.data.result === "not-on-board"){
        this.showMessage(`${word.toUpperCase()} does not exist on this board!`, 
        'bad');
    }
    //Valid word
    else{
        this.showWord(word.toUpperCase());
        this.score += word.length;
        this.showScore();
        this.word_list.add(word);
        this.showMessage(`Added: ${word.toUpperCase()}`, 'ok');
    }

    //Reset form's value after a submit
    $word.val("").focus();
  }

  //Display/Update timer
  showTimer(){
    let newHTML = $('<tr>').addClass("timer")
    
    for(let char of this.timeLimit.toString()){
      newHTML.append($('<span>', {text: char}).addClass('small-dice'))
    }
    
    $('.timer', this.board).replaceWith(newHTML);
  }
  //Display/Update score
  showScore(){
    $(".score", this.board).text(this.score);
  }

  //Add and display word to guessed word list
  showWord(word){
    let newTR = $("<tr>");
    for(let letter of word){
      newTR.append(
        $("<td>",{ text: letter})
      );
    }

    $('#guess-list', this.board)
    .append(newTR);
  }

  //For displaying messages after user inputs something. Additionally allows for styling based on the msg_status
  showMessage(msg, msg_status){
    $('.msg', this.board)
    .removeClass()
    .text(msg)
    .addClass(`msg ${msg_status}`);
  }

  //Display message of what the score is, or if the score is a new Highscore
  async scoreGame() {
    $("#form-score", this.board).hide();
    const resp = await axios.post("/final-score", { score: this.score });

    if (resp.data.newRecord) {
      this.showMessage(`New record!\t${this.score}`, "new-final");
    }
    else {
      this.showMessage(`Final score: ${this.score}`, "final");
    }
  }
}
