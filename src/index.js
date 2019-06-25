import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.winning ? 'square winning-square' : 'square'} onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    /* 
      simple boolean can be used to determine if we have winningsquares
      So that we can pass it down to square as a prop (not sure if best practice)
    */
    let winning = this.props.winningSquares && this.props.winningSquares.includes(i) ? true : false; 

    return (
      <Square
        key={i}
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
        winning={winning}
      />
    );
  }

  renderBoard(size) {
    let index = 0;
    let rows = [];
    let cols = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        cols.push(this.renderSquare(index));
        index++;
      }
      rows.push(<div key={i} className="board-row">{cols}</div>);
      cols = [];
    }

    return rows;
  }

  render() {
    let board = this.renderBoard(3);
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history : [{
        squares: Array(9).fill(null),
        location: null,
      }],
      stepNumber: 0,
      xIsNext: true,
    };
    this.handleClick = this.handleClick.bind(this);
    this.jumpTo = this.jumpTo.bind(this);
    this.toggleAscending = this.toggleAscending.bind(this);
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: getPosition(i),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      isAscending: true,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleAscending() {
    this.setState({
      isAscending: !this.state.isAscending,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const desc = move ?
      `Go to move # ${move}, Location: ${history[move].location}` : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b>{desc}</b> :desc}
          </button>
        </li>
      );
    })

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winner;
    } else if (!current.squares.includes(null)) {
      status = 'Draw!'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          {/* board now has winningSquare prop */}
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winner ? winner.line : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{this.state.isAscending ? moves: moves.reverse()}</ol>
          <div>
            Sort by:
            <button onClick={this.toggleAscending}>
              {this.state.isAscending ? 'Descending' : 'Ascending'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function getPosition(index) {
  //3 = number of columns
  let row = Math.floor(index / 3) + 1;
  let col = (index % 3) + 1;
  return `${row}, ${col}`;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return ({
        winner: squares[a],
        line: lines[i]
      });
    }
  }

  return null;
}
