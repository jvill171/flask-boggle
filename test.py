from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):
    def setUp(self):
            """Set up into testing mode before each test"""
            self.client = app.test_client()
            app.config['TESTING'] = True

    def test_home(self):
        with self.client:
            '''Test if session's home page has loaded specific modules/elements properly'''
            response = self.client.get('/')
            
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<td><h3>Highscore:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'<tr class="timer">', response.data)

    def test_valid_word(self):
        '''Test a valid word by using a custom board in the session'''
        with self.client.session_transaction() as t_session:
            t_session['board'] =[['S','I','X','T','Y'],
                                ['S','I','X','T','Y'],
                                ['S','I','X','T','Y'],
                                ['S','I','X','T','Y'],
                                ['S','I','X','T','Y']]
        res_1 = self.client.get('/validate-word?word=sixty')
        self.assertEqual(res_1.json['result'], 'ok')
        # test word of different length
        res_2 = self.client.get('/validate-word?word=six')
        self.assertEqual(res_2.json['result'], 'ok')

    def test_invalid_word(self):
        '''Test a valid word that does not exist on the board'''
        self.client.get('/')
        res = self.client.get('/validate-word?word=zero')
        self.assertEqual(res.json['result'], 'not-on-board')

    def test_not_word(self):
        '''Test a non-existent, made up word'''
        self.client.get('/')
        res = self.client.get('/validate-word?word=xty')
        self.assertEqual(res.json['result'], 'not-word')
