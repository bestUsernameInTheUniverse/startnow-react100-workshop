//need these to use react
import React from 'react';
import ReactDOM from 'react-dom';


//this can be a simple function if component only does a render()
function Square (props) {
  return (
    <button className={props.winning.indexOf(props.keyCopy) >= 0 ? 'square-highlight' : 'square'} onClick={props.onClick}>
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

  renderSquare(i, j, k) { //builds the jsx for an individual square
    var keyName = `${i}${j}${k}`;
    return (
      <Square
        key = {keyName} //need a key to keep track of this square later
        keyCopy={keyName}
        winning={this.props.winning}
        value={this.props.squares[i][j][k]}
        onClick={() => this.props.onClick(i,j,k)}
      /> 
    );
  }

  squaresInRow(j, k) { //builds row out of squares
    var squares = [];

    for (let i = 0; i < this.colNum; i++) {
      squares.push(this.renderSquare(i, j, k));
    }
    return squares;
  }

  rowsInSlice(k) {  //builds slice out of rows
    var rows = [];
    var keyName = "";

    for (let j = 0; j < this.rowNum; j++) {
      keyName = j.toString() + k.toString();
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


//main game class
class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [{
        squares: Array(4).fill(Array(4).fill(Array(4).fill(null))) //squares[0][0][0]
      }],
      stepNumber: 0,
      winning: [],
      xIsNext: true,
      gameOver: false
    };
  }

  uhWinning(squares) {
    const winner = calculateWinner(squares);
    
    if(winner) {
      const winningArray = [];
      winningArray.push(`${winner.point0.x}${winner.point0.y}${winner.point0.z}`);
      winningArray.push(`${winner.point1.x}${winner.point1.y}${winner.point1.z}`);
      winningArray.push(`${winner.point2.x}${winner.point2.y}${winner.point2.z}`);
      winningArray.push(`${winner.point3.x}${winner.point3.y}${winner.point3.z}`);
      
      this.setState({
        winning: winningArray,
        gameOver: true
      })
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleClick(i, j, k) {
    //do nothing if game over or square previously clicked
    if (this.state.gameOver) return;

    const history = this.state.history; //grab full set of past states
    const current = history[history.length - 1]; //current state is last in history
    const squares = JSON.parse(JSON.stringify(current.squares.slice())); //make a clone of squares

    if (squares[i][j][k]) return;
    
    squares[i][j][k] = this.state.xIsNext ? 'X' : 'O'; //alternates x & o
    this.uhWinning(squares);

    this.setState({ //updates state
      history: history.concat([{ //adds current state after click to history
        squares: squares,
      }]),
      // winning: winningArray,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const squares = current.squares;
    const winner = calculateWinner(squares);

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
      status = 'Winner: ' + winner.winningPlayer;
      const w = winner.winningPlayer == 'X' ? <em>X</em> : <em>O</em>;
      squares[winner.point0.x][winner.point0.y][winner.point0.z] = w;
      squares[winner.point1.x][winner.point1.y][winner.point1.z] = w;
      squares[winner.point2.x][winner.point2.y][winner.point2.z] = w;
      squares[winner.point3.x][winner.point3.y][winner.point3.z] = w;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={squares}
            winning={this.state.winning}
            onClick={(i, j, k) => this.handleClick(i, j, k)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}


//checks for an end-game condition
function calculateWinner(squares) {
  var winner;

  winner = checkHorizontal(squares);
  if (winner) { return winner; }

  winner = checkVertical(squares);
  if (winner) { return winner; }

  winner = checkDepth(squares);
  if (winner) { return winner; }

  winner = checkDiagonal1(squares);
  if (winner) { return winner; }

  winner = checkDiagonal2(squares);
  if (winner) { return winner; }

  winner = checkDiagonal3(squares);
  if (winner) { return winner; }

  winner = checkDiagonal4(squares);
  if (winner) { return winner; }

  return null;
}


//checks for winning line  =========================
function checkHorizontal(squares) {
  var winningLine;
  for (let z = 0; z < 4; z++) {
    for (let y = 0; y < 4; y++) {
      if (squares[0][y][z] &&
        squares[0][y][z] == squares[1][y][z] &&
        squares[0][y][z] == squares[2][y][z] &&
        squares[0][y][z] == squares[3][y][z]) 
        { 
          winningLine = {
            winningPlayer: squares[0][y][z],
            point0: {x: 0, y: y, z: z},
            point1: {x: 1, y: y, z: z},
            point2: {x: 2, y: y, z: z},
            point3: {x: 3, y: y, z: z},
          }
        }
    }
  }
  return winningLine;
}

function checkVertical(squares) {
  var winningLine;
  for (let z = 0; z < 4; z++) {
    for (let x = 0; x < 4; x++) {
      if (squares[x][0][z] &&
        squares[x][0][z] == squares[x][1][z] &&
        squares[x][0][z] == squares[x][2][z] &&
        squares[x][0][z] == squares[x][3][z]) 
        { 
          winningLine = {
            winningPlayer: squares[x][0][z],
            point0: {x: x, y: 0, z: z},
            point1: {x: x, y: 1, z: z},
            point2: {x: x, y: 2, z: z},
            point3: {x: x, y: 3, z: z}
          }
        }
    }
  }
  return winningLine;
}

function checkDepth(squares) {
  var winningLine;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (squares[x][y][0] &&
        squares[x][y][0] == squares[x][y][1] &&
        squares[x][y][0] == squares[x][y][2] &&
        squares[x][y][0] == squares[x][y][3]) 
        { 
          winningLine = {
            winningPlayer: squares[x][y][0],
            point0: {x: x, y: y, z: 0},
            point1: {x: x, y: y, z: 1},
            point2: {x: x, y: y, z: 2},
            point3: {x: x, y: y, z: 3}
          }
        }
    }
  }
  return winningLine;
}

function checkDiagonal1(squares) {
  var winningLine;
  for (let z = 0; z < 4; z++) {
    if (squares[0][0][z] &&
      squares[0][0][z] == squares[1][1][z] &&
      squares[0][0][z] == squares[2][2][z] &&
      squares[0][0][z] == squares[3][3][z]) 
      { 
        winningLine = {
          winningPlayer: squares[0][0][z],
          point0: {x: 0, y: 0, z: z},
          point1: {x: 1, y: 1, z: z},
          point2: {x: 2, y: 2, z: z},
          point3: {x: 3, y: 3, z: z}
        }
      }

    if (squares[0][3][z] &&
      squares[0][3][z] == squares[1][2][z] &&
      squares[0][3][z] == squares[1][2][z] &&
      squares[0][3][z] == squares[3][0][z]) 
      { 
        winningLine = {
          winningPlayer: squares[0][3][z],
          point0: {x: 0, y: 3, z: z},
          point1: {x: 1, y: 2, z: z},
          point2: {x: 2, y: 1, z: z},
          point3: {x: 3, y: 0, z: z}
        }
      }
  }
  return winningLine;
}

function checkDiagonal2(squares) {
  var winningLine;
  for (let y = 0; y < 4; y++) {
    if (squares[0][y][0] &&
      squares[0][y][0] == squares[1][y][1] &&
      squares[0][y][0] == squares[2][y][2] &&
      squares[0][y][0] == squares[3][y][3]) 
      { 
        winningLine = {
          winningPlayer: squares[0][y][0],
          point0: {x: 0, y: y, z: 0},
          point1: {x: 1, y: y, z: 1},
          point2: {x: 2, y: y, z: 2},
          point3: {x: 3, y: y, z: 3}
        }
      }

    if (squares[0][y][3] &&
      squares[0][y][3] == squares[1][y][2] &&
      squares[0][y][3] == squares[2][y][1] &&
      squares[0][y][3] == squares[3][y][0]) 
      { 
        winningLine = {
          winningPlayer: squares[0][y][3],
          point0: {x: 0, y: y, z: 3},
          point1: {x: 1, y: y, z: 2},
          point2: {x: 2, y: y, z: 1},
          point3: {x: 3, y: y, z: 0}
        }
      }
  }
  return winningLine;
}

function checkDiagonal3(squares) {
  var winningLine;
  for (let x = 0; x < 4; x++) {
    if (squares[x][0][0] &&
      squares[x][0][0] == squares[x][1][1] &&
      squares[x][0][0] == squares[x][2][2] &&
      squares[x][0][0] == squares[x][3][3]) 
      { 
        winningLine = {
          winningPlayer: squares[x][0][0],
          point0: {x: x, y: 0, z: 0},
          point1: {x: x, y: 1, z: 1},
          point2: {x: x, y: 2, z: 2},
          point3: {x: x, y: 3, z: 3}
        }
      }

    if (squares[x][0][3] &&
      squares[x][0][3] == squares[x][1][2] &&
      squares[x][0][3] == squares[x][2][1] &&
      squares[x][0][3] == squares[x][3][0]) 
      { 
        winningLine = {
          winningPlayer: squares[x][0][3],
          point0: {x: x, y: 0, z: 3},
          point1: {x: x, y: 1, z: 2},
          point2: {x: x, y: 2, z: 1},
          point3: {x: x, y: 3, z: 0}
        }
      }
  }
  return winningLine;
}

function checkDiagonal4(squares) {
  var winningLine;
  if (squares[0][0][0] &&
    squares[0][0][0] == squares[1][1][1] &&
    squares[0][0][0] == squares[2][2][2] &&
    squares[0][0][0] == squares[3][3][3]) 
    { 
      winningLine = {
        winningPlayer: squares[0][0][0],
        point0: {x: 0, y: 0, z: 0},
        point1: {x: 1, y: 1, z: 1},
        point2: {x: 2, y: 2, z: 2},
        point3: {x: 3, y: 3, z: 3}
      }
    }

  if (squares[0][0][3] &&
    squares[0][0][3] == squares[1][1][2] &&
    squares[0][0][3] == squares[2][2][1] &&
    squares[0][0][3] == squares[3][3][0]) 
    { 
      winningLine = {
        winningPlayer: squares[0][0][3],
        point0: {x: 0, y: 0, z: 3},
        point1: {x: 1, y: 1, z: 2},
        point2: {x: 2, y: 2, z: 1},
        point3: {x: 3, y: 3, z: 0}
      }
    }

    if (squares[3][0][0] &&
      squares[3][0][0] == squares[2][1][1] &&
      squares[3][0][0] == squares[1][2][2] &&
      squares[3][0][0] == squares[0][3][3]) 
      { 
        winningLine = {
          winningPlayer: squares[3][0][0],
          point0: {x: 3, y: 0, z: 0},
          point1: {x: 2, y: 1, z: 1},
          point2: {x: 1, y: 2, z: 2},
          point3: {x: 0, y: 3, z: 3}
        }
      }
  
    if (squares[3][0][3] &&
      squares[3][0][3] == squares[2][1][2] &&
      squares[3][0][3] == squares[1][2][1] &&
      squares[3][0][3] == squares[0][3][0]) 
      { 
        winningLine = {
          winningPlayer: squares[3][0][3],
          point0: {x: 3, y: 0, z: 3},
          point1: {x: 2, y: 1, z: 2},
          point2: {x: 1, y: 2, z: 1},
          point3: {x: 0, y: 3, z: 0}
        }
      }
  return winningLine;
}


//entry point for react
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
