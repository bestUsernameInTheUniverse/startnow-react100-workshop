//need these to use react
import React from 'react';
import ReactDOM from 'react-dom';

//this can be a simple function if component only does a render()
function Square (props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) { //needed a constructor to have class variables(?)
    super(props);

    //class-scope variables need a "this."
    this.colNum = 4;
    this.rowNum = 4;
    this.sliceNum = 4;
  }

  renderSquare(x) { //builds the jsx for an individual square
    // console.log("position =  ", x)
    return (
      <Square
        key = {x} //need a key to keep track of this square later
        value={this.props.squares[x]}
        onClick={() => this.props.onClick(x)} 
      /> 
    );
  }

  squaresInRow(j, k) { //builds row out of squares
    var squares = [];
    var position = 0;

    for (let i = 0; i < this.colNum; i++) {
      console.log(i, j, k);
      position = i + (j * this.rowNum) + (k * this.colNum * this.rowNum) //3d index -> 1d index
      console.log("position =  ", position);
      squares.push(this.renderSquare(position));
    }
    return squares;
  }

  rowsInSlice(k) {  //builds slice out of rows
    var rows = [];
    var keyName = "";

    for (let j = 0; j < this.rowNum; j++) {
      console.log(j, k);
      keyName = j.toString() + k.toString();
      console.log(keyName);
      rows.push(
        <div className="slice-row" key={keyName}>
         {this.squaresInRow(j, k)}
        </div>
      )
    }
    return rows;
  }

  slicesInBoard() { //builds 3d board out of slices
    var slices = [];

    for (let k = 0; k < this.sliceNum; k++) {
      slices.push(
        <div className="board-slice" key={k}>
          {this.rowsInSlice(k)}
        </div>
      )
    }
    return slices;
  }


  render() {
    return (
      <div>
        {this.slicesInBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Move #' + move :
        'Game start';
      return (
        <li key={move}>
          <a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i) {
    const history = this.state.history; //grab full set of past states
    const current = history[history.length - 1]; //current state is last in history
    const squares = current.squares.slice(); //make a copy of squares

    if (calculateWinner(squares) || squares[i]) { //if game over or square previously clicked
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O'; //alternates x & o

    this.setState({ //updates state
      history: history.concat([{ //adds current state after click to history
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
}

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
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
