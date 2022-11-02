import { Injectable } from '@nestjs/common';
import { Cell } from './interfaces/cell.interface';


@Injectable()
export class BoardService {

    // CONVERTER
    rowFromCellIndex(num: number): number { return Math.ceil(num / 8) }
    colFromCellIndex(num: number): number { return (num - 1) % 8 + 1 }
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
    getStartingPieceColor(row: number, col: number, dark: string, light: string) {
        return (
            row === 1 || row === 2 ? dark :
                row === 7 || row === 8 ? light : 'none'
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
        return this.getStartingBoard(board)
    }
    getStartingBoard(board: Cell[]) {
        const DARK_CELL = '#B58763'
        const LIGHT_CELL = '#F0DAB5'
        const DARK_PIECE = '#1e1e1f'
        const LIGHT_PIECE = '#ffffff'

        let light = true

        board.forEach((cell, i) => {
            let index = i + 1
            let row = this.rowFromCellIndex(index)
            let col = this.colFromCellIndex(index)
            // cell identifier
            cell.index = index;
            cell.row = row
            cell.col = col
            cell.coordinate = this.rowColToCoord(row, col)
            // cell content
            cell.piece = this.getStartingPiece(row, col)
            cell.pieceColor = this.getStartingPieceColor(row, col, DARK_PIECE, LIGHT_PIECE)
            cell.cellColor = light ? LIGHT_CELL : DARK_CELL

            light = this.colFromCellIndex(index) === 8 ? light : !light
        })
        return board
    }
}