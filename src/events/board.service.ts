import { Injectable } from '@nestjs/common';
import { Cell } from './interfaces/cell.interface';


@Injectable()
export class BoardService {
    // NOTES: constraints 
    // 1 <= row <= 8
    // 1 <= col <= 8
    // 0 <= index <= 63
    // '1a' <= coord <= '8h'


    // CONVERTER
    rowFromCellIndex(index: number): number { return Math.ceil((index + 1) / 8) }
    colFromCellIndex(index: number): number { return (index % 8) + 1 }
    rowColToCoord(row: number, col: number): string {
        let row_coord = 9 - row
        let col_coord = String.fromCharCode(96 + col)
        return row_coord.toString() + col_coord.toString();
    }
    rowColToIndex(row: number, col: number) { return (row - 1) * 8 + (col - 1) }


    // CELL INIT
    getStartingPiece(row: number, col: number) {
        return (
            row === 2 || row === 7 ? 'pawn' :
                row === 1 || row === 8 ?
                    col === 1 || col === 8 ? 'rook' :
                        col === 2 || col === 7 ? 'knight' :
                            col === 3 || col === 6 ? 'bishop' :
                                col === 4 ? 'queen' : 'king' : 'none'
        )
    }
    getStartingPieceColor(row: number, col: number) {
        return (
            row === 1 || row === 2 ? 'black' :
                row === 7 || row === 8 ? 'white' : 'none'
        )
    }


    // BOARD INIT
    getEmptyCell(): Cell {
        return {
            index: null,
            row: null,
            col: null,
            coordinate: null,
            piece: null,
            pieceColor: null,
            cellColor: null,
        }
    }
    getEmptyBoard(): Cell[] {
        let cell: Cell = this.getEmptyCell()
        let board = new Array(64)
        for (let i = 0; i < 64; i++) { board[i] = { ...cell } }
        return board
    }
    getStartingBoard() {
        let board = this.getEmptyBoard()

        let light = true

        board.forEach((cell, i) => {
            let index = i
            let row = this.rowFromCellIndex(index)
            let col = this.colFromCellIndex(index)
            // cell identifier
            cell.index = index;
            cell.row = row
            cell.col = col
            cell.coordinate = this.rowColToCoord(row, col)
            // cell content
            cell.piece = this.getStartingPiece(row, col)
            cell.pieceColor = this.getStartingPieceColor(row, col)
            cell.cellColor = light ? 'white' : 'black'

            light = this.colFromCellIndex(index) === 8 ? light : !light
        })
        return board
    }


    // VERIFY MOVES
    getPossibleMoves(board: Cell[], index: number): { row: number, col: number }[] {
        let cell = board[index]
        let piece = cell.piece
        let color = cell.pieceColor
        let row = cell.row
        let col = cell.col

        // TODO
        // pieces can't move to allied cells
        // Enable castling
        // Enable en passant
        // Pawns move one direction
        // Pawn promotion

        let moves = []
        if (piece === 'rook') {
            for (let r = row - 1; r >= 1; r--) { // up
                let above = board[this.rowColToIndex(r, col)]
                // non-empty cell below
                if (above.piece !== 'none') {
                    // can only capture piece with opposite color
                    if (above.pieceColor !== color) { moves.push({ row: r, col: col }) }
                    break;
                }
                moves.push({ row: r, col: col });
            }
            for (let r = row + 1; r <= 8; r++) { // down
                let below = board[this.rowColToIndex(r, col)]
                // non-empty cell below
                if (below.piece !== 'none') {
                    // can only capture piece with opposite color
                    if (below.pieceColor !== color) { moves.push({ row: r, col: col }) }
                    break;
                }
                moves.push({ row: r, col: col });
            }
            for (let c = col - 1; c >= 1; c--) { // left
                let left = board[this.rowColToIndex(row, c)]
                // non-empty cell below
                if (left.piece !== 'none') {
                    // can only capture piece with opposite color
                    if (left.pieceColor !== color) { moves.push({ row: row, col: c }) }
                    break;
                }
                moves.push({ row: row, col: c });
            }
            for (let c = col + 1; c <= 8; c++) { // right 
                let right = board[this.rowColToIndex(row, c)]
                // non-empty cell below
                if (right.piece !== 'none') {
                    // can only capture piece with opposite color
                    if (right.pieceColor !== color) { moves.push({ row: row, col: c }) }
                    break;
                }
                moves.push({ row: row, col: c });
            }
        }
        if (piece === 'bishop') {
            for (let r = -1; r <= 1; r = r + 2) { // row offset 
                for (let c = -1; c <= 1; c = c + 2) { // col offset
                    for (let m = 1; m <= 7; m++) { // offset magnitude
                        let t_row = row + r * m // target row
                        let t_col = col + c * m // target col
                        if (t_row > 8 || t_row < 1 || t_col > 8 || t_col < 1) break; 
                        let target_cell = board[this.rowColToIndex(t_row, t_col)]
                        if (target_cell.piece !== 'none') {
                            if (target_cell.pieceColor !== color) {
                                moves.push({ row: t_row, col: t_col })
                            }
                            break;
                        }
                        moves.push({ row: t_row, col: t_col })
                    }
                }
            }
        }
        if (piece === 'knight') {
            for (let one = -1; one <= 1; one = one + 2) {
                for (let two = -2; two <= 2; two = two + 4) {
                    let x = { row: row + one, col: col + two } // horizontal move 
                    let y = { row: row + two, col: col + one } // vertical move
                    if (!this.outOfBound(x.row, x.col)) {
                        let target_cell_x = board[this.rowColToIndex(x.row, x.col)]
                        if (target_cell_x.pieceColor !== color) {moves.push(x)}
                    }
                    if (!this.outOfBound(y.row, y.col)) {
                        let target_cell_y = board[this.rowColToIndex(y.row, y.col)]
                        if (target_cell_y.pieceColor !== color) {moves.push(y)}
                    }
                }
            }
        }
        if (piece === 'pawn') {
            let direction = color === 'white' ? (-1) : (1)
            moves.push({ row: row + direction * 1, col: col })
            moves.push({ row: row + direction * 2, col: col })
        }
        if (piece === 'king') {
            moves.push({ row: row - 1, col: col })
            moves.push({ row: row + 1, col: col })
            moves.push({ row: row - 1, col: col - 1 })
            moves.push({ row: row + 1, col: col - 1 })
            moves.push({ row: row - 1, col: col + 1 })
            moves.push({ row: row + 1, col: col + 1 })
            moves.push({ row: row, col: col - 1 })
            moves.push({ row: row, col: col + 1 })
        }
        if (piece === 'queen') {
            for (let r = 1; r < row; r++) { moves.push({ row: r, col: col }); }
            for (let r = row + 1; r <= 8; r++) { moves.push({ row: r, col: col }); }
            for (let c = 1; c < col; c++) { moves.push({ row: row, col: c }); }
            for (let c = col + 1; c <= 8; c++) { moves.push({ row: row, col: c }); }
            for (let i = 1; i <= 7; i++) {
                moves.push({ row: row - i, col: col - i })
                moves.push({ row: row - i, col: col + i })
                moves.push({ row: row + i, col: col - i })
                moves.push({ row: row + i, col: col + i })
            }
        }
        return moves.filter(move => {
            return (
                move.row <= 8 && move.row >= 0 &&
                move.col <= 8 && move.col >= 0
            )
        });
    }
}