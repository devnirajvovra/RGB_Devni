import { DEFAULT_BORDER_COLOR } from '../shared/def-constants';
import { IResponseData, ICell, IGameUi } from '../shared/interfaces';
import { SourcePositionEnum, CellTypeEnum } from '../shared/enums'


/**
 * Sets the initial field with the retrieved information of the server
 * @param initialData Initial information of the game
 * @returns a matrix of cells
 */
export const generateInitialField = (initialData: IResponseData): ICell[][] => {
    const initialField: ICell[][] = [];
    const initialHeight = initialData.height;
    const initialWidth = initialData.width;
    let type: CellTypeEnum;

    if (initialHeight === 0 || initialWidth === 0) {
        return [];
    }

    for (let y = 0; y < initialHeight + 2; y++) {
        initialField[y] = [];

        for (let x = 0; x < initialWidth + 2; x++) {
            if (x === 0 || y === 0 || x > initialWidth || y > initialHeight) {
                if (
                    (x === 0 && y === 0) ||
                    (x === 0 && y === initialHeight + 1) ||
                    (x === initialWidth + 1 && y === 0) ||
                    (x === initialWidth + 1 && y === initialHeight + 1)
                ) {
                    type = CellTypeEnum.EMPTY;
                } else {
                    type = CellTypeEnum.SOURCE;
                }
            } else {
                type = CellTypeEnum.TILE;
            }

            let cell: ICell = {
                id: x + "," + y,
                color: [0, 0, 0],
                borderColor: DEFAULT_BORDER_COLOR,
                type: type,
                isDnDEnabled: false,
            };

            initialField[y][x] = cell;
        }
    }

    return initialField;
};


/**
 * Gets X axis position of the cell
 * 
 * @param cellId id of the cell
 * @returns a number of the x coordinate
 */
export const getCellX = (cellId: string) => {
    const coords = cellId.split(',');
    return Number(coords[0]);
};

/**
 * Gets y axis position of the cell
 * 
 * @param cellId id of the cell
 * @returns a number of the y coordinate
 */
export const getCellY = (cellId: string) => {
    const coords = cellId.split(',');
    return Number(coords[1]);
};

export const getSourcePosition = (sourceCellId: string, data: IGameUi) => {
    const sourceX = getCellX(sourceCellId);
    const sourceY = getCellY(sourceCellId);
    let position;

    if (sourceX === 0) {
        position = SourcePositionEnum.LEFT;
    } else if (sourceX === Number(data.initial?.width) + 1) {
        position = SourcePositionEnum.RIGHT;
    } else if (sourceY === 0) {
        position = SourcePositionEnum.TOP;
    } else {
        position = SourcePositionEnum.BOTTOM;
    }

    return position;
};

/**
 * Check which is the new color according to the formula
 * 
 * @param color color of the cell
 * @param distance distance in the row/column
 * @param dimension 
 * @returns a new color
 */
export const calculateTileColor = (
    color: number[],
    distance: number,
    dimension: number
): number[] => {
    const k = (dimension + 1 - distance) / (dimension + 1);

    return color.map((componentColor) => componentColor * k);
};

/**
 * When the user selects a new tile
 * the color of the line needs to change
 * @see ProjectInfo for more details
 * 
 * @param data state of the board
 * @param sourceCellId cell dragged
 * @param updatedField cells row/column to change
 * @returns nothin
 */
export const updatedBoardTilesByLine = (
  data: IGameUi,
  sourceCellId: string,
  updatedField: ICell[][]
) => {
    const sourceX = getCellX(sourceCellId);
    const sourceY = getCellY(sourceCellId);
    const selectedSourcePosition = getSourcePosition(sourceCellId, data);
    const height = Number(data.initial?.height);
    const width = Number(data.initial?.width);

    switch (selectedSourcePosition) {
        case SourcePositionEnum.TOP:
            for (let currentCellY = 1; currentCellY <= height; currentCellY++) {
                const currentCellX = sourceX;
                paintCellInScaledColors(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    height,
                    width
                );
            }
        break;

        case SourcePositionEnum.RIGHT:
            for (let currentCellX = width; currentCellX > 0; currentCellX--) {
                const currentCellY = sourceY;
                paintCellInScaledColors(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    height,
                    width
                );
            }
        break;

        case SourcePositionEnum.BOTTOM:
            for (let currentCellY = height; currentCellY > 0; currentCellY--) {
                const currentCellX = sourceX;
                paintCellInScaledColors(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    height,
                    width
                );
            }
        break;

        case SourcePositionEnum.LEFT:
        default:
            for (let currentCellX = 0; currentCellX <= width; currentCellX++) {
                const currentCellY = sourceY;
                paintCellInScaledColors(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    height,
                    width
                );
            }
        }

    return updatedField;
};

