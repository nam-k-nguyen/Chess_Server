import { Injectable } from '@nestjs/common';
import { Cell } from './interfaces/cell.interface';
import { Piece } from './interfaces/piece.interface';

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
        return col_coord.toString() + row_coord.toString();
    }
    rowFromCoord(coord: string = 'a4'): number {
        return 9 - parseInt(coord[1])
    }
    colFromCoord(coord: string = 'a4'): number {
        return coord.charCodeAt(0) - 96
    }
    rowColToIndex(row: number, col: number) { return (row - 1) * 8 + (col - 1) }
    pieceToNotation(piece: string): string {
        if (piece === 'knight') { return 'N' }
        return piece[0]
    }
    rankFromRow(row: number, color: string) {
        return color === 'black' ? row : 9 - row
    }


    // LOGIC
    outOfBound(row: number, col: number) {
        return row > 8 || row < 1 || col > 8 || col < 1
    }
    getMoveNotation(board: Cell[], src: number, dest: number) {
        let src_cell: Cell = board[src]
        let dest_cell: Cell = board[dest]
        let src_coord = this.rowColToCoord(src_cell.row, src_cell.col)
        let dest_coord = this.rowColToCoord(dest_cell.row, dest_cell.col)
        let move_piece = this.pieceToNotation(src_cell.piece)
        let move_notation = move_piece + src_coord + dest_coord
        console.log(move_notation)
        return move_notation
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
            // castle
            if (cell.piece === 'rook' || cell.piece === 'king') {
                cell.castleable = true
            }

            light = this.colFromCellIndex(index) === 8 ? light : !light
        })
        return board
    }



    // BOARD UPDATE 
    updateBoard(board: Cell[], src: any, dest: any, promotion: Piece) {
        src = parseInt(src)
        dest = parseInt(dest)
        // Cell reference
        const src_cell = board[src]
        const dest_cell = board[dest]
        // Save source piece and color since we will change it later
        const src_piece = src_cell.piece
        const src_color = src_cell.pieceColor
        // Determine if it's an en passant move or not
        const isPawn = src_piece === 'pawn'
        const isDiagonal = src_cell.col !== dest_cell.col
        const isEmptyDest = dest_cell.piece === 'none'
        const isEnPassant: boolean = isPawn && isDiagonal && isEmptyDest
        const isPromotionRow: boolean = dest_cell.row === 1 || dest_cell.row === 8

        // If a piece moves, mark it as uncastleable
        if (board[src].castleable) { board[src].castleable = false }
        if (board[dest].castleable) { board[dest].castleable = false }

        // Move a piece from source to destination
        board[dest].piece = src_piece
        board[dest].pieceColor = src_color
        board[src].piece = 'none'
        board[src].pieceColor = 'none'

        if (isPawn && isPromotionRow && promotion) {
            board[dest].piece = promotion
        }

        // If it's a castle move, also move the rook
        if (src_piece === 'king' && Math.abs(src - dest) === 2) {
            // rook distance = 4 if long castle, rook distanace = 3 if short castle
            let rook_distance = dest < src ? 4 : 3
            // direction = -1 if long castle, direction = 1 if short castle
            let direction = (dest - src) / 2

            board[src + direction].piece = board[src + direction * rook_distance].piece
            board[src + direction].pieceColor = board[src + direction * rook_distance].pieceColor
            board[src + direction * rook_distance].piece = 'none'
            board[src + direction * rook_distance].pieceColor = 'none'
        }

        // If it's a en passant move, also remove the adjacent piece
        if (isEnPassant) {

            const direction = src_color === 'black' ? 1 : -1
            const capturedIndex = dest - direction * 8

            board[capturedIndex].piece = 'none'
            board[capturedIndex].pieceColor = 'none'
        }
        return board
    }


    // VERIFY MOVES
    getPossibleMoves(board: Cell[], index: number, last_move: string): { row: number, col: number, promotion?: string }[] {
        const cell = board[index]
        const piece = cell.piece

        // TODO
        // pieces can't move to allied cells - done
        // Enable castling - done
        // Enable en passant - done
        // Pawns move one direction - done
        // Pawn promotion 
        // Fix row col to coord funcion (right now row and col are swapped) - done

        switch (piece) {
            case 'rook':
                return this.getRookMoves(board, index);
            case 'bishop':
                return this.getBishopMoves(board, index);
            case 'knight':
                return this.getKnightMoves(board, index);
            case 'king':
                return this.getKingMoves(board, index);
            case 'queen':
                return this.getQueenMoves(board, index);
            case 'pawn':
                return this.getPawnMoves(board, index, last_move);
        }
    }

    getRookMoves(board: Cell[], index: number): { row: number, col: number }[] {
        const cell = board[index]
        const color = cell.pieceColor
        const row = cell.row
        const col = cell.col
        const moves = []

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

        return moves
    }
    getBishopMoves(board: Cell[], index: number): { row: number, col: number }[] {
        const cell = board[index]
        const color = cell.pieceColor
        const row = cell.row
        const col = cell.col
        const moves = []

        for (let r = -1; r <= 1; r = r + 2) { // row offset 
            for (let c = -1; c <= 1; c = c + 2) { // col offset
                magnitude: for (let m = 1; m <= 7; m++) { // offset magnitude
                    let t_row = row + r * m // target row
                    let t_col = col + c * m // target col
                    if (t_row > 8 || t_row < 1 || t_col > 8 || t_col < 1) { break magnitude; }
                    let target_cell = board[this.rowColToIndex(t_row, t_col)]
                    if (target_cell.piece !== 'none') {
                        if (target_cell.pieceColor !== color) {
                            moves.push({ row: t_row, col: t_col })
                        }
                        break magnitude;
                    }
                    moves.push({ row: t_row, col: t_col })
                }
            }
        }

        return moves
    }
    getKnightMoves(board: Cell[], index: number): { row: number, col: number }[] {
        const cell = board[index]
        const color = cell.pieceColor
        const row = cell.row
        const col = cell.col
        const moves = []

        for (let one = -1; one <= 1; one = one + 2) {
            for (let two = -2; two <= 2; two = two + 4) {
                let x = { row: row + one, col: col + two } // horizontal move 
                let y = { row: row + two, col: col + one } // vertical move
                if (!this.outOfBound(x.row, x.col)) {
                    let target_cell_x = board[this.rowColToIndex(x.row, x.col)]
                    if (target_cell_x.pieceColor !== color) { moves.push(x) }
                }
                if (!this.outOfBound(y.row, y.col)) {
                    let target_cell_y = board[this.rowColToIndex(y.row, y.col)]
                    if (target_cell_y.pieceColor !== color) { moves.push(y) }
                }
            }
        }

        return moves
    }
    getPawnMoves(board: Cell[], index: number, last_move: string): { row: number, col: number }[] {
        const cell = board[index]
        const color = cell.pieceColor
        const row = cell.row
        const col = cell.col
        const moves = []

        const direction = color === 'black' ? 1 : -1
        const rank = color === 'black' ? row : 9 - row

        for (let c = -1; c <= 1; c++) {
            // Check if the potential move is within board
            let move = { row: row + direction * 1, col: col + c }
            if (this.outOfBound(move.row, move.col)) { continue; }
            let move_cell = board[this.rowColToIndex(move.row, move.col)]

            // Forward moves 
            if (c === 0) {
                if (move_cell.pieceColor === 'none') {
                    // 1 square forward
                    // if it's a promtion move, each promotion is pushed in as a different move
                    if (move.row === 8 || move.row === 1) {
                        let possible_promotion: Piece[] = ['queen', 'rook', 'knight', 'bishop']
                        for (let i = 0; i < possible_promotion.length; i++) {
                            moves.push({...move, promotion: possible_promotion[i]})
                        }
                    }
                    else {
                        moves.push(move)
                    }
                    // 2 squares forward
                    if (rank === 2) {
                        let jump = { row: row + direction * 2, col: col + c }
                        let jump_cell = board[this.rowColToIndex(jump.row, jump.col)]
                        if (jump_cell.pieceColor === 'none') { moves.push(jump) }
                    }
                }
            }
            // Diagonal captures
            if (c !== 0) {
                // can't capture allied piece
                if (move_cell.pieceColor === color) {
                    console.log('Allied diagonal cell')
                }
                // can't capture if the diagonal cell is empty, but might be able to en passant
                else if (move_cell.pieceColor === 'none') {
                    // En passant can only be done on rank 5
                    if (rank === 5 && last_move.length == 5) {
                        let adj = { row: row, col: col + c }
                        let adj_cell = board[this.rowColToIndex(adj.row, adj.col)]

                        // Can only en passant if adjacent piece is of the opposite color 
                        if (adj_cell.pieceColor !== color && adj_cell.pieceColor !== 'none') {
                            let last_piece = last_move.slice(0, 1)
                            let last_src = last_move.slice(1, 3)
                            let last_dest = last_move.slice(3, 5)

                            let isPawnMove: boolean = last_piece.toLowerCase() === 'p'
                            let isAdjDest: boolean = last_dest === adj_cell.coordinate
                            let isJumpMove: boolean =
                                this.rowFromCoord(last_src) === adj.row + direction * 2 &&
                                this.colFromCoord(last_src) === adj.col

                            if (isPawnMove && isAdjDest && isJumpMove) {
                                moves.push(move)
                            }
                        }
                    }
                }
                // can capture if the diagonal piece is of a opposite color
                else {
                    if (move.row === 8 || move.row === 1) {
                        let possible_promotion: Piece[] = ['queen', 'rook', 'knight', 'bishop']
                        for (let i = 0; i < possible_promotion.length; i++) {
                            moves.push({...move, promotion: possible_promotion[i]})
                        }
                    }
                    else {
                        moves.push(move)
                    }
                }
            }
        }

        return moves
    }
    getKingMoves(board: Cell[], index: number): { row: number, col: number }[] {
        const cell = board[index]
        const color = cell.pieceColor
        const row = cell.row
        const col = cell.col
        const castleable = cell.castleable
        const moves = []

        for (let i = -1; i <= 1; i = i + 2) {
            // Diagonal moves (upper right, upper left, lower right, lower left)
            inner: for (let j = -1; j <= 1; j = j + 2) {
                let t_row = row + i, t_col = col + j
                if (this.outOfBound(t_row, t_col)) { continue inner }
                if (board[this.rowColToIndex(t_row, t_col)].pieceColor === color) { continue inner }
                moves.push({ row: row + i, col: col + j })
            }
            // Horizontal moves (left, right)
            let x_row = row, x_col = col + i
            if (!this.outOfBound(x_row, x_col) && board[this.rowColToIndex(x_row, x_col)].pieceColor !== color) {
                moves.push({ row: x_row, col: x_col })
            }
            // Vertical moves (up, down)
            let y_row = row + i, y_col = col
            if (!this.outOfBound(y_row, y_col) && board[this.rowColToIndex(y_row, y_col)].pieceColor !== color) {
                moves.push({ row: y_row, col: y_col })
            }
        }

        // Castling
        if (castleable && (index == 4 || index == 60)) {
            short_side_castle: for (let c = 1; c <= 3; c++) {
                let target_move = { row: row, col: col + c }
                let target_cell = board[this.rowColToIndex(target_move.row, target_move.col)]
                // can only castle if there must be no in-between pieces
                if (c < 3 && target_cell.piece !== 'none') { break short_side_castle }
                // can only castle with a rook that has not move
                if (c === 3 && target_cell.piece === 'rook' && target_cell.castleable) {
                    moves.push({ row: row, col: col + 2 })
                }
            }
            long_side_castle: for (let c = 1; c <= 4; c++) {
                let target_move = { row: row, col: col - c }
                let target_cell = board[this.rowColToIndex(target_move.row, target_move.col)]
                // can only castle if there must be no in-between pieces
                if (c < 4 && target_cell.piece !== 'none') { break long_side_castle }
                // can only castle with a rook that has not move
                if (c === 4 && target_cell.piece === 'rook' && target_cell.castleable) {
                    moves.push({ row: row, col: col - 2 })
                }
            }
        }


        return moves
    }
    getQueenMoves(board: Cell[], index: number): { row: number, col: number }[] {
        let rook_moves = this.getRookMoves(board, index)
        let bishop_moves = (this.getBishopMoves(board, index))
        return [...rook_moves, ...bishop_moves]
    }
}