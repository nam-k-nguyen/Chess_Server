export interface Cell {
    index: number | null,
    row: number | null,
    col: number | null,
    coordinate: string | null,
    piece:  'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king' | 'none' | null,
    pieceColor: string | null,
    cellColor: string | null,
    castleable?: true | false | null
}