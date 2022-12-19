import { CellTypeEnum, GameStatusEnum } from './enums';

export interface IResponseData {
    userId: string;
    width: number;
    height: number;
    maxMoves: number;
    target: number[];
}
  
export interface ICell {
    id: string;
    color: number[];
    borderColor: number[];
    type: CellTypeEnum;
    isDnDEnabled: boolean;
}
  
export interface ITileProps {
    cell: ICell;
}
  
export interface IGameState {
    closestColor: number[];
    status: GameStatusEnum;
    stepCount: number;
    nextColor: number[];
    isDnDEnabled: boolean;
}
  
  export interface IGameUi {
    initial?: IResponseData;
    game?: IGameState;
  }

export  interface ICellProps {
	cell: ICell;
	gameStatus?: GameStatusEnum;
  	onSourceClick(cellId: string): void;
	onCellDrop(e: DragEvent, cellId: string): void;
}

export interface IDnDProps {
	cell: ICell;
	gameStatus?: GameStatusEnum;
	onSourceClick(cellId: string): void;
	onCellDrop(e: DragEvent, cellId: string): void;
}

export interface IDragDrop {
	$color?: number[];
	$clickable?: boolean;
}

/**
 * The properties of the field have some actions that are tiggered
 * when clicked or moved to another cell
 */
export interface IFieldProps {
	data: IGameUi;
	field: ICell[][];
	onSourceClick(cellId: string): void;
	onCellDrop(event: DragEvent, cellId: string): void;
}