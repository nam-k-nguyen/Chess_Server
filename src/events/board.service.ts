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
            for (let r = 1; r < row; r++) { moves.push({ row: r, col: col }); }
            for (let r = row + 1; r <= 8; r++) { moves.push({ row: r, col: col }); }
            for (let c = 1; c < col; c++) { moves.push({ row: row, col: c }); }
            for (let c = col + 1; c <= 8; c++) { moves.push({ row: row, col: c }); }
        }
        if (piece === 'bishop') {
            for (let i = 1; i <= 7; i++) {
                moves.push({ row: row - i, col: col - i })
                moves.push({ row: row - i, col: col + i })
                moves.push({ row: row + i, col: col - i })
                moves.push({ row: row + i, col: col + i })
            }
        }
        if (piece === 'knight') {
            moves.push({ row: row + 1, col: col + 2 })
            moves.push({ row: row + 1, col: col - 2 })
            moves.push({ row: row - 1, col: col + 2 })
            moves.push({ row: row - 1, col: col - 2 })
            moves.push({ row: row + 2, col: col + 1 })
            moves.push({ row: row + 2, col: col - 1 })
            moves.push({ row: row - 2, col: col + 1 })
            moves.push({ row: row - 2, col: col - 1 })
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