/**
 * Calcualtes the new color of the cells
 * There is a special case in which a tile is selected by multiple sources, the next formula must be used to do that:
 * r = r_1 + r_2 + r_3 + r_4
 * g = g_1 + g_2 + g_3 + g_4
 * b = b_1 + b_2 + b_3 + b_4
 * f = 255/max(r,g,b,255)
 * Result = rgb(r×f,g×f,b×f)
 * 
 * "f" represent a normalization factor which makes sure that the resulting does not surpases the 255 number
 * in the RGB scale
 * 
 * 
 * @param updatedField 
 * @param currentCellX 
 * @param currentCellY 
 * @param height 
 * @param width 
 */

const paintCellInScaledColors = (
    updatedField: ICell[][],
    currentCellX: number,
    currentCellY: number,
    height: number,
    width: number
) => {
    let currentCellColorList = [];

    // Iterates the next 4 sources affected by the current cell color
    for (let position = 0; position < 4; position++) {
        let sourceColor;

        switch (position) {
            case SourcePositionEnum.TOP:
                sourceColor = getSourceColorByCellCoordsAndSourcePosition(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    position
                );

                currentCellColorList.push(
                    calculateTileColor(sourceColor, currentCellY, height)
                );
            break;

            case SourcePositionEnum.RIGHT:
                sourceColor = getSourceColorByCellCoordsAndSourcePosition(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    position
                );

                currentCellColorList.push(
                    calculateTileColor(sourceColor, width - currentCellX + 1, width)
                );
            break;
            case SourcePositionEnum.BOTTOM:
                sourceColor = getSourceColorByCellCoordsAndSourcePosition(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    position
                );

                currentCellColorList.push(
                    calculateTileColor(sourceColor, height - currentCellY + 1, height)
                );
            break;

        case SourcePositionEnum.LEFT:
            default:
                sourceColor = getSourceColorByCellCoordsAndSourcePosition(
                    updatedField,
                    currentCellX,
                    currentCellY,
                    position
                );

                currentCellColorList.push(
                    calculateTileColor(sourceColor, currentCellX, width)
                );
            break; 
        }
    }

    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < currentCellColorList.length; i++) {
        r += currentCellColorList[i][0];
        g += currentCellColorList[i][1];
        b += currentCellColorList[i][2];
    }

    const f = 255 / Math.max(r, g, b, 255);
    const cellMixedColor = [r * f, g * f, b * f];

    updatedField[currentCellY][currentCellX] = {
        ...updatedField[currentCellY][currentCellX],
        color: cellMixedColor,
    };
};

/**
 * Whe need to get a copy from the field to have its value
 * and not its reference
 * @param field board cells we are using
 * @returns 
 */
export const getFieldCopy = (field: ICell[][]) => {
    let newFieldState: ICell[][] = [];

    for (let y = 0; y < field.length; y++) {
        newFieldState[y] = [];
        for (let x = 0; x < field[y].length; x++) {
            newFieldState[y][x] = { ...field[y][x] };
        }
    }

    return newFieldState;
};


export const getCellColor = (field: ICell[][], cellId: string) => {
    const x = getCellX(cellId);
    const y = getCellY(cellId);

    return field[y][x].color;
};

export const getSourceColorByCellCoordsAndSourcePosition = (
    updatedField: ICell[][],
    currentCellX: number,
    currentCellY: number,
    position: number
) => {
    let fullLineLength;
    switch (position) {
        case SourcePositionEnum.TOP:
            return updatedField[0][currentCellX].color;
        case SourcePositionEnum.BOTTOM:
            fullLineLength = updatedField.length - 1;
            return updatedField[fullLineLength][currentCellX].color;
        case SourcePositionEnum.RIGHT:
            fullLineLength = updatedField[currentCellY].length - 1;
            return updatedField[currentCellY][fullLineLength].color;
        case SourcePositionEnum.LEFT:
        default:
            return updatedField[currentCellY][0].color;
    }
};
