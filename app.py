from flask import  Flask, request, render_template, jsonify, session
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

app = Flask(__name__)

app.config['SECRET_KEY']="boggle-secret"
debug=DebugToolbarExtension(app)

boggle_game = Boggle()
@app.route("/")
def home_route():
    '''Generate and show game board'''

    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get('highscore', 0)
    play_count = session.get('play_count', 0)

    return render_template('game.html', board=board, highscore=highscore, play_count=play_count);


@app.route('/validate-word')
def validate_word():
    '''Validate word by checking if it is in the dictionary'''
    board = session["board"]
    word = request.args["word"]
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result': response})

@app.route('/final-score', methods=['POST'])
def final_score():
    '''Determine highscore and increment play counter in session'''
    score = request.json["score"]

    highscore = session.get("highscore", 0)
    session['highscore'] = max(highscore, score)
    
    play_count = session.get("play_count", 0)
    session['play_count'] = play_count + 1

    return jsonify(newRecord=score > highscore)