import React, { useEffect, useState } from 'react'
import { randomGenerator } from './utills';
import './BoardStyle.css';
import useInterval from './useIntervalHook';
class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor(value) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }
}

// class Cell {
//     constructor(row, col, value) {
//         this.row = row;
//         this.col = col;
//         this.value = value;
//     }
// }



const BOARD_SIZE = 14;



const getStartingSnakeLLValue = (board) => {
    const rowSize = board.length;
    const colSize = board[0].length;
    const startingRow = Math.round(rowSize / 3);
    const startingCol = Math.round(colSize / 3);
    const startingCell = board[startingRow][startingCol];
    return {
        row: startingRow,
        col: startingCol,
        cell: startingCell,
    };

};

const Direction = {
    UP: 'UP',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
}


const Board = () => {
    const [board, setBoard] = useState(createBoard(BOARD_SIZE))
    const [snake, setSnake] = useState(new LinkedList(getStartingSnakeLLValue(board)));
    const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
    const [snakeCells, setSnakeCells] = useState(new Set([snake.head.value.cell]));

    const [direction, setDirection] = useState(Direction.RIGHT);
    //const snakeCellsRef = useRef();
    //snakeCellsRef.current = new Set([44]);
    const [score, setScore] = useState(0);
    const [start, setStart] = useState(false);

    useEffect(() => {
        // setInterval(() => {
        //     moveSnake();
        // }, 100);

        window.addEventListener('keydown', e => {
            const newDirection = getDirectionFromKey(e.key);
            const isValidDirection = newDirection !== '';
            if (isValidDirection) setDirection(newDirection);
        })
    }, []);



    useInterval(() => {
        if (start) moveSnake();
    }, 180);

    function moveSnake() {
        const currentHeadCoord = {
            row: snake.head.value.row,
            col: snake.head.value.col,
        };

        const nextHeadCoords = getNextHeadCoords(currentHeadCoord, direction);

        if (isOutofBounds(nextHeadCoords, board)) handleGameOver();

        const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];

        if (snakeCells.has(nextHeadCell)) {
            handleGameOver();
            return;
        }




        const newHead = new LinkedListNode({
            row: nextHeadCoords.row,
            col: nextHeadCoords.col,
            cell: nextHeadCell,
        });

        const currentHead = snake.head;
        snake.head = newHead;
        currentHead.next = newHead;

        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next;
        if (snake.tail === null) snake.tail = snake.head;

        const foodConsumed = nextHeadCell === foodCell;
        if (foodConsumed) {
            growSnake(newSnakeCells);
            handleFoodConsumption();
        }
        setSnakeCells(newSnakeCells);

        //setSnakeCells(newSnakeCells);
    }

    const growSnake = (newSnakeCells) => {
        //const tailNextNodeDirection = getNextNodeDirection(snake.tail);
        const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
        if (isOutofBounds(growthNodeCoords, board)) {
            return;
        }

        const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
        const newTail = new LinkedListNode({
            row: growthNodeCoords.row,
            col: growthNodeCoords.col,
            cell: newTailCell,
        });
        const currentTail = snake.tail;
        snake.tail = newTail;
        snake.tail.next = currentTail;

        newSnakeCells.add(newTailCell);

    };

    const getDirectionFromKey = key => {
        if (key === 'ArrowUp') return Direction.UP;
        if (key === 'ArrowRight') return Direction.RIGHT;
        if (key === 'ArrowDown') return Direction.DOWN;
        if (key === 'ArrowLeft') return Direction.LEFT;

        return '';
    }

    const getNextNodeDirection = (node, currentDirection) => {
        if (node.next === null) return currentDirection;
        const { row: currentRow, col: currentCol } = node.value;
        const { row: nextRow, col: nextCol } = node.next.value;

        if (nextRow === currentRow && nextCol === currentCol + 1) {
            return Direction.RIGHT;
        }

        if (nextRow === currentRow && nextCol === currentCol - 1) {
            return Direction.LEFT;
        }

        if (nextCol === currentCol && nextRow === currentRow + 1) {
            return Direction.DOWN;
        }
        if (nextCol === currentCol && nextRow === currentRow - 1) {
            return Direction.UP;
        }

        return '';

    };

    const getOppositeDirection = direction => {
        if (direction === Direction.DOWN) return Direction.UP;
        if (direction === Direction.LEFT) return Direction.RIGHT;
        if (direction === Direction.UP) return Direction.DOWN;
        if (direction === Direction.RIGHT) return Direction.LEFT;
    };

    const getNextHeadCoords = (currentHeadCoord, direction) => {
        if (direction === Direction.UP) {
            return {
                row: currentHeadCoord.row - 1,
                col: currentHeadCoord.col,
            };
        }
        if (direction === Direction.RIGHT) {
            return {
                row: currentHeadCoord.row,
                col: currentHeadCoord.col + 1,
            };
        }
        if (direction === Direction.DOWN) {
            return {
                row: currentHeadCoord.row + 1,
                col: currentHeadCoord.col,
            };
        }
        if (direction === Direction.LEFT) {
            return {
                row: currentHeadCoord.row,
                col: currentHeadCoord.col - 1,
            };
        };
    };

    const handleFoodConsumption = () => {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell;
        while (true) {
            nextFoodCell = randomGenerator(1, maxPossibleCellValue);
            if (snakeCells.has(nextFoodCell) || foodCell === nextFoodCell) continue;
            break;
        }
        setFoodCell(nextFoodCell);
        setScore(score + 1);
    }

    const handleGameOver = () => {
        setScore(0);
        const snakeLLStartingValue = getStartingSnakeLLValue(board);
        setSnake(new LinkedList(snakeLLStartingValue));
        setFoodCell(snakeLLStartingValue.cell + 5);
        setSnakeCells(new Set([snakeLLStartingValue.cell]));
        setDirection(Direction.RIGHT);
        setBoard(createBoard(BOARD_SIZE))
    }

    const getGrowthNodeCoords = (snakeTail, currentDirection) => {
        const tailNextNodeDirection = getNextNodeDirection(snakeTail,
            currentDirection);


        const growthDirection = getOppositeDirection(tailNextNodeDirection);
        const currentTailCoords = {
            row: snakeTail.value.row,
            col: snakeTail.value.col,
        }

        const growthNodeCoords = getCoordsInDirection(
            currentTailCoords,
            growthDirection,
        );

        return growthNodeCoords;
    }

    const getCoordsInDirection = (coords, direction) => {
        if (direction === Direction.UP) {
            return {
                row: coords.row - 1,
                col: coords.col,
            };
        }
        if (direction === Direction.RIGHT) {
            return {
                row: coords.row,
                col: coords.col + 1,
            };
        }
        if (direction === Direction.DOWN) {
            return {
                row: coords.row + 1,
                col: coords.col,
            };
        }
        if (direction === Direction.LEFT) {
            return {
                row: coords.row,
                col: coords.col - 1,
            };
        }
    };

    const startSnake = () => {
        if (start) {
            setStart(false);
        } else {
            setStart(true);
        }
    }



    return (
        <> <h1>Score {score}</h1>
            <button onClick={() => startSnake()}> Start Game </button>
            <button onClick={() => handleGameOver()}> Exit Game </button>
            <div className='board'>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className='row'>
                        {row.map((cell, cellIdx) => (
                            <div
                                key={cellIdx}
                                className={`cell ${snakeCells.has(cell) ? 'snake-cell' : ''}
                                ${foodCell === cell ? 'food-cell' : ''} `}
                            > </div>
                        ))
                        }</div>
                ))}
            </div>
        </>

    );
};


const createBoard = BOARD_SIZE => {
    let counter = 1;
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        const currentRow = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            currentRow.push(counter++);
        }
        board.push(currentRow);
    }
    return board;
};

const isOutofBounds = (coords, board) => {
    const { row, col } = coords;

    if (row < 0 || col < 0) return true;
    if (row >= BOARD_SIZE || col >= BOARD_SIZE) return true;
    return false;
}




export default Board